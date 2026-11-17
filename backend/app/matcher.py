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
        
        # Combined skills score: required skills are weighted 75%, preferred skills 25%
        if job.required_skills and job.preferred_skills:
            skills_score = round(req_score * 0.75 + pref_score * 0.25, 1)
        elif job.required_skills:
            skills_score = round(req_score, 1)
        elif job.preferred_skills:
            skills_score = round(pref_score, 1)
        else:
            skills_score = 80.0

        # Additional skills candidate has beyond JD
        req_and_pref_lower = {s.lower() for s in (job.required_skills + job.preferred_skills)}
        additional_skills = [s for s in candidate.skills if s.lower() not in req_and_pref_lower]

        # 2. Experience Matching
        exp_score = cls._score_experience(candidate.years_of_experience, job.min_experience, job.max_experience)

        # 3. Academics Compliance & Score
        acad_score, acad_passed, acad_flags = cls._score_academics(candidate.education, job)

        # 4. Semantic AI Matching via TF-IDF Cosine Similarity
        semantic_score = cls._compute_semantic_similarity(candidate, job)

        # 5. Composite ATS Overall Score (0 - 100)
        # Weights:
        # Skills: 40%
        # Experience: 20%
        # Semantic Content Relevance: 25%
        # Academics: 15%
        overall_score = round(
            skills_score * 0.40 +
            exp_score * 0.20 +
            semantic_score * 0.25 +
            acad_score * 0.15,
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
            academic_flags=acad_flags
        )

    @staticmethod
    def _score_skills(candidate_skills: List[str], target_skills: List[str]) -> Tuple[List[str], List[str], float]:
        if not target_skills:
            return [], [], 100.0
            
        cand_lower = {s.lower().strip() for s in candidate_skills}
        matched = []
        missing = []
        
        for skill in target_skills:
            sk_clean = skill.lower().strip()
            # Direct or substring match
            if sk_clean in cand_lower or any(sk_clean in c or c in sk_clean for c in cand_lower):
                matched.append(skill)
            else:
                missing.append(skill)
                
        score = (len(matched) / len(target_skills)) * 100.0
        return matched, missing, round(score, 1)

    @staticmethod
    def _score_experience(cand_exp: float, min_exp: float, max_exp: float = None) -> float:
        if min_exp <= 0.0:
            return 100.0
        if cand_exp >= min_exp:
            # Overqualification penalty if max_exp set and candidate exceeds by >5 years
            if max_exp and cand_exp > max_exp + 5:
                return 85.0
            return 100.0
        else:
            ratio = cand_exp / min_exp
            return round(ratio * 90.0, 1) # slight penalty for falling short

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
            
            # Build representative corpus for Candidate
            cand_skills_text = " ".join(candidate.skills)
            cand_exp_text = " ".join([f"{e.role} {e.company} {e.description}" for e in candidate.experience_history])
            cand_corpus = f"{candidate.raw_text} {cand_skills_text} {cand_exp_text}"

            vectorizer = TfidfVectorizer(stop_words='english', max_features=1000, ngram_range=(1, 2))
            tfidf_matrix = vectorizer.fit_transform([jd_corpus, cand_corpus])
            sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            
            # Scale cosine similarity (typical raw cosine for resume-to-JD ranges 0.15 - 0.75)
            # We scale it to 0-100 range gracefully
            scaled = min(100.0, max(20.0, sim * 140.0 + 15.0))
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
