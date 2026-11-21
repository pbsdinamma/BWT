import os
import io
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, BackgroundTasks, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse

from .models import (
    Candidate, JobDescription, MatchScore, CandidateFilterParams,
    UpdateStageRequest, AddNoteRequest, BulkEmailRequest, SentEmailRecord,
    DuplicateResolutionRequest, Company, CompanyRegisterRequest, CompanyLoginRequest,
    JobStatusUpdateRequest, JobExtendDeadlineRequest, UpdateCandidateProfileRequest,
    LoadSampleResumesRequest
)
from .parser import ResumeParser
from .matcher import MatcherEngine
from .duplicates import DuplicateDetector
from .email_service import EmailService, DEFAULT_TEMPLATES
from .db import db, hash_password, verify_password, DEMO_COMPANY_ID

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

def resolve_company(authorization: Optional[str] = Header(None), token: Optional[str] = Query(None)) -> Optional[Company]:
    extracted = None
    if isinstance(authorization, str) and authorization.strip():
        auth_clean = authorization.strip()
        if auth_clean.lower().startswith("bearer "):
            extracted = auth_clean[7:].strip()
        else:
            extracted = auth_clean
    elif isinstance(token, str) and token.strip():
        extracted = token.strip()
        
    if extracted:
        comp = db.get_company_by_token(extracted)
        if comp:
            return comp
    return None

def require_company(authorization: Optional[str] = Header(None), token: Optional[str] = Query(None)) -> Company:
    comp = resolve_company(authorization, token)
    if not comp:
        raise HTTPException(
            status_code=401,
            detail="Authentication required. Please sign in with your company account."
        )
    return comp

# ----------------- AUTHENTICATION API -----------------

@app.post("/api/auth/register")
def register_company(req: CompanyRegisterRequest):
    """Register a new company account."""
    if not req.work_email or "@" not in req.work_email:
        raise HTTPException(status_code=400, detail="A valid company work email is required")
    if not req.company_name:
        raise HTTPException(status_code=400, detail="Company name is required")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    existing = db.get_company_by_email(req.work_email)
    if existing:
        raise HTTPException(status_code=400, detail="A company with this email address already exists")

    new_company = Company(
        company_name=req.company_name,
        work_email=req.work_email,
        password_hash=hash_password(req.password),
        recruiter_name=req.recruiter_name or "Talent Lead",
        company_size=req.company_size or "11-50",
        industry=req.industry or "Technology",
        website=req.website or ""
    )
    db.add_company(new_company)
    token = db.create_session(new_company.id)

    return {
        "status": "success",
        "message": "Company account successfully registered",
        "token": token,
        "company": {
            "id": new_company.id,
            "company_name": new_company.company_name,
            "work_email": new_company.work_email,
            "recruiter_name": new_company.recruiter_name,
            "company_size": new_company.company_size,
            "industry": new_company.industry,
            "website": new_company.website,
            "created_at": new_company.created_at
        }
    }

@app.post("/api/auth/login")
def login_company(req: CompanyLoginRequest):
    """Authenticate company by work email and password."""
    company = db.get_company_by_email(req.work_email)
    if not company:
        raise HTTPException(status_code=401, detail="No registered company found with this email")
    if not verify_password(req.password, company.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = db.create_session(company.id)
    return {
        "status": "success",
        "token": token,
        "company": {
            "id": company.id,
            "company_name": company.company_name,
            "work_email": company.work_email,
            "recruiter_name": company.recruiter_name,
            "company_size": company.company_size,
            "industry": company.industry,
            "website": company.website,
            "created_at": company.created_at
        }
    }

@app.get("/api/auth/me")
def get_current_company(
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None)
):
    """Fetch profile of logged in company."""
    company = resolve_company(authorization, token)
    if not company:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")

    return {
        "status": "success",
        "company": {
            "id": company.id,
            "company_name": company.company_name,
            "work_email": company.work_email,
            "recruiter_name": company.recruiter_name,
            "company_size": company.company_size,
            "industry": company.industry,
            "website": company.website,
            "created_at": company.created_at
        }
    }

@app.post("/api/auth/logout")
def logout_company(token: Optional[str] = Query(None)):
    """Log out company and invalidate session token."""
    if token:
        db.delete_session(token)
    return {"status": "success", "message": "Logged out successfully"}

