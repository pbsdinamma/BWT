import os
import json
import hashlib
import secrets
from typing import List, Dict, Optional, Any
from .models import Candidate, JobDescription, SentEmailRecord, MatchScore, Company
from .sample_data import SAMPLE_JOBS, SAMPLE_CANDIDATES
from .matcher import MatcherEngine

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
DB_FILE = os.path.join(DATA_DIR, "ats_database.json")
DEMO_COMPANY_ID = "comp-acme-corp"

def hash_password(password: str) -> str:
    return hashlib.sha256(f"salt_{password}_hireswift".encode("utf-8")).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

class Database:
    def __init__(self):
        os.makedirs(DATA_DIR, exist_ok=True)
        self.candidates: Dict[str, Candidate] = {}
        self.jobs: Dict[str, JobDescription] = {}
        self.companies: Dict[str, Company] = {}
        self.sessions: Dict[str, str] = {} # token -> company_id
        self.sent_emails: List[SentEmailRecord] = []
        self.load_from_disk()
        
        # If database is empty or missing default data, automatically seed
        if not self.candidates and not self.jobs:
            self.seed_default_data()
        elif not self.companies or DEMO_COMPANY_ID not in self.companies:
            self.seed_default_data(force=False)

    def load_from_disk(self):
        if not os.path.exists(DB_FILE):
            return
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.companies = {item["id"]: Company(**item) for item in data.get("companies", [])}
                self.sessions = data.get("sessions", {})
                
                # Load jobs & ensure demo jobs have company_id=comp-acme-corp
                self.jobs = {}
                for item in data.get("jobs", []):
                    if not item.get("company_id"):
                        item["company_id"] = DEMO_COMPANY_ID
                    self.jobs[item["id"]] = JobDescription(**item)

                # Load candidates & ensure demo candidates have company_id=comp-acme-corp
                self.candidates = {}
                for item in data.get("candidates", []):
                    if not item.get("company_id"):
                        item["company_id"] = DEMO_COMPANY_ID
                    self.candidates[item["id"]] = Candidate(**item)

                self.sent_emails = [SentEmailRecord(**item) for item in data.get("sent_emails", [])]
                
            # Persist back so company_ids are permanently saved
            self.save_to_disk()
        except Exception as e:
            print(f"Error loading database from disk: {e}")

    def save_to_disk(self):
        try:
            payload = {
                "jobs": [j.model_dump() for j in self.jobs.values()],
                "candidates": [c.model_dump() for c in self.candidates.values()],
                "companies": [co.model_dump() for co in self.companies.values()],
                "sessions": self.sessions,
                "sent_emails": [e.model_dump() for e in self.sent_emails]
            }
            with open(DB_FILE, "w", encoding="utf-8") as f:
                json.dump(payload, f, indent=2)
        except Exception as e:
            print(f"Error saving database to disk: {e}")

    def seed_default_data(self, force: bool = False):
        if force:
            # Preserve registered external companies; only clear demo data
            demo_cand_ids = [c_id for c_id, c in self.candidates.items() if c.company_id == DEMO_COMPANY_ID]
            for c_id in demo_cand_ids:
                del self.candidates[c_id]
            demo_job_ids = [j_id for j_id, j in self.jobs.items() if j.company_id == DEMO_COMPANY_ID]
            for j_id in demo_job_ids:
                del self.jobs[j_id]

        # Seed Demo Company (Acme Technologies)
        demo_company = Company(
            id=DEMO_COMPANY_ID,
            company_name="Acme Technologies",
            work_email="hr@acme.com",
            password_hash=hash_password("demo123"),
            recruiter_name="Sarah Jenkins",
            company_size="51-200",
            industry="Software & Cloud Services",
            website="https://acme.tech"
        )
        self.companies[demo_company.id] = demo_company

        # Load sample jobs for Demo Company
        for job_dict in SAMPLE_JOBS:
            if job_dict["id"] not in self.jobs or force:
                job_data = dict(job_dict)
                if "application_deadline" not in job_data:
                    job_data["application_deadline"] = "2026-12-31"
                job_data["company_id"] = DEMO_COMPANY_ID
                self.jobs[job_dict["id"]] = JobDescription(**job_data)

        # Load sample candidates for Demo Company
        for cand_dict in SAMPLE_CANDIDATES:
            if cand_dict["id"] not in self.candidates or force:
                cand_data = dict(cand_dict)
                cand_data["company_id"] = DEMO_COMPANY_ID
                self.candidates[cand_dict["id"]] = Candidate(**cand_data)

        self.save_to_disk()

    # --- Companies & Auth ---
    def get_company_by_email(self, email: str) -> Optional[Company]:
        normalized = email.strip().lower()
        for c in self.companies.values():
            if c.work_email.strip().lower() == normalized:
                return c
        return None

    def get_company(self, company_id: str) -> Optional[Company]:
        return self.companies.get(company_id)

    def add_company(self, company: Company) -> Company:
        self.companies[company.id] = company
        self.save_to_disk()
        return company

    def create_session(self, company_id: str) -> str:
        token = secrets.token_urlsafe(32)
        self.sessions[token] = company_id
        self.save_to_disk()
        return token

    def get_company_by_token(self, token: str) -> Optional[Company]:
        if not token:
            return None
        # Check explicit demo-token
        if token == "demo-token" and DEMO_COMPANY_ID in self.companies:
            return self.companies[DEMO_COMPANY_ID]

        company_id = self.sessions.get(token)
        if not company_id:
            return None
        return self.companies.get(company_id)

    def delete_session(self, token: str):
        if token in self.sessions:
            del self.sessions[token]
            self.save_to_disk()

    # --- Candidates CRUD (Multi-tenant) ---
    def get_candidates(self, company_id: Optional[str] = None) -> List[Candidate]:
        if company_id:
            company_job_ids = {j.id for j in self.jobs.values() if j.company_id == company_id}
            return [
                c for c in self.candidates.values()
                if c.company_id == company_id or (c.applied_job_id and c.applied_job_id in company_job_ids)
            ]
        return list(self.candidates.values())

    def get_candidate(self, cand_id: str) -> Optional[Candidate]:
        return self.candidates.get(cand_id)

    def add_candidate(self, candidate: Candidate, auto_save: bool = True) -> Candidate:
        self.candidates[candidate.id] = candidate
        if auto_save:
            self.save_to_disk()
        return candidate

    def update_candidate(self, cand_id: str, updates: Dict[str, Any]) -> Optional[Candidate]:
        if cand_id not in self.candidates:
            return None
        cand_dict = self.candidates[cand_id].model_dump()
        cand_dict.update(updates)
        updated = Candidate(**cand_dict)
        self.candidates[cand_id] = updated
        self.save_to_disk()
        return updated

    def delete_candidate(self, cand_id: str) -> bool:
        if cand_id in self.candidates:
            del self.candidates[cand_id]
            self.save_to_disk()
            return True
        return False

    # --- Jobs CRUD (Multi-tenant) ---
    def get_jobs(self, company_id: Optional[str] = None) -> List[JobDescription]:
        if company_id:
            return [j for j in self.jobs.values() if j.company_id == company_id]
        return list(self.jobs.values())

    def get_job(self, job_id: str) -> Optional[JobDescription]:
        return self.jobs.get(job_id)

    def add_job(self, job: JobDescription) -> JobDescription:
        self.jobs[job.id] = job
        self.save_to_disk()
        return job

    def update_job(self, job_id: str, updates: Dict[str, Any]) -> Optional[JobDescription]:
        if job_id not in self.jobs:
            return None
        job_dict = self.jobs[job_id].model_dump()
        job_dict.update(updates)
        updated = JobDescription(**job_dict)
        self.jobs[job_id] = updated
        self.save_to_disk()
        return updated

    def delete_job(self, job_id: str) -> bool:
        if job_id in self.jobs:
            del self.jobs[job_id]
            self.save_to_disk()
            return True
        return False

    # --- Sent Emails ---
    def add_sent_emails(self, records: List[SentEmailRecord]):
        self.sent_emails.extend(records)
        self.save_to_disk()

    def get_sent_emails(self) -> List[SentEmailRecord]:
        return self.sent_emails

db = Database()
