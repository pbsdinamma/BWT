import os
import sys
import unittest

# Add root directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.parser import ResumeParser
from backend.app.matcher import MatcherEngine
from backend.app.duplicates import DuplicateDetector
from backend.app.models import Candidate, JobDescription, EducationDetail

class TestHireSwiftATS(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        # Reset to pristine demo data
        cls.client.post("/api/system/reset-demo")

    def test_01_health_and_stats(self):
        """Test dashboard stats endpoint."""
        res = self.client.get("/api/dashboard/stats")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreaterEqual(data["total_candidates"], 10)
        self.assertGreaterEqual(data["total_jobs"], 5)
        self.assertIn("stage_counts", data)
        self.assertIn("Applied", data["stage_counts"])
        print("✓ test_01_health_and_stats passed")

    def test_02_pdf_and_docx_parsing(self):
        """Test parser accurately extracts academic percentages and skills from generated PDF & DOCX."""
        # PDF test
        pdf_path = os.path.join(os.path.dirname(__file__), "..", "backend", "sample_resumes", "Aarav_Sharma_FullStack.pdf")
        if os.path.exists(pdf_path):
            with open(pdf_path, "rb") as f:
                data = ResumeParser.parse_resume(f.read(), "Aarav_Sharma_FullStack.pdf")
            self.assertEqual(data["name"], "Aarav Sharma")
            self.assertAlmostEqual(data["education"]["cgpa"], 8.85, places=1)
            self.assertAlmostEqual(data["education"]["tenth_percentage"], 93.4, places=1)
            self.assertAlmostEqual(data["education"]["twelfth_percentage"], 91.8, places=1)
            self.assertGreaterEqual(data["years_of_experience"], 4.0)
            self.assertIn("React", data["skills"])
            self.assertIn("Node.js", data["skills"])

        # DOCX test
        docx_path = os.path.join(os.path.dirname(__file__), "..", "backend", "sample_resumes", "Priya_Nair_Frontend.docx")
        if os.path.exists(docx_path):
            with open(docx_path, "rb") as f:
                data = ResumeParser.parse_resume(f.read(), "Priya_Nair_Frontend.docx")
            self.assertEqual(data["name"], "Priya Nair")
            self.assertAlmostEqual(data["education"]["cgpa"], 8.4, places=1)
            self.assertAlmostEqual(data["education"]["tenth_percentage"], 89.0, places=1)
            self.assertAlmostEqual(data["education"]["twelfth_percentage"], 88.5, places=1)
            self.assertIn("Tailwind CSS", data["skills"])

        print("✓ test_02_pdf_and_docx_parsing passed")

    def test_03_bulk_upload_endpoint(self):
        """Test bulk upload of PDF and DOCX files with duplicate detection."""
        pdf_path = os.path.join(os.path.dirname(__file__), "..", "backend", "sample_resumes", "Aditya_Verma_DevOps.pdf")
        if os.path.exists(pdf_path):
            with open(pdf_path, "rb") as f:
                files = [("files", ("Aditya_Verma_Upload_Test.pdf", f.read(), "application/pdf"))]
                res = self.client.post("/api/resumes/upload-bulk", files=files)
                self.assertEqual(res.status_code, 200)
                data = res.json()
                self.assertEqual(data["total_uploaded"], 1)
                self.assertEqual(data["successful"], 1)
                # Since Aditya Verma already exists in database, it should detect duplicate!
                self.assertTrue(data["results"][0]["is_duplicate"])
        print("✓ test_03_bulk_upload_endpoint passed")

    def test_04_filtering_by_academics_and_skills(self):
        """Test multi-faceted filtering by CGPA, 10th %, 12th %, and skills."""
        # 1. Filter by min_cgpa >= 8.5
        res = self.client.get("/api/candidates?min_cgpa=8.5")
        self.assertEqual(res.status_code, 200)
        cands = res.json()["candidates"]
        for item in cands:
            cgpa = item["candidate"]["education"]["cgpa"]
            self.assertIsNotNone(cgpa)
            self.assertGreaterEqual(cgpa, 8.5)

        # 2. Filter by min_twelfth >= 90.0%
        res = self.client.get("/api/candidates?min_twelfth=90.0")
        self.assertEqual(res.status_code, 200)
        cands = res.json()["candidates"]
        for item in cands:
            twelfth = item["candidate"]["education"]["twelfth_percentage"]
            self.assertIsNotNone(twelfth)
            self.assertGreaterEqual(twelfth, 90.0)

        # 3. Filter by skills 'Docker,AWS' with 'all' mode
        res = self.client.get("/api/candidates?skills=Docker,AWS&skill_mode=all")
        self.assertEqual(res.status_code, 200)
        cands = res.json()["candidates"]
        for item in cands:
            skills_lower = {s.lower() for s in item["candidate"]["skills"]}
            self.assertTrue("docker" in skills_lower and "aws" in skills_lower)

        print("✓ test_04_filtering_by_academics_and_skills passed")

    def test_05_ai_matching_engine(self):
        """Test multi-factor candidate to job scoring with explainable AI insights."""
        job = JobDescription(
            title="Senior Full-Stack Engineer",
            min_experience=4.0,
            required_skills=["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS"],
            preferred_skills=["Next.js", "Redis"],
            min_cgpa=7.5,
            description="Enterprise full stack position requiring React and Node.js microservices."
        )

        cand = Candidate(
            name="Test Engineer",
            email="test.eng@example.com",
            skills=["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS", "Redis"],
            years_of_experience=5.0,
            education=EducationDetail(cgpa=8.5, tenth_percentage=90.0, twelfth_percentage=88.0, college="IIT"),
            raw_text="Senior Engineer with 5 years experience in React, Node.js, TypeScript, PostgreSQL, Docker, AWS, Redis."
        )

        score = MatcherEngine.match_candidate_to_job(cand, job)
        self.assertGreaterEqual(score.overall_score, 80.0)
        self.assertEqual(score.tier, "Strong Match")
        self.assertIn("React", score.matched_required_skills)
        self.assertIn("AWS", score.matched_required_skills)
        self.assertEqual(len(score.missing_required_skills), 0)
        self.assertGreater(len(score.strengths), 0)
        self.assertTrue(score.academic_passed)
        print("✓ test_05_ai_matching_engine passed")

    def test_06_pipeline_stage_transition(self):
        """Test candidate advancing through Applied -> Shortlisted -> Interview -> Offer -> Rejected."""
        res = self.client.get("/api/candidates")
        cand_id = res.json()["candidates"][0]["candidate"]["id"]

        # Advance to Interview
        patch_res = self.client.patch(f"/api/candidates/{cand_id}/stage", json={"stage": "Interview"})
        self.assertEqual(patch_res.status_code, 200)
        self.assertEqual(patch_res.json()["candidate"]["stage"], "Interview")

        # Reject with specific reason
        reject_res = self.client.patch(
            f"/api/candidates/{cand_id}/stage",
            json={"stage": "Rejected", "rejection_reason": "Salary expectation mismatch"}
        )
        self.assertEqual(reject_res.status_code, 200)
        self.assertEqual(reject_res.json()["candidate"]["stage"], "Rejected")
        self.assertEqual(reject_res.json()["candidate"]["rejection_reason"], "Salary expectation mismatch")

        # Add Recruiter Note
        note_res = self.client.post(
            f"/api/candidates/{cand_id}/notes",
            json={"content": "Strong system design skills demonstrated in Round 1", "author": "Lead Recruiter"}
        )
        self.assertEqual(note_res.status_code, 200)
        self.assertGreaterEqual(len(note_res.json()["notes"]), 1)
        print("✓ test_06_pipeline_stage_transition passed")

    def test_07_side_by_side_comparison(self):
        """Test side-by-side comparison matrix of candidates."""
        res = self.client.get("/api/candidates")
        candidates = res.json()["candidates"]
        c_ids = [candidates[0]["candidate"]["id"], candidates[1]["candidate"]["id"]]
        job_id = res.json()["active_job"]["id"]

        comp_res = self.client.post("/api/candidates/compare", json={"candidate_ids": c_ids, "job_id": job_id})
        self.assertEqual(comp_res.status_code, 200)
        data = comp_res.json()
        self.assertEqual(len(data["candidates"]), 2)
        self.assertIn("skills_matrix", data)
        self.assertIn("common_skills", data["skills_matrix"])
        self.assertIn("unique_skills", data["skills_matrix"])
        print("✓ test_07_side_by_side_comparison passed")

    def test_08_bulk_email_campaigns(self):
        """Test sending bulk emails to candidates with template interpolation."""
        res = self.client.get("/api/candidates")
        c_ids = [res.json()["candidates"][0]["candidate"]["id"]]

        email_payload = {
            "candidate_ids": c_ids,
            "template_type": "interview",
            "subject": "Interview Invitation: {{job_title}} at {{company}}",
            "body_template": "Dear {{name}},\n\nYou are invited for an interview at {{company}} for {{job_title}} on {{interview_date}}.",
            "company_name": "HireSwift",
            "interview_date": "Friday at 4:00 PM IST",
            "interview_link": "https://meet.google.com/test-link"
        }

        send_res = self.client.post("/api/email/bulk", json=email_payload)
        self.assertEqual(send_res.status_code, 200)
        data = send_res.json()
        self.assertEqual(data["total_sent"], 1)
        self.assertEqual(data["sent_records"][0]["status"], "Delivered")
        self.assertIn("Friday at 4:00 PM IST", data["sent_records"][0]["body"])

        # Check outbox history
        hist_res = self.client.get("/api/email/history")
        self.assertEqual(hist_res.status_code, 200)
        self.assertGreaterEqual(len(hist_res.json()["emails"]), 1)
        print("✓ test_08_bulk_email_campaigns passed")

if __name__ == "__main__":
    unittest.main()
