import os
import io
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse

from .models import (
    Candidate, JobDescription, MatchScore, CandidateFilterParams,
    UpdateStageRequest, AddNoteRequest, BulkEmailRequest, SentEmailRecord,
    DuplicateResolutionRequest
)
from .parser import ResumeParser
from .matcher import MatcherEngine
from .duplicates import DuplicateDetector
from .email_service import EmailService, DEFAULT_TEMPLATES
from .db import db

app = FastAPI(
    title="HireSwift ATS API",
    description="Smart Applicant Tracking System API for Small Teams",
    version="1.0.0"
)

# Enable CORS for Vite dev server & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
SAMPLE_RESUMES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sample_resumes")
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(SAMPLE_RESUMES_DIR, exist_ok=True)

# ----------------- RESUME UPLOAD & PARSING -----------------

@app.post("/api/resumes/upload-bulk")
async def upload_resumes_bulk(
    files: List[UploadFile] = File(...),
    applied_job_id: Optional[str] = Form(None)
):
    """Bulk upload PDF and DOCX resumes, parse into structured profiles, detect duplicates."""
    uploaded_results = []
    duplicate_count = 0

    for file in files:
        try:
            content = await file.read()
            # Save file to disk
            save_path = os.path.join(UPLOADS_DIR, file.filename)
            with open(save_path, "wb") as f:
                f.write(content)

            # Parse resume into structured profile
            parsed_data = ResumeParser.parse_resume(content, file.filename)
            
            # Create Candidate instance
            candidate = Candidate(
                **parsed_data,
                applied_job_id=applied_job_id
            )

            # Run Duplicate Detection against all existing candidates
            is_dup, reasons, matched_id = DuplicateDetector.check_duplicate(candidate, db.get_candidates())
            if is_dup:
                candidate.is_duplicate = True
                candidate.duplicate_reasons = reasons
                candidate.duplicate_of_id = matched_id
                duplicate_count += 1

            saved_candidate = db.add_candidate(candidate)
            uploaded_results.append({
                "status": "success",
                "file_name": file.filename,
                "candidate": saved_candidate,
                "is_duplicate": is_dup,
                "duplicate_reasons": reasons
            })
        except Exception as e:
            uploaded_results.append({
                "status": "error",
                "file_name": file.filename,
                "error": str(e)
            })

    return {
        "total_uploaded": len(files),
        "successful": len([r for r in uploaded_results if r["status"] == "success"]),
        "duplicates_detected": duplicate_count,
        "results": uploaded_results
    }

# ----------------- CANDIDATES API -----------------

