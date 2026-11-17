from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid

def get_utc_now():
    return datetime.now(timezone.utc).isoformat()

class EducationDetail(BaseModel):
    degree: Optional[str] = None
    college: Optional[str] = None
    cgpa: Optional[float] = None
    tenth_percentage: Optional[float] = None
    twelfth_percentage: Optional[float] = None
    graduation_year: Optional[int] = None

class ExperienceEntry(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    duration: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    description: Optional[str] = None

class ProjectEntry(BaseModel):
    title: Optional[str] = None
    tech_stack: Optional[List[str]] = []
    description: Optional[str] = None

class CandidateNote(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    author: str = "Recruiter"
    content: str
    created_at: str = Field(default_factory=get_utc_now)

class Candidate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = ""
    location: Optional[str] = ""
    linkedin: Optional[str] = ""
    github: Optional[str] = ""
    portfolio: Optional[str] = ""
    
    # Academics
    education: EducationDetail = Field(default_factory=EducationDetail)
    
    # Skills
    skills: List[str] = []
    categorized_skills: Dict[str, List[str]] = {}
    
    # Experience
    years_of_experience: float = 0.0
    experience_history: List[ExperienceEntry] = []
    projects: List[ProjectEntry] = []
    certifications: List[str] = []
    
    # Metadata
    raw_text: str = ""
    file_name: Optional[str] = ""
    file_type: Optional[str] = "" # pdf, docx
    
    # ATS Pipeline
    stage: str = "Applied"  # Applied, Shortlisted, Interview, Offer, Rejected
    rejection_reason: Optional[str] = None
    notes: List[CandidateNote] = []
    applied_job_id: Optional[str] = None
    
    # Duplicate detection flag
    is_duplicate: bool = False
    duplicate_reasons: List[str] = []
    duplicate_of_id: Optional[str] = None
    
    created_at: str = Field(default_factory=get_utc_now)
    updated_at: str = Field(default_factory=get_utc_now)

class JobDescription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    department: str = "Engineering"
    location: str = "Remote"
    employment_type: str = "Full-Time"
    description: str
    
    # Matching Criteria
    min_experience: float = 0.0
    max_experience: Optional[float] = None
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    
    # Cutoff Filters
    min_tenth_percentage: Optional[float] = None
    min_twelfth_percentage: Optional[float] = None
    min_cgpa: Optional[float] = None
    preferred_grad_years: Optional[List[int]] = []
    
    status: str = "Active"  # Active, Closed, Draft
    created_at: str = Field(default_factory=get_utc_now)

class MatchScore(BaseModel):
    candidate_id: str
    job_id: str
    overall_score: float # 0 - 100
    skills_score: float # 0 - 100
    experience_score: float # 0 - 100
    academics_score: float # 0 - 100
    semantic_score: float # 0 - 100
    
    matched_required_skills: List[str] = []
    missing_required_skills: List[str] = []
    matched_preferred_skills: List[str] = []
    additional_skills: List[str] = []
    
    tier: str # Strong Match, Good Match, Moderate Match, Low Match
    
    # AI Insights
    ai_summary: str = ""
    strengths: List[str] = []
    risks_or_gaps: List[str] = []
    recommendation: str = ""
    academic_passed: bool = True
    academic_flags: List[str] = []

class CandidateFilterParams(BaseModel):
    job_id: Optional[str] = None
    search: Optional[str] = None
    skills: Optional[List[str]] = None
    skill_mode: Optional[str] = "any" # "any" | "all"
    min_exp: Optional[float] = None
    max_exp: Optional[float] = None
    min_tenth: Optional[float] = None
    min_twelfth: Optional[float] = None
    min_cgpa: Optional[float] = None
    min_grad_year: Optional[int] = None
    max_grad_year: Optional[int] = None
    location: Optional[str] = None
    stage: Optional[str] = None
    min_score: Optional[float] = None
    sort_by: Optional[str] = "score" # score, exp, cgpa, name, date
    sort_order: Optional[str] = "desc"

class UpdateStageRequest(BaseModel):
    stage: str
    rejection_reason: Optional[str] = None

class AddNoteRequest(BaseModel):
    author: Optional[str] = "Recruiter"
    content: str

class BulkEmailRequest(BaseModel):
    candidate_ids: List[str]
    template_type: str # interview, shortlisted, offer, rejection, custom
    subject: str
    body_template: str
    job_title: Optional[str] = None
    company_name: Optional[str] = "HireSwift"
    interview_date: Optional[str] = None
    interview_link: Optional[str] = None

class SentEmailRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    candidate_id: str
    candidate_name: str
    candidate_email: str
    subject: str
    body: str
    template_type: str
    status: str = "Delivered"
    sent_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class DuplicateResolutionRequest(BaseModel):
    candidate_id: str
    action: str # "merge", "keep_both", "delete"
    target_candidate_id: Optional[str] = None