# ----------------- RESUME UPLOAD & PARSING -----------------

@app.post("/api/resumes/upload-bulk")
async def upload_resumes_bulk(
    files: List[UploadFile] = File(...),
    applied_job_id: Optional[str] = Form(None),
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Form(None)
):
    """Bulk upload PDF and DOCX resumes, parse into structured profiles, detect duplicates."""
    company = require_company(authorization, token)
    uploaded_results = []
    duplicate_count = 0
    company_candidates = db.get_candidates(company_id=company.id)

    for file in files:
        try:
            content = await file.read()
            # Save file to disk
            save_path = os.path.join(UPLOADS_DIR, f"{company.id}_{file.filename}")
            with open(save_path, "wb") as f:
                f.write(content)

            # Parse resume into structured profile with contextual user email
            parsed_data = ResumeParser.parse_resume(content, file.filename, context_email=company.work_email)
            
            # Determine target job assignment (Specific, AI Auto-Routed, or General Pool)
            assigned_job_id = None
            auto_routed_job_title = None

            if applied_job_id and applied_job_id not in ("auto", "pool", "none", "null"):
                assigned_job_id = applied_job_id
            elif applied_job_id == "auto":
                # AI Smart Routing: Find best matching active job for this resume
                active_company_jobs = [j for j in db.get_jobs(company_id=company.id) if j.status != "Closed"]
                if active_company_jobs:
                    scored_jobs = []
                    temp_cand = Candidate(**parsed_data, company_id=company.id)
                    for j in active_company_jobs:
                        ms = MatcherEngine.match_candidate_to_job(temp_cand, j)
                        scored_jobs.append((j, ms.overall_score))
                    scored_jobs.sort(key=lambda x: x[1], reverse=True)
                    best_job, best_score = scored_jobs[0]
                    assigned_job_id = best_job.id
                    auto_routed_job_title = f"{best_job.title} ({round(best_score)}% Match)"

            # Create Candidate instance scoped to current company
            candidate = Candidate(
                **parsed_data,
                applied_job_id=assigned_job_id,
                company_id=company.id
            )

            # Run Duplicate Detection against this company's candidates ONLY
            is_dup, reasons, matched_id = DuplicateDetector.check_duplicate(candidate, company_candidates)
            if is_dup:
                candidate.is_duplicate = True
                candidate.duplicate_reasons = reasons
                candidate.duplicate_of_id = matched_id
                duplicate_count += 1

            saved_candidate = db.add_candidate(candidate)
            company_candidates.append(saved_candidate)
            uploaded_results.append({
                "status": "success",
                "file_name": file.filename,
                "candidate": saved_candidate,
                "is_duplicate": is_dup,
                "duplicate_reasons": reasons,
                "auto_routed_to": auto_routed_job_title
            })
        except Exception as e:
            save_path = os.path.join(UPLOADS_DIR, f"{company.id}_{file.filename}")
            if os.path.exists(save_path):
                try:
                    os.remove(save_path)
                except OSError:
                    pass
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

