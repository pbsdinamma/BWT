import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.db import db
from backend.app.parser import ResumeParser
from backend.app.models import Candidate

HAPPYWAVE_CO_ID = "4c7a3289-ff18-424a-90a5-021b3dfb35fa"
JOB_ID = "4884727d-9aa3-4838-b7c2-7743ce80dcee"
PDF_PATH = os.path.join(os.path.dirname(__file__), "uploads", f"{HAPPYWAVE_CO_ID}_AdmFilePDF.pdf")

# Remove previous corrupted entries for HappyWave
old_cands = db.get_candidates(company_id=HAPPYWAVE_CO_ID)
for c in old_cands:
    print(f"Removing corrupted candidate: {c.id} - {c.name}")
    db.delete_candidate(c.id)

# Re-parse AdmFilePDF.pdf with the updated parser
with open(PDF_PATH, "rb") as f:
    pdf_bytes = f.read()

parsed_data = ResumeParser.parse_resume(pdf_bytes, "AdmFilePDF.pdf")
print("Parsed data name:", parsed_data["name"])
print("Parsed data email:", parsed_data["email"])
print("Parsed degree:", parsed_data["education"]["degree"])
print("Parsed CGPA:", parsed_data["education"]["cgpa"])
print("Parsed 12th:", parsed_data["education"]["twelfth_percentage"])
print("Parsed 10th:", parsed_data["education"]["tenth_percentage"])
print("Projects count:", len(parsed_data["projects"]))

candidate = Candidate(
    **parsed_data,
    applied_job_id=JOB_ID,
    company_id=HAPPYWAVE_CO_ID
)

saved = db.add_candidate(candidate)
print(f"Successfully saved candidate {saved.name} (ID: {saved.id}) under HappyWave!")
