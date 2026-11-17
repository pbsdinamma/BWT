import re
import hashlib
from typing import List, Tuple, Optional
from .models import Candidate

class DuplicateDetector:
    """Detects duplicate resumes using exact attributes and fuzzy content heuristics."""

    @staticmethod
    def _clean_phone(phone: str) -> str:
        """Strip formatting and keep only digits."""
        if not phone:
            return ""
        digits = re.sub(r"\D", "", phone)
        # Keep last 10 digits for Indian/US phone comparison
        return digits[-10:] if len(digits) >= 10 else digits

    @staticmethod
    def _clean_name(name: str) -> str:
        """Normalize name by lowercasing and stripping honorifics."""
        name = re.sub(r"\b(mr|ms|mrs|dr|prof)\.?\b", "", name.lower()).strip()
        return re.sub(r"[^a-z0-9]", "", name)

    @classmethod
    def check_duplicate(cls, new_cand: Candidate, existing_candidates: List[Candidate]) -> Tuple[bool, List[str], Optional[str]]:
        reasons = []
        matched_id = None

        new_email = (new_cand.email or "").strip().lower()
        new_phone = cls._clean_phone(new_cand.phone)
        new_name = cls._clean_name(new_cand.name)
        new_li = (new_cand.linkedin or "").strip().lower()

        # Generate text MD5 hash for exact document match
        new_text_hash = hashlib.md5(new_cand.raw_text.encode("utf-8")).hexdigest() if new_cand.raw_text else ""

        for existing in existing_candidates:
            if existing.id == new_cand.id:
                continue

            ex_email = (existing.email or "").strip().lower()
            ex_phone = cls._clean_phone(existing.phone)
            ex_name = cls._clean_name(existing.name)
            ex_li = (existing.linkedin or "").strip().lower()
            ex_text_hash = hashlib.md5(existing.raw_text.encode("utf-8")).hexdigest() if existing.raw_text else ""

            # 1. Exact Email Match
            if new_email and ex_email and new_email == ex_email:
                reasons.append(f"Identical email address ({new_email}) matching existing candidate '{existing.name}'")
                matched_id = existing.id

            # 2. Exact Phone Match
            if new_phone and ex_phone and new_phone == ex_phone and len(new_phone) >= 7:
                reasons.append(f"Identical phone number ({new_cand.phone}) matching '{existing.name}'")
                if not matched_id:
                    matched_id = existing.id

            # 3. Exact LinkedIn Match
            if new_li and ex_li and new_li == ex_li:
                reasons.append(f"Identical LinkedIn profile link matching '{existing.name}'")
                if not matched_id:
                    matched_id = existing.id

            # 4. Same Resume Text Hash
            if new_text_hash and ex_text_hash and new_text_hash == ex_text_hash:
                reasons.append(f"100% identical resume document content with '{existing.name}'")
                if not matched_id:
                    matched_id = existing.id

            # 5. Same Name and Same College / Graduation Year
            if new_name and ex_name and new_name == ex_name:
                same_col = (
                    new_cand.education.college
                    and existing.education.college
                    and new_cand.education.college.lower() == existing.education.college.lower()
                )
                same_yr = (
                    new_cand.education.graduation_year
                    and existing.education.graduation_year
                    and new_cand.education.graduation_year == existing.education.graduation_year
                )
                if same_col or same_yr:
                    reasons.append(f"Same candidate name '{new_cand.name}' with matching academic history ({new_cand.education.college or new_cand.education.graduation_year})")
                    if not matched_id:
                        matched_id = existing.id

            if matched_id:
                break

        return (len(reasons) > 0), reasons, matched_id