@app.post("/api/resumes/load-samples")
def load_sample_resumes(
    req: Optional[LoadSampleResumesRequest] = None,
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None)
):
    """Bulk load built-in sample resumes into the active company's ATS workspace."""
    company = require_company(authorization, token)
    company_candidates = db.get_candidates(company_id=company.id)
    active_company_jobs = [j for j in db.get_jobs(company_id=company.id) if j.status != "Closed"]

    if not os.path.exists(SAMPLE_RESUMES_DIR):
        raise HTTPException(status_code=404, detail="Sample resumes directory not found")

    sample_files = [f for f in sorted(os.listdir(SAMPLE_RESUMES_DIR)) if os.path.isfile(os.path.join(SAMPLE_RESUMES_DIR, f))]
    if not sample_files:
        raise HTTPException(status_code=404, detail="No sample resume files available")

    loaded_candidates = []
    duplicate_count = 0
    applied_job_id = req.applied_job_id if req else None

    for fname in sample_files:
        fpath = os.path.join(SAMPLE_RESUMES_DIR, fname)
        try:
            with open(fpath, "rb") as f:
                content = f.read()

            save_name = f"{company.id}_{fname}"
            save_path = os.path.join(UPLOADS_DIR, save_name)
            with open(save_path, "wb") as out_f:
                out_f.write(content)

            parsed_data = ResumeParser.parse_resume(content, fname, context_email=company.work_email)

            assigned_job_id = None
            if applied_job_id and applied_job_id not in ("auto", "pool", "none", "null"):
                assigned_job_id = applied_job_id
            elif applied_job_id == "auto" and active_company_jobs:
                temp_cand = Candidate(**parsed_data, company_id=company.id)
                scored_jobs = []
                for j in active_company_jobs:
                    ms = MatcherEngine.match_candidate_to_job(temp_cand, j)
                    scored_jobs.append((j, ms.overall_score))
                scored_jobs.sort(key=lambda x: x[1], reverse=True)
                if scored_jobs:
                    assigned_job_id = scored_jobs[0][0].id

            cand = Candidate(
                **parsed_data,
                applied_job_id=assigned_job_id,
                company_id=company.id
            )

            is_dup, reasons, matched_id = DuplicateDetector.check_duplicate(cand, company_candidates)
            if is_dup:
                cand.is_duplicate = True
                cand.duplicate_reasons = reasons
                cand.duplicate_of_id = matched_id
                duplicate_count += 1

            saved = db.add_candidate(cand, auto_save=False)
            company_candidates.append(saved)
            loaded_candidates.append(saved)
        except Exception as e:
            print(f"Error parsing sample file {fname}: {e}")
            continue

    if loaded_candidates:
        db.save_to_disk()

    return {
        "status": "success",
        "loaded_count": len(loaded_candidates),
        "duplicates_found": duplicate_count,
        "candidates": loaded_candidates
    }

# ----------------- CANDIDATES API -----------------