@app.get("/api/candidates")
def get_candidates(
    job_id: Optional[str] = None,
    search: Optional[str] = None,
    skills: Optional[str] = None, # comma-separated
    skill_mode: Optional[str] = "any", # any or all
    min_exp: Optional[float] = None,
    max_exp: Optional[float] = None,
    min_tenth: Optional[float] = None,
    min_twelfth: Optional[float] = None,
    min_cgpa: Optional[float] = None,
    min_grad_year: Optional[int] = None,
    max_grad_year: Optional[int] = None,
    location: Optional[str] = None,
    stage: Optional[str] = None,
    min_score: Optional[float] = None,
    sort_by: Optional[str] = "score", # score, exp, cgpa, name, date
    sort_order: Optional[str] = "desc"
):
    """Retrieve candidates with multi-faceted filtering, ranking, and AI scoring."""
    all_candidates = db.get_candidates()
    active_job = db.get_job(job_id) if job_id else (db.get_jobs()[0] if db.get_jobs() else None)

    # 1. Compute match scores for all candidates if job exists
    candidate_items = []
    for cand in all_candidates:
        score_obj = MatcherEngine.match_candidate_to_job(cand, active_job) if active_job else None
        candidate_items.append({
            "candidate": cand,
            "match_score": score_obj
        })

    # 2. Filter by Search Query
    if search:
        q = search.lower().strip()
        filtered = []
        for item in candidate_items:
            c = item["candidate"]
            text_match = (
                q in c.name.lower() or
                q in c.email.lower() or
                q in (c.location or "").lower() or
                any(q in s.lower() for s in c.skills) or
                q in (c.education.college or "").lower() or
                q in (c.education.degree or "").lower() or
                q in c.raw_text.lower()
            )
            if text_match:
                filtered.append(item)
        candidate_items = filtered

    # 3. Filter by Skills
    if skills:
        skill_list = [s.strip().lower() for s in skills.split(",") if s.strip()]
        if skill_list:
            filtered = []
            for item in candidate_items:
                c_skills = {s.lower() for s in item["candidate"].skills}
                if skill_mode == "all":
                    match = all(s in c_skills for s in skill_list)
                else: # any
                    match = any(s in c_skills for s in skill_list)
                if match:
                    filtered.append(item)
            candidate_items = filtered

    # 4. Filter by Experience
    if min_exp is not None:
        candidate_items = [item for item in candidate_items if item["candidate"].years_of_experience >= min_exp]
    if max_exp is not None:
        candidate_items = [item for item in candidate_items if item["candidate"].years_of_experience <= max_exp]

    # 5. Filter by Academics
    if min_tenth is not None:
        candidate_items = [
            item for item in candidate_items
            if item["candidate"].education.tenth_percentage is not None and item["candidate"].education.tenth_percentage >= min_tenth
        ]
    if min_twelfth is not None:
        candidate_items = [
            item for item in candidate_items
            if item["candidate"].education.twelfth_percentage is not None and item["candidate"].education.twelfth_percentage >= min_twelfth
        ]
    if min_cgpa is not None:
        candidate_items = [
            item for item in candidate_items
            if item["candidate"].education.cgpa is not None and item["candidate"].education.cgpa >= min_cgpa
        ]
    if min_grad_year is not None:
        candidate_items = [
            item for item in candidate_items
            if item["candidate"].education.graduation_year is not None and item["candidate"].education.graduation_year >= min_grad_year
        ]
    if max_grad_year is not None:
        candidate_items = [
            item for item in candidate_items
            if item["candidate"].education.graduation_year is not None and item["candidate"].education.graduation_year <= max_grad_year
        ]

    # 6. Filter by Location
    if location and location.lower() != "all":
        candidate_items = [
            item for item in candidate_items
            if location.lower() in (item["candidate"].location or "").lower()
        ]

    # 7. Filter by Pipeline Stage
    if stage and stage.lower() != "all":
        candidate_items = [
            item for item in candidate_items
            if item["candidate"].stage.lower() == stage.lower()
        ]

    # 8. Filter by Min Score
    if min_score is not None:
        candidate_items = [
            item for item in candidate_items
            if item["match_score"] and item["match_score"].overall_score >= min_score
        ]

    # 9. Sorting
    is_desc = (sort_order.lower() == "desc")
    if sort_by == "score":
        candidate_items.sort(
            key=lambda x: (x["match_score"].overall_score if x["match_score"] else 0.0),
            reverse=is_desc
        )
    elif sort_by == "exp":
        candidate_items.sort(
            key=lambda x: x["candidate"].years_of_experience,
            reverse=is_desc
        )
    elif sort_by == "cgpa":
        candidate_items.sort(
            key=lambda x: (x["candidate"].education.cgpa or 0.0),
            reverse=is_desc
        )
    elif sort_by == "tenth":
        candidate_items.sort(
            key=lambda x: (x["candidate"].education.tenth_percentage or 0.0),
            reverse=is_desc
        )
    elif sort_by == "twelfth":
        candidate_items.sort(
            key=lambda x: (x["candidate"].education.twelfth_percentage or 0.0),
            reverse=is_desc
        )
    elif sort_by == "name":
        candidate_items.sort(
            key=lambda x: x["candidate"].name.lower(),
            reverse=is_desc
        )
    elif sort_by == "date":
        candidate_items.sort(
            key=lambda x: x["candidate"].created_at,
            reverse=is_desc
        )

    return {
        "active_job": active_job,
        "total_count": len(candidate_items),
        "candidates": candidate_items
    }

