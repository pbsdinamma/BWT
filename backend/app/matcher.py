import re
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .models import Candidate, JobDescription, MatchScore

class MatcherEngine:
    """Intelligent multi-factor ATS candidate-to-job matching engine."""

    @classmethod
    def match_candidate_to_job(cls, candidate: Candidate, job: JobDescription) -> MatchScore:
        # 1. Skills Matching
        matched_req, missing_req, req_score = cls._score_skills(candidate.skills, job.required_skills)
        matched_pref, missing_pref, pref_score = cls._score_skills(candidate.skills, job.preferred_skills)
        
        # Additional skills candidate has beyond JD
        req_and_pref_lower = {s.lower() for s in (job.required_skills + job.preferred_skills)}
        additional_skills = [s for s in candidate.skills if s.lower() not in req_and_pref_lower]

        # Combined skills score: required skills are weighted 85%, preferred skills 15% (bonus)
        # Plus bonus for additional technical skills (e.g. C++, Python, DSA, Algorithms)
        if job.required_skills and job.preferred_skills:
            base_skills = req_score * 0.85 + pref_score * 0.15
        elif job.required_skills:
            base_skills = req_score
        elif job.preferred_skills:
            base_skills = pref_score
        else:
            base_skills = 80.0

        extra_skills_bonus = min(10.0, len(additional_skills) * 1.5)
        skills_score = round(min(100.0, base_skills + extra_skills_bonus), 1)

        # 2. Experience Matching (recognizing hands-on projects for campus candidates)
        exp_score = cls._score_experience(
            candidate.years_of_experience,
            job.min_experience,
            job.max_experience,
            projects_count=len(candidate.projects or [])
        )

        # 3. Academics Compliance & Score
        acad_score, acad_passed, acad_flags = cls._score_academics(candidate.education, job)

        # 4. Semantic AI Matching via TF-IDF Cosine Similarity
        semantic_score = cls._compute_semantic_similarity(candidate, job)

        # 5. Composite ATS Overall Score (0 - 100)
        # Use job custom scoring weights if calibrated, otherwise standard 40/30/20/10
        raw_weights = getattr(job, "scoring_weights", None) or {
            "skills": 40.0,
            "experience": 30.0,
            "academics": 20.0,
            "domain": 10.0
        }
        w_skills = float(raw_weights.get("skills", 40.0)) / 100.0
        w_exp = float(raw_weights.get("experience", 30.0)) / 100.0
        w_acad = float(raw_weights.get("academics", 20.0)) / 100.0
        w_domain = float(raw_weights.get("domain", 10.0)) / 100.0

        overall_score = round(
            skills_score * w_skills +
            exp_score * w_exp +
            acad_score * w_acad +
            semantic_score * w_domain,
            1
        )
        overall_score = max(0.0, min(100.0, overall_score))

        # Determine Tier
        if overall_score >= 80.0:
            tier = "Strong Match"
        elif overall_score >= 65.0:
            tier = "Good Match"
        elif overall_score >= 50.0:
            tier = "Moderate Match"
        else:
            tier = "Low Match"

        # 6. Generate AI Insights & Recommendation
        insights = cls._generate_ai_insights(
            candidate=candidate,
            job=job,
            overall_score=overall_score,
            tier=tier,
            matched_req=matched_req,
            missing_req=missing_req,
            matched_pref=matched_pref,
            additional_skills=additional_skills,
            exp_score=exp_score,
            acad_flags=acad_flags
        )

        breakdown = {
            "skills": {
                "score": skills_score,
                "matched": matched_req + matched_pref,
                "missing": missing_req,
                "additional": additional_skills[:8]
            },
            "experience": {
                "score": exp_score,
                "candidate_exp": candidate.years_of_experience,
                "required_exp": job.min_experience,
                "projects_count": len(candidate.projects or [])
            },
            "academics": {
                "score": acad_score,
                "cgpa": candidate.education.cgpa,
                "tenth": candidate.education.tenth_percentage,
                "twelfth": candidate.education.twelfth_percentage
            },
            "domain": {
                "score": semantic_score
            },
            "weights": {
                "skills": round(w_skills * 100),
                "experience": round(w_exp * 100),
                "academics": round(w_acad * 100),
                "domain": round(w_domain * 100)
            }
        }

        return MatchScore(
            candidate_id=candidate.id,
            job_id=job.id,
            overall_score=overall_score,
            skills_score=skills_score,
            experience_score=exp_score,
            academics_score=acad_score,
            semantic_score=semantic_score,
            matched_required_skills=matched_req,
            missing_required_skills=missing_req,
            matched_preferred_skills=matched_pref,
            additional_skills=additional_skills[:8],
            tier=tier,
            ai_summary=insights["summary"],
            strengths=insights["strengths"],
            risks_or_gaps=insights["risks_or_gaps"],
            recommendation=insights["recommendation"],
            academic_passed=acad_passed,
            academic_flags=acad_flags,
            breakdown=breakdown
        )

    @staticmethod
    def _score_skills(candidate_skills: List[str], target_skills: List[str]) -> Tuple[List[str], List[str], float]:
        if not target_skills:
            return [], [], 100.0
            
        cand_lower = {s.lower().strip() for s in candidate_skills}

        # Stacks that encompass underlying technologies
        encompassing_stacks = {
            "mern": {"react", "node.js", "nodejs", "node", "express.js", "express", "mongodb", "mongoose", "mern", "javascript"},
            "mean": {"angular", "node.js", "nodejs", "express.js", "mongodb", "mean", "javascript"},
            "full-stack": {"react", "node.js", "frontend", "backend", "full-stack", "html", "css", "javascript"},
            "lamp": {"linux", "apache", "mysql", "php", "sql"}
        }

        # Skill transferability / strong affinity mapping
        transferable = {
            "typescript": {"javascript", "js", "react", "node.js"},
            "javascript": {"typescript", "ts"},
            "postgresql": {"sql", "mysql", "mongodb", "mongoose", "database", "sqlite"},
            "mysql": {"sql", "postgresql", "mongodb", "database"},
            "mongodb": {"postgresql", "mysql", "sql", "mongoose"},
            "docker": {"containers", "kubernetes", "devops"},
            "aws": {"cloud", "azure", "gcp"},
            "c++": {"c", "cpp", "stl", "oop", "c++"},
            "c#": {".net", "dotnet", "java", "c++", "c", "csharp"},
            "algorithms": {"data structures and algorithms", "dsa", "graph algorithms", "sorting algorithms", "algorithms"},
            "data structures and algorithms": {"algorithms", "data structures", "dsa", "competitive programming"},

            # Core Computer Science Fundamentals & Curriculum Ontologies
            "oops": {"java", "c++", "c#", "python", "oop", "oops", "object-oriented programming", "csharp"},
            "oop": {"java", "c++", "c#", "python", "oop", "oops", "object-oriented programming", "csharp"},
            "object-oriented programming": {"java", "c++", "c#", "python", "oop", "oops", "csharp"},

            "os": {"linux", "unix", "ubuntu", "windows", "posix", "operating systems", "bash", "shell", "os"},
            "operating systems": {"linux", "unix", "ubuntu", "windows", "posix", "operating systems", "os", "bash", "shell"},

            "dbms": {"sql", "mysql", "postgresql", "mongodb", "database", "rdbms", "sqlite", "nosql", "dynamodb", "redis", "dbms"},
            "database": {"sql", "mysql", "postgresql", "mongodb", "rdbms", "sqlite", "nosql", "dbms", "database"},

            "system design": {"software architecture", "architecture", "distributed systems", "microservices", "scalable", "system design", "sdlc", "backend", "cloud", "rest api", "apis"},
            "software architecture": {"system design", "architecture", "distributed systems", "microservices", "sdlc", "backend", "software architecture"},

            "computer networks": {"networking", "tcp/ip", "http", "rest", "rest api", "api", "restful", "websockets", "computer networks", "network"},
            "networking": {"computer networks", "tcp/ip", "http", "rest", "rest api", "api", "restful", "websockets", "network"}
        }

        matched = []
        missing = []
        total_points = 0.0

        for skill in target_skills:
            sk_clean = skill.lower().strip()
            # 1. Exact or direct substring match
            if sk_clean in cand_lower or any(sk_clean == c or (len(sk_clean) > 2 and sk_clean in c) or (len(c) > 2 and c in sk_clean) for c in cand_lower):
                matched.append(skill)
                total_points += 1.0
                continue
            
            # 2. Check if candidate has an encompassing stack
            has_stack = False
            for cand_skill in cand_lower:
                if cand_skill in encompassing_stacks and sk_clean in encompassing_stacks[cand_skill]:
                    matched.append(skill)
                    total_points += 1.0
                    has_stack = True
                    break
            if has_stack:
                continue

            # 3. Check transferable skill affinity (e.g. JavaScript for TypeScript, or MongoDB for PostgreSQL)
            if sk_clean in transferable and any(t in cand_lower for t in transferable[sk_clean]):
                matched.append(skill)
                total_points += 0.85
                continue

            missing.append(skill)

        score = (total_points / len(target_skills)) * 100.0
        return matched, missing, min(100.0, round(score, 1))

    @staticmethod
    def _score_experience(cand_exp: float, min_exp: float, max_exp: float = None, projects_count: int = 0) -> float:
        if min_exp <= 0.0:
            return 100.0
        if cand_exp >= min_exp:
            if max_exp and cand_exp > max_exp + 5:
                return 85.0
            return 100.0
        
        # When candidate has lower corporate years (especially campus students / freshers):
        # Technical projects provide hands-on practical software implementation experience.
        # Verified engineering projects provide credit toward practical experience.
        proj_credit = min(40.0, projects_count * 10.0)
        corp_ratio = (cand_exp / min_exp) * 50.0
        base_credit = 45.0 if projects_count >= 2 else (30.0 if projects_count >= 1 else 15.0)
        score = min(92.0, base_credit + corp_ratio + proj_credit)
        return round(score, 1)

    @staticmethod
    def _score_academics(edu, job: JobDescription) -> Tuple[float, bool, List[str]]:
        score = 100.0
        flags = []
        passed = True

        # CGPA Check
        if job.min_cgpa and edu.cgpa is not None:
            if edu.cgpa < job.min_cgpa:
                passed = False
                deficit = job.min_cgpa - edu.cgpa
                score -= min(30.0, deficit * 20.0)
                flags.append(f"CGPA ({edu.cgpa}) is below required cutoff of {job.min_cgpa}")
        elif job.min_cgpa and edu.cgpa is None:
            score -= 10.0
            flags.append(f"CGPA data missing in resume (Job requires min {job.min_cgpa})")

        # 12th Percentage Check
        if job.min_twelfth_percentage and edu.twelfth_percentage is not None:
            if edu.twelfth_percentage < job.min_twelfth_percentage:
                passed = False
                deficit = job.min_twelfth_percentage - edu.twelfth_percentage
                score -= min(25.0, deficit * 1.5)
                flags.append(f"12th score ({edu.twelfth_percentage}%) below required {job.min_twelfth_percentage}%")

        # 10th Percentage Check
        if job.min_tenth_percentage and edu.tenth_percentage is not None:
            if edu.tenth_percentage < job.min_tenth_percentage:
                passed = False
                deficit = job.min_tenth_percentage - edu.tenth_percentage
                score -= min(20.0, deficit * 1.0)
                flags.append(f"10th score ({edu.tenth_percentage}%) below required {job.min_tenth_percentage}%")

        # Graduation Year Check
        if job.preferred_grad_years and edu.graduation_year:
            if edu.graduation_year not in job.preferred_grad_years:
                flags.append(f"Graduation year ({edu.graduation_year}) outside preferred batches ({job.preferred_grad_years})")
                score -= 10.0

        return max(0.0, round(score, 1)), passed, flags

    @staticmethod
    def _compute_semantic_similarity(candidate: Candidate, job: JobDescription) -> float:
        """Compute TF-IDF cosine similarity between candidate resume & job description."""
        try:
            # Build representative corpus for Job Description
            jd_corpus = f"{job.title} {job.department} {job.description} {' '.join(job.required_skills)} {' '.join(job.preferred_skills)}"
            
            # Build representative corpus for Candidate including projects
            cand_skills_text = " ".join(candidate.skills)
            cand_exp_text = " ".join([f"{e.role} {e.company} {e.description}" for e in candidate.experience_history])
            cand_projects_text = " ".join([
                f"{p.title} {p.subtitle or ''} {' '.join(p.tech_stack or [])} {' '.join(p.bullets or [])} {p.description or ''}"
                for p in (candidate.projects or [])
            ])
            cand_corpus = f"{candidate.raw_text} {cand_skills_text} {cand_exp_text} {cand_projects_text}"

            vectorizer = TfidfVectorizer(stop_words='english', max_features=1000, ngram_range=(1, 2))
            tfidf_matrix = vectorizer.fit_transform([jd_corpus, cand_corpus])
            sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            
            # Scale cosine similarity (typical raw cosine for resume-to-JD ranges 0.10 - 0.60)
            scaled = min(100.0, max(50.0, sim * 100.0 + 55.0))
            return round(scaled, 1)
        except Exception as e:
            print(f"Error computing semantic similarity: {e}")
            return 75.0

    @classmethod
    def _generate_ai_insights(
        cls, candidate: Candidate, job: JobDescription, overall_score: float,
        tier: str, matched_req: List[str], missing_req: List[str],
        matched_pref: List[str], additional_skills: List[str],
        exp_score: float, acad_flags: List[str]
    ) -> Dict[str, Any]:
        strengths = []
        risks_or_gaps = []

        # Strengths
        if matched_req:
            strengths.append(f"Matches {len(matched_req)} core required technologies: {', '.join(matched_req[:4])}")
        if matched_pref:
            strengths.append(f"Bonus competence in preferred areas: {', '.join(matched_pref[:3])}")
        if candidate.years_of_experience >= job.min_experience:
            strengths.append(f"Experience ({candidate.years_of_experience} yrs) fulfills minimum requirements ({job.min_experience} yrs)")
        if candidate.education.cgpa and candidate.education.cgpa >= 8.0:
            strengths.append(f"Strong academic standing with CGPA of {candidate.education.cgpa}/10 from {candidate.education.college}")
        if additional_skills:
            strengths.append(f"Complementary domain skillsets: {', '.join(additional_skills[:3])}")

        # Gaps / Risks
        if missing_req:
            risks_or_gaps.append(f"Missing essential required skills: {', '.join(missing_req)}")
        if candidate.years_of_experience < job.min_experience:
            diff = round(job.min_experience - candidate.years_of_experience, 1)
            risks_or_gaps.append(f"Years of experience ({candidate.years_of_experience} yrs) is {diff} yrs below target ({job.min_experience} yrs)")
        for flag in acad_flags:
            risks_or_gaps.append(flag)

        # Recommendation
        if overall_score >= 82.0 and not missing_req:
            recommendation = "Strong Hire: Exceptional alignment with role criteria. Fast-track to technical screening."
        elif overall_score >= 70.0:
            if missing_req:
                recommendation = f"Shortlist for Interview: Strong candidate overall. Verify hands-on depth in {', '.join(missing_req[:2])} during interview."
            else:
                recommendation = "Shortlist for Interview: Well-balanced profile meeting core criteria."
        elif overall_score >= 55.0:
            recommendation = "Hold / Secondary Review: Partial match. Consider if candidate demonstrates strong potential or for related adjacent opening."
        else:
            recommendation = "Low Alignment: Candidate lacks key required competencies and experience for this level."

        # Summary sentence
        summary = f"{candidate.name} scored {overall_score}% ({tier}) for '{job.title}'. Has {len(matched_req)}/{len(job.required_skills) if job.required_skills else 1} core skills and {candidate.years_of_experience} years of experience."

        return {
            "summary": summary,
            "strengths": strengths,
            "risks_or_gaps": risks_or_gaps,
            "recommendation": recommendation
        }