@app.get("/api/candidates")
def get_candidates(
    job_id: Optional[str] = None,
    scope: Optional[str] = "job", # "job" = direct role applicants only; "all" = company talent pool
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
    sort_order: Optional[str] = "desc",
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None)
):
    """Retrieve candidates with multi-faceted filtering, ranking, and AI scoring."""
    company = require_company(authorization, token)
    all_candidates = db.get_candidates(company_id=company.id)
    company_jobs = db.get_jobs(company_id=company.id)

    active_job = None
    if job_id:
        j = db.get_job(job_id)
        if j and j.company_id == company.id:
            active_job = j
    elif company_jobs:
        active_job = company_jobs[0]

    job_title_map = {j.id: j.title for j in company_jobs}
    is_single_job = len(company_jobs) <= 1

    # Filter candidate scope: "job" (default: only direct applicants for this opening) vs "all" (entire talent pool)
    if active_job and scope == "job":
        target_candidates = [
            c for c in all_candidates
            if c.applied_job_id == active_job.id or (is_single_job and not c.applied_job_id)
        ]
    else:
        target_candidates = all_candidates

    # 1. Compute match scores for scoped candidates against active job
    from .parser import SKILL_IMPORTANCE_WEIGHTS
    candidate_items = []
    for cand in target_candidates:
        score_obj = MatcherEngine.match_candidate_to_job(cand, active_job) if active_job else None
        
        # When an active job exists, sort candidate skills so job-matched skills come first
        c_to_return = cand
        if active_job and score_obj:
            matched_set = set(score_obj.matched_required_skills + score_obj.matched_preferred_skills)
            cand_copy = cand.model_copy()
            cand_copy.skills = sorted(
                cand.skills,
                key=lambda s: (-1000 if s in matched_set else -SKILL_IMPORTANCE_WEIGHTS.get(s, 50), s)
            )
            c_to_return = cand_copy

        candidate_items.append({
            "candidate": c_to_return,
            "match_score": score_obj,
            "applied_job_title": job_title_map.get(cand.applied_job_id, "General Talent Pool") if cand.applied_job_id else "General Talent Pool"
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

    direct_count = len([c for c in all_candidates if c.applied_job_id == (active_job.id if active_job else None) or (is_single_job and not c.applied_job_id)])
    return {
        "active_job": active_job,
        "scope": scope,
        "total_count": len(candidate_items),
        "total_direct_count": direct_count,
        "total_talent_pool_count": len(all_candidates),
        "candidates": candidate_items
    }

@app.get("/api/candidates/{candidate_id}")
def get_candidate_detail(
    candidate_id: str,
    job_id: Optional[str] = None,
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None)
):
    company = require_company(authorization, token)
    cand = db.get_candidate(candidate_id)
    if not cand or cand.company_id != company.id:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    company_jobs = db.get_jobs(company_id=company.id)
    active_job = None
    if job_id:
        j = db.get_job(job_id)
        if j and j.company_id == company.id:
            active_job = j
    elif company_jobs:
        active_job = company_jobs[0]

    match_score = MatcherEngine.match_candidate_to_job(cand, active_job) if active_job else None

    # Dynamically prioritize skills: JD matched skills first, followed by engineering importance
    from .parser import SKILL_IMPORTANCE_WEIGHTS
    matched_set = set(match_score.matched_required_skills + match_score.matched_preferred_skills) if match_score else set()
    cand_display = cand.model_copy()
    cand_display.skills = sorted(
        cand.skills,
        key=lambda s: (-1000 if s in matched_set else -SKILL_IMPORTANCE_WEIGHTS.get(s, 50), s)
    )

    # Check if duplicate of another candidate
    duplicate_of_candidate = None
    if cand.duplicate_of_id:
        dup = db.get_candidate(cand.duplicate_of_id)
        if dup and dup.company_id == company.id:
            duplicate_of_candidate = dup

    return {
        "candidate": cand_display,
        "match_score": match_score,
        "active_job": active_job,
        "duplicate_of_candidate": duplicate_of_candidate
    }

@app.get("/api/candidates/{candidate_id}/resume")
def get_candidate_resume(
    candidate_id: str,
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None)
):
    """
    Serve authentic candidate PDF resume for viewing directly in the browser.
    Accepts authentication via Bearer token or token query param for browser tab navigation.
    """
    company = require_company(authorization, token)
    cand = db.get_candidate(candidate_id)
    if not cand or cand.company_id != company.id:
        raise HTTPException(status_code=404, detail="Candidate not found")

    fname = cand.file_name or ""
    candidate_files = []
    
    # 1. Check company-scoped file in UPLOADS_DIR
    if fname:
        candidate_files.append(os.path.join(UPLOADS_DIR, f"{company.id}_{fname}"))
        candidate_files.append(os.path.join(UPLOADS_DIR, fname))

    # Also search by company.id and filename in UPLOADS_DIR
    if os.path.exists(UPLOADS_DIR):
        for f in os.listdir(UPLOADS_DIR):
            if f.startswith(f"{company.id}_") and fname and fname.lower() in f.lower():
                candidate_files.append(os.path.join(UPLOADS_DIR, f))

    # 2. Check SAMPLE_RESUMES_DIR
    if os.path.exists(SAMPLE_RESUMES_DIR):
        if fname:
            candidate_files.append(os.path.join(SAMPLE_RESUMES_DIR, fname))
        first_name = cand.name.split()[0].lower() if cand.name else ""
        for sf in os.listdir(SAMPLE_RESUMES_DIR):
            if first_name and first_name in sf.lower():
                candidate_files.append(os.path.join(SAMPLE_RESUMES_DIR, sf))

    # Search for an existing PDF file
    for p in candidate_files:
        if os.path.isfile(p):
            ext = p.split(".")[-1].lower()
            if ext == "pdf":
                download_name = fname if fname.endswith(".pdf") else f"{fname}.pdf"
                return FileResponse(
                    p,
                    media_type="application/pdf",
                    filename=download_name,
                    content_disposition_type="inline"
                )

    # 3. Dynamic PDF Generation Fallback using ReportLab
    gen_filename = f"{company.id}_{cand.id}_generated_resume.pdf"
    gen_path = os.path.join(UPLOADS_DIR, gen_filename)
    try:
        from .pdf_generator import generate_candidate_pdf
        generate_candidate_pdf(cand, gen_path)
        download_name = f"{cand.name.replace(' ', '_')}_resume.pdf"
        return FileResponse(
            gen_path,
            media_type="application/pdf",
            filename=download_name,
            content_disposition_type="inline"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate candidate resume PDF: {str(e)}")

@app.patch("/api/candidates/{candidate_id}")
def update_candidate_profile(
    candidate_id: str,
    req: UpdateCandidateProfileRequest,
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None)
):
    company = require_company(authorization, token)
    cand = db.get_candidate(candidate_id)
    if not cand or cand.company_id != company.id:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    updates = {}
    if req.name is not None and req.name.strip():
        updates["name"] = req.name.strip()
    if req.email is not None and req.email.strip():
        updates["email"] = req.email.strip().lower()
    if req.phone is not None:
        updates["phone"] = req.phone.strip()
    if req.location is not None:
        updates["location"] = req.location.strip()
    if req.skills is not None:
        from .parser import SKILL_IMPORTANCE_WEIGHTS
        updates["skills"] = sorted(req.skills, key=lambda s: (-SKILL_IMPORTANCE_WEIGHTS.get(s, 50), s))
    if req.years_of_experience is not None:
        updates["years_of_experience"] = max(0.0, req.years_of_experience)

    updated = db.update_candidate(candidate_id, updates)
    return {
        "status": "success",
        "message": "Candidate profile updated successfully",
        "candidate": updated
    }