@app.get("/api/candidates/{candidate_id}")
def get_candidate_detail(candidate_id: str, job_id: Optional[str] = None):
    cand = db.get_candidate(candidate_id)
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    active_job = db.get_job(job_id) if job_id else (db.get_jobs()[0] if db.get_jobs() else None)
    match_score = MatcherEngine.match_candidate_to_job(cand, active_job) if active_job else None

    # Check if duplicate of another candidate
    duplicate_of_candidate = None
    if cand.duplicate_of_id:
        duplicate_of_candidate = db.get_candidate(cand.duplicate_of_id)

    return {
        "candidate": cand,
        "match_score": match_score,
        "active_job": active_job,
        "duplicate_of_candidate": duplicate_of_candidate
    }

@app.patch("/api/candidates/{candidate_id}/stage")
def update_candidate_stage(candidate_id: str, req: UpdateStageRequest):
    cand = db.get_candidate(candidate_id)
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    updates = {"stage": req.stage}
    if req.rejection_reason is not None:
        updates["rejection_reason"] = req.rejection_reason
    elif req.stage != "Rejected":
        updates["rejection_reason"] = None

    updated = db.update_candidate(candidate_id, updates)
    return {"status": "success", "candidate": updated}

@app.post("/api/candidates/{candidate_id}/notes")
def add_candidate_note(candidate_id: str, req: AddNoteRequest):
    cand = db.get_candidate(candidate_id)
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    from .models import CandidateNote
    note = CandidateNote(author=req.author or "Recruiter", content=req.content)
    cand.notes.append(note)
    db.save_to_disk()
    return {"status": "success", "notes": cand.notes}

@app.delete("/api/candidates/{candidate_id}")
def delete_candidate(candidate_id: str):
    success = db.delete_candidate(candidate_id)
    if not success:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return {"status": "success", "message": "Candidate deleted"}

# ----------------- JOB DESCRIPTIONS API -----------------

@app.get("/api/jobs")
def get_jobs():
    jobs = db.get_jobs()
    candidates = db.get_candidates()
    
    # Calculate stats per job
    job_stats = []
    for job in jobs:
        # Match scores
        scored = [MatcherEngine.match_candidate_to_job(c, job).overall_score for c in candidates]
        avg_score = round(sum(scored) / len(scored), 1) if scored else 0.0
        strong_matches = len([s for s in scored if s >= 80.0])
        
        job_stats.append({
            "job": job,
            "applicant_count": len(candidates),
            "average_match_score": avg_score,
            "strong_matches": strong_matches,
            "stages": {
                "Applied": len([c for c in candidates if c.stage == "Applied"]),
                "Shortlisted": len([c for c in candidates if c.stage == "Shortlisted"]),
                "Interview": len([c for c in candidates if c.stage == "Interview"]),
                "Offer": len([c for c in candidates if c.stage == "Offer"]),
                "Rejected": len([c for c in candidates if c.stage == "Rejected"]),
            }
        })
    return {"jobs": job_stats}

@app.post("/api/jobs")
def create_job(job: JobDescription):
    created = db.add_job(job)
    return {"status": "success", "job": created}

@app.get("/api/jobs/{job_id}")
def get_job_detail(job_id: str):
    job = db.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found")
    return job

