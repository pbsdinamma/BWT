import os
import json
from typing import List, Dict, Optional, Any
from .models import Candidate, JobDescription, SentEmailRecord, MatchScore
from .sample_data import SAMPLE_JOBS, SAMPLE_CANDIDATES
from .matcher import MatcherEngine

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
DB_FILE = os.path.join(DATA_DIR, "ats_database.json")

class Database:
    def __init__(self):
        os.makedirs(DATA_DIR, exist_ok=True)
        self.candidates: Dict[str, Candidate] = {}
        self.jobs: Dict[str, JobDescription] = {}
        self.sent_emails: List[SentEmailRecord] = []
        self.load_from_disk()
        
        # If database is empty, automatically seed initial sample data
        if not self.candidates and not self.jobs:
            self.seed_default_data()

    def load_from_disk(self):
        if not os.path.exists(DB_FILE):
            return
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.jobs = {item["id"]: JobDescription(**item) for item in data.get("jobs", [])}
                self.candidates = {item["id"]: Candidate(**item) for item in data.get("candidates", [])}
                self.sent_emails = [SentEmailRecord(**item) for item in data.get("sent_emails", [])]
        except Exception as e:
            print(f"Error loading database from disk: {e}")

    def save_to_disk(self):
        try:
            payload = {
                "jobs": [j.model_dump() for j in self.jobs.values()],
                "candidates": [c.model_dump() for c in self.candidates.values()],
                "sent_emails": [e.model_dump() for e in self.sent_emails]
            }
            with open(DB_FILE, "w", encoding="utf-8") as f:
                json.dump(payload, f, indent=2)
        except Exception as e:
            print(f"Error saving database to disk: {e}")

    def seed_default_data(self, force: bool = False):
        if force:
            self.candidates.clear()
            self.jobs.clear()
            self.sent_emails.clear()

        # Load sample jobs
        for job_dict in SAMPLE_JOBS:
            if job_dict["id"] not in self.jobs or force:
                self.jobs[job_dict["id"]] = JobDescription(**job_dict)

        # Load sample candidates
        for cand_dict in SAMPLE_CANDIDATES:
            if cand_dict["id"] not in self.candidates or force:
                self.candidates[cand_dict["id"]] = Candidate(**cand_dict)

        self.save_to_disk()

    # --- Candidates CRUD ---
    def get_candidates(self) -> List[Candidate]:
        return list(self.candidates.values())

    def get_candidate(self, cand_id: str) -> Optional[Candidate]:
        return self.candidates.get(cand_id)

    def add_candidate(self, candidate: Candidate) -> Candidate:
        self.candidates[candidate.id] = candidate
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

    # --- Jobs CRUD ---
    def get_jobs(self) -> List[JobDescription]:
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