@app.patch("/api/candidates/{candidate_id}/stage")
def update_candidate_stage(
    candidate_id: str,
    req: UpdateStageRequest,
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None)
):
    company = require_company(authorization, token)
    cand = db.get_candidate(candidate_id)
    if not cand or cand.company_id != company.id:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    updates = {"stage": req.stage}
    if req.rejection_reason is not None:
        updates["rejection_reason"] = req.rejection_reason
    elif req.stage != "Rejected":
        updates["rejection_reason"] = None

    updated = db.update_candidate(candidate_id, updates)
    return {"status": "success", "candidate": updated}

@app.post("/api/candidates/{candidate_id}/notes")
def add_candidate_note(
    candidate_id: str,
    req: AddNoteRequest,
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None)
):
    company = require_company(authorization, token)
    cand = db.get_candidate(candidate_id)
    if not cand or cand.company_id != company.id:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    from .models import CandidateNote
    note = CandidateNote(author=req.author or "Recruiter", content=req.content)
    cand.notes.append(note)
    db.save_to_disk()
    return {"status": "success", "notes": cand.notes}

@app.delete("/api/candidates/{candidate_id}")
def delete_candidate(
    candidate_id: str,
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None)
):
    company = require_company(authorization, token)
    cand = db.get_candidate(candidate_id)
    if not cand or cand.company_id != company.id:
        raise HTTPException(status_code=404, detail="Candidate not found")
    db.delete_candidate(candidate_id)
    return {"status": "success", "message": "Candidate deleted"}

# ----------------- JOB DESCRIPTIONS API -----------------

@app.get("/api/jobs")
def get_jobs(
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None)
):
    company = require_company(authorization, token)
    jobs = db.get_jobs(company_id=company.id)
    candidates = db.get_candidates(company_id=company.id)
    
    # Calculate stats per job
    job_stats = []
    is_single_job = len(jobs) <= 1
    for job in jobs:
        direct_cands = [
            c for c in candidates 
            if c.applied_job_id == job.id or (is_single_job and not c.applied_job_id)
        ]
        scored = [MatcherEngine.match_candidate_to_job(c, job).overall_score for c in direct_cands]
        avg_score = round(sum(scored) / len(scored), 1) if scored else 0.0
        strong_matches = len([s for s in scored if s >= 80.0])
        
        job_stats.append({
            "job": job,
            "applicant_count": len(direct_cands),
            "average_match_score": avg_score,
            "strong_matches": strong_matches,
            "stages": {
                "Applied": len([c for c in direct_cands if c.stage == "Applied"]),
                "Shortlisted": len([c for c in direct_cands if c.stage == "Shortlisted"]),
                "Interview": len([c for c in direct_cands if c.stage == "Interview"]),
                "Offer": len([c for c in direct_cands if c.stage == "Offer"]),
                "Rejected": len([c for c in direct_cands if c.stage == "Rejected"]),
            }
        })
    return {"jobs": job_stats}

@app.post("/api/jobs")
def create_job(
    job: JobDescription,
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None)
):
    company = require_company(authorization, token)
    job.company_id = company.id
    created = db.add_job(job)
    return {"status": "success", "job": created}

@app.get("/api/jobs/{job_id}")
def get_job_detail(
    job_id: str,
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None)
):
    company = require_company(authorization, token)
    job = db.get_job(job_id)
    if not job or job.company_id != company.id:
        raise HTTPException(status_code=404, detail="Job description not found")
    return job