@app.put("/api/jobs/{job_id}")
def update_job(job_id: str, updates: Dict[str, Any]):
    updated = db.update_job(job_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Job description not found")
    return {"status": "success", "job": updated}

@app.delete("/api/jobs/{job_id}")
def delete_job(job_id: str):
    success = db.delete_job(job_id)
    if not success:
        raise HTTPException(status_code=404, detail="Job description not found")
    return {"status": "success", "message": "Job description deleted"}

# ----------------- SIDE-BY-SIDE COMPARISON API -----------------

@app.post("/api/candidates/compare")
def compare_candidates(payload: Dict[str, Any]):
    """Compare 2 to 4 candidates side-by-side against a Job Description."""
    candidate_ids = payload.get("candidate_ids", [])
    job_id = payload.get("job_id")

    if not candidate_ids or len(candidate_ids) < 2:
        raise HTTPException(status_code=400, detail="Please select at least 2 candidates to compare")

    job = db.get_job(job_id) if job_id else (db.get_jobs()[0] if db.get_jobs() else None)
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found")

    selected_candidates = [db.get_candidate(cid) for cid in candidate_ids if db.get_candidate(cid)]
    if len(selected_candidates) < 2:
        raise HTTPException(status_code=400, detail="Candidates not found")

    # Match scores
    comparison_data = []
    all_candidate_skills = []
    for cand in selected_candidates:
        score = MatcherEngine.match_candidate_to_job(cand, job)
        comparison_data.append({
            "candidate": cand,
            "score": score
        })
        all_candidate_skills.append(set(cand.skills))

    # Calculate skill overlaps
    common_skills = list(set.intersection(*all_candidate_skills)) if all_candidate_skills else []
    
    # Skills unique to each candidate
    unique_skills_per_candidate = {}
    for i, cand in enumerate(selected_candidates):
        other_skills = set().union(*[all_candidate_skills[j] for j in range(len(selected_candidates)) if j != i])
        unique_skills_per_candidate[cand.id] = list(set(cand.skills) - other_skills)

    # Missing from all
    required_set = set(job.required_skills)
    missing_from_all = list(required_set - set().union(*all_candidate_skills))

    return {
        "job": job,
        "candidates": comparison_data,
        "skills_matrix": {
            "common_skills": common_skills,
            "unique_skills": unique_skills_per_candidate,
            "missing_from_all_required": missing_from_all
        }
    }

# ----------------- DUPLICATES API -----------------

@app.get("/api/duplicates")
def get_duplicates():
    all_candidates = db.get_candidates()
    duplicates = [c for c in all_candidates if c.is_duplicate]
    results = []
    for dup in duplicates:
        orig = db.get_candidate(dup.duplicate_of_id) if dup.duplicate_of_id else None
        results.append({
            "duplicate_candidate": dup,
            "original_candidate": orig,
            "reasons": dup.duplicate_reasons
        })
    return {"total_duplicates": len(results), "duplicates": results}

@app.post("/api/duplicates/resolve")
def resolve_duplicate(req: DuplicateResolutionRequest):
    cand = db.get_candidate(req.candidate_id)
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")

    if req.action == "keep_both":
        db.update_candidate(cand.id, {"is_duplicate": False, "duplicate_reasons": []})
        return {"status": "success", "message": "Marked candidate as distinct profile"}

    elif req.action == "delete":
        db.delete_candidate(cand.id)
        return {"status": "success", "message": "Duplicate candidate profile removed"}

    elif req.action == "merge":
        # Merge newer info into original candidate
        target_id = req.target_candidate_id or cand.duplicate_of_id
        target = db.get_candidate(target_id)
        if not target:
            raise HTTPException(status_code=404, detail="Target candidate to merge into not found")

        # Union of skills
        merged_skills = sorted(list(set(target.skills + cand.skills)))
        merged_notes = target.notes + cand.notes
        
        # Keep higher experience if updated
        merged_exp = max(target.years_of_experience, cand.years_of_experience)

        db.update_candidate(target.id, {
            "skills": merged_skills,
            "years_of_experience": merged_exp,
            "notes": merged_notes
        })
        # Delete duplicate
        db.delete_candidate(cand.id)
        return {"status": "success", "message": f"Successfully merged profile into '{target.name}'"}

    raise HTTPException(status_code=400, detail="Invalid action")

# ----------------- BULK EMAIL API -----------------

@app.get("/api/email/templates")
def get_email_templates():
    return DEFAULT_TEMPLATES

@app.post("/api/email/bulk")
def send_bulk_emails(req: BulkEmailRequest):
    all_candidates = db.get_candidates()
    active_job = db.get_job(req.job_title) if req.job_title else (db.get_jobs()[0] if db.get_jobs() else None)
    job_title = active_job.title if active_job else "Software Engineer"
    
    sent_records = EmailService.send_bulk_emails(
        request=req,
        candidates=all_candidates,
        active_job_title=job_title
    )
    db.add_sent_emails(sent_records)

    return {
        "status": "success",
        "total_sent": len(sent_records),
        "sent_records": sent_records
    }

@app.get("/api/email/history")
def get_email_history():
    return {"emails": db.get_sent_emails()}

# ----------------- DASHBOARD STATS API -----------------

@app.get("/api/dashboard/stats")
def get_dashboard_stats(job_id: Optional[str] = None):
    candidates = db.get_candidates()
    jobs = db.get_jobs()
    active_job = db.get_job(job_id) if job_id else (jobs[0] if jobs else None)

    # Match scores for active job
    scores = []
    top_candidates = []
    for c in candidates:
        if active_job:
            sc = MatcherEngine.match_candidate_to_job(c, active_job)
            scores.append(sc.overall_score)
            top_candidates.append({"candidate": c, "score": sc})
        else:
            top_candidates.append({"candidate": c, "score": None})

    top_candidates.sort(
        key=lambda x: (x["score"].overall_score if x["score"] else 0),
        reverse=True
    )

    # Pipeline stages count
    stage_counts = {
        "Applied": len([c for c in candidates if c.stage == "Applied"]),
        "Shortlisted": len([c for c in candidates if c.stage == "Shortlisted"]),
        "Interview": len([c for c in candidates if c.stage == "Interview"]),
        "Offer": len([c for c in candidates if c.stage == "Offer"]),
        "Rejected": len([c for c in candidates if c.stage == "Rejected"]),
    }

    # Skill occurrences
    all_skills = {}
    for c in candidates:
        for s in c.skills:
            all_skills[s] = all_skills.get(s, 0) + 1
    
    popular_skills = sorted(all_skills.items(), key=lambda x: x[1], reverse=True)[:10]

    return {
        "total_candidates": len(candidates),
        "total_jobs": len(jobs),
        "active_job": active_job,
        "stage_counts": stage_counts,
        "duplicates_count": len([c for c in candidates if c.is_duplicate]),
        "average_match_score": round(sum(scores) / len(scores), 1) if scores else 0.0,
        "high_match_count": len([s for s in scores if s >= 80.0]),
        "top_candidates": top_candidates[:5],
        "popular_skills": popular_skills
    }

# ----------------- SYSTEM SEEDING & RESET -----------------

@app.post("/api/system/reset-demo")
def reset_demo_data():
    """Resets entire database with pristine sample jobs, sample candidates, and duplicate scenarios."""
    db.seed_default_data(force=True)
    return {
        "status": "success",
        "message": "Demo data successfully reloaded with sample jobs, candidates, and duplicate profiles.",
        "candidate_count": len(db.get_candidates()),
        "job_count": len(db.get_jobs())
    }

@app.get("/api/resumes/sample-files")
def list_sample_files():
    """List available sample PDF and DOCX files for quick download/test."""
    files = []
    if os.path.exists(SAMPLE_RESUMES_DIR):
        for fname in os.listdir(SAMPLE_RESUMES_DIR):
            fpath = os.path.join(SAMPLE_RESUMES_DIR, fname)
            if os.path.isfile(fpath):
                files.append({
                    "filename": fname,
                    "size_kb": round(os.path.getsize(fpath) / 1024, 1),
                    "ext": fname.split(".")[-1].lower()
                })
    return {"files": files}

@app.get("/api/resumes/sample-files/{filename}")
def download_sample_file(filename: str):
    fpath = os.path.join(SAMPLE_RESUMES_DIR, filename)
    if not os.path.exists(fpath):
        raise HTTPException(status_code=404, detail="Sample resume file not found")
    return FileResponse(fpath, filename=filename)

# Mount Vite frontend build if available
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")