@app.put("/api/jobs/{job_id}")
def update_job(
    job_id: str,
    updates: Dict[str, Any],
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None)
):
    company = require_company(authorization, token)
    job = db.get_job(job_id)
    if not job or job.company_id != company.id:
        raise HTTPException(status_code=404, detail="Job description not found")
    updates.pop("company_id", None)
    updated = db.update_job(job_id, updates)
    return {"status": "success", "job": updated}

@app.patch("/api/jobs/{job_id}/status")
def update_job_status(
    job_id: str,
    req: JobStatusUpdateRequest,
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None)
):
    """Toggle job status between Active, Closed, and Draft."""
    company = require_company(authorization, token)
    job = db.get_job(job_id)
    if not job or job.company_id != company.id:
        raise HTTPException(status_code=404, detail="Job description not found")
    
    updates = {"status": req.status}
    if req.application_deadline:
        updates["application_deadline"] = req.application_deadline
        
    updated = db.update_job(job_id, updates)
    return {"status": "success", "job": updated, "message": f"Job status updated to {req.status}"}

@app.patch("/api/jobs/{job_id}/deadline")
def extend_job_deadline(
    job_id: str,
    req: JobExtendDeadlineRequest,
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None)
):
    """Extend or update the application closing deadline for a job."""
    company = require_company(authorization, token)
    job = db.get_job(job_id)
    if not job or job.company_id != company.id:
        raise HTTPException(status_code=404, detail="Job description not found")
    
    updated = db.update_job(job_id, {"application_deadline": req.application_deadline})
    return {"status": "success", "job": updated, "message": f"Application deadline extended to {req.application_deadline}"}

@app.delete("/api/jobs/{job_id}")
def delete_job(
    job_id: str,
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None)
):
    company = require_company(authorization, token)
    job = db.get_job(job_id)
    if not job or job.company_id != company.id:
        raise HTTPException(status_code=404, detail="Job description not found")
    db.delete_job(job_id)
    return {"status": "success", "message": "Job description deleted"}

# ----------------- SIDE-BY-SIDE COMPARISON API -----------------

@app.post("/api/candidates/compare")
def compare_candidates(
    payload: Dict[str, Any],
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None)
):
    """Compare 2 to 4 candidates side-by-side against a Job Description."""
    company = require_company(authorization, token)
    candidate_ids = payload.get("candidate_ids", [])
    job_id = payload.get("job_id")

    if not candidate_ids or len(candidate_ids) < 2:
        raise HTTPException(status_code=400, detail="Please select at least 2 candidates to compare")

    company_jobs = db.get_jobs(company_id=company.id)
    job = None
    if job_id:
        j = db.get_job(job_id)
        if j and j.company_id == company.id:
            job = j
    elif company_jobs:
        job = company_jobs[0]

    if not job:
        raise HTTPException(status_code=404, detail="Job description not found")

    selected_candidates = [
        db.get_candidate(cid) for cid in candidate_ids
        if db.get_candidate(cid) and db.get_candidate(cid).company_id == company.id
    ]
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
def get_duplicates(
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None)
):
    company = require_company(authorization, token)
    all_candidates = db.get_candidates(company_id=company.id)
    duplicates = [c for c in all_candidates if c.is_duplicate]
    results = []
    for dup in duplicates:
        orig = None
        if dup.duplicate_of_id:
            orig_candidate = db.get_candidate(dup.duplicate_of_id)
            if orig_candidate and orig_candidate.company_id == company.id:
                orig = orig_candidate

        # If original candidate record no longer exists, heal the orphan duplicate flag
        if not orig:
            db.update_candidate(dup.id, {"is_duplicate": False, "duplicate_reasons": [], "duplicate_of_id": None})
            continue

        results.append({
            "duplicate_candidate": dup,
            "original_candidate": orig,
            "reasons": dup.duplicate_reasons
        })
    return {"total_duplicates": len(results), "duplicates": results}

@app.post("/api/duplicates/resolve")
def resolve_duplicate(
    req: DuplicateResolutionRequest,
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None)
):
    company = require_company(authorization, token)
    cand = db.get_candidate(req.candidate_id)
    if not cand or cand.company_id != company.id:
        raise HTTPException(status_code=404, detail="Candidate not found")

    if req.action == "keep_both":
        db.update_candidate(cand.id, {"is_duplicate": False, "duplicate_reasons": [], "duplicate_of_id": None})
        return {"status": "success", "message": "Marked candidate as distinct profile"}

    elif req.action == "delete":
        db.delete_candidate(cand.id)
        return {"status": "success", "message": "Duplicate candidate profile removed"}

    elif req.action == "merge":
        # Merge newer info into original candidate
        target_id = req.target_candidate_id or cand.duplicate_of_id
        target = db.get_candidate(target_id) if target_id else None
        if not target or target.company_id != company.id:
            # If original candidate was removed, promote this duplicate to primary candidate
            db.update_candidate(cand.id, {"is_duplicate": False, "duplicate_reasons": [], "duplicate_of_id": None})
            return {"status": "success", "message": f"Original candidate record was not found. Promoted '{cand.name}' as primary profile."}

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
def send_bulk_emails(
    req: BulkEmailRequest,
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None)
):
    company = require_company(authorization, token)
    all_candidates = db.get_candidates(company_id=company.id)
    company_jobs = db.get_jobs(company_id=company.id)
    job_map = {j.id: j.title for j in company_jobs}

    active_job = None
    if req.job_title:
        for j in company_jobs:
            if j.id == req.job_title or j.title.lower() == req.job_title.lower():
                active_job = j
                break
    elif company_jobs:
        active_job = company_jobs[0]

    job_title = active_job.title if active_job else (req.job_title or "Software Engineer")
    req_company_name = req.company_name if (req.company_name and req.company_name != "HireSwift") else company.company_name
    req_with_company = req.model_copy(update={"company_name": req_company_name})
    
    sent_records = EmailService.send_bulk_emails(
        request=req_with_company,
        candidates=all_candidates,
        active_job_title=job_title,
        job_map=job_map
    )
    db.add_sent_emails(sent_records)

    return {
        "status": "success",
        "total_sent": len(sent_records),
        "sent_records": sent_records
    }

@app.get("/api/email/smtp-status")
def get_smtp_status():
    """Check SMTP configuration status (Live vs Demo Mode)."""
    return EmailService.get_smtp_status()

@app.get("/api/email/history")
def get_email_history(
    job_id: Optional[str] = None,
    scope: Optional[str] = None, # "role" or "global" or None
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None)
):
    """Retrieve outgoing email dispatch history scoped to company, role, or global campaigns."""
    company = require_company(authorization, token)
    all_emails = db.get_sent_emails()
    company_candidates = {c.id: c for c in db.get_candidates(company_id=company.id)}

    filtered = []
    for item in all_emails:
        cand = company_candidates.get(item.candidate_id)
        # Verify company ownership
        if item.company_id and item.company_id != company.id:
            continue
        if not item.company_id and not cand:
            continue

        # If scoped to role & job_id, strictly exclude global broadcast campaigns & other roles
        if scope == "role" and job_id:
            if item.campaign_scope == "global":
                continue
            if item.job_id and item.job_id != job_id:
                continue
            if not item.job_id and cand and cand.applied_job_id != job_id:
                continue
        elif scope == "global":
            # In global campaigns, show all company outreach records
            pass

        filtered.append(item)

    return {"emails": filtered}

# ----------------- DASHBOARD STATS API -----------------

@app.get("/api/dashboard/stats")
def get_dashboard_stats(
    job_id: Optional[str] = None,
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None)
):
    company = require_company(authorization, token)
    candidates = db.get_candidates(company_id=company.id)
    jobs = db.get_jobs(company_id=company.id)
    active_job = None
    if job_id:
        j = db.get_job(job_id)
        if j and j.company_id == company.id:
            active_job = j
    elif jobs:
        active_job = jobs[0]

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
    """Resets demo company data with pristine sample jobs, sample candidates, and duplicate scenarios."""
    db.seed_default_data(force=True)
    return {
        "status": "success",
        "message": "Demo data successfully reloaded with sample jobs, candidates, and duplicate profiles.",
        "candidate_count": len(db.get_candidates(DEMO_COMPANY_ID)),
        "job_count": len(db.get_jobs(DEMO_COMPANY_ID))
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
