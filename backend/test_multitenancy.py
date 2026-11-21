import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uuid
from backend.app.main import (
    register_company, login_company, get_jobs, get_candidates, 
    create_job, get_duplicates, get_dashboard_stats
)
from backend.app.models import CompanyRegisterRequest, CompanyLoginRequest, JobDescription
from backend.app.db import db, DEMO_COMPANY_ID
from fastapi import HTTPException

print("=== STARTING MULTI-TENANCY DATA SEGREGATION TESTS ===", flush=True)

# 1. Test Unauthenticated Call (No token or auth header)
try:
    get_jobs(authorization=None, token=None)
    assert False, "Should have raised 401 HTTPException"
except HTTPException as e:
    assert e.status_code == 401
    print(f"PASS [1/6]: Unauthenticated request raised HTTP {e.status_code}: {e.detail}", flush=True)

# 2. Test Demo Login & Demo Data Access
demo_login = login_company(CompanyLoginRequest(work_email="hr@acme.com", password="demo123"))
assert demo_login["status"] == "success"
demo_token = demo_login["token"]
demo_header = f"Bearer {demo_token}"
print(f"PASS [2/6]: Logged in to Demo Account ({demo_login['company']['company_name']})", flush=True)

demo_jobs_res = get_jobs(authorization=demo_header)
demo_jobs = demo_jobs_res["jobs"]
print(f"PASS [3/6]: Demo account sees {len(demo_jobs)} jobs (Expected 5)", flush=True)
assert len(demo_jobs) == 5, f"Expected 5 jobs, got {len(demo_jobs)}"

demo_cands_res = get_candidates(authorization=demo_header)
demo_cands = demo_cands_res["candidates"]
print(f"PASS [4/6]: Demo account sees {len(demo_cands)} candidates (Expected 13)", flush=True)
assert len(demo_cands) == 13, f"Expected 13 candidates, got {len(demo_cands)}"

# 3. Test Register New Company
new_email = f"lead_{uuid.uuid4().hex[:6]}@quantumai.org"
new_comp_res = register_company(CompanyRegisterRequest(
    company_name="QuantumAI Labs",
    work_email=new_email,
    password="supersecretpassword",
    recruiter_name="Rohan Varma",
    company_size="11-50",
    industry="Artificial Intelligence"
))
assert new_comp_res["status"] == "success"
new_token = new_comp_res["token"]
new_header = f"Bearer {new_token}"
new_company_id = new_comp_res["company"]["id"]
print(f"PASS [5/6]: Registered new company '{new_comp_res['company']['company_name']}' with ID {new_company_id}", flush=True)

# Verify New Company has ZERO jobs, ZERO candidates, and ZERO duplicates
new_jobs_res = get_jobs(authorization=new_header)
assert len(new_jobs_res["jobs"]) == 0, f"Expected 0 jobs for new company, got {len(new_jobs_res['jobs'])}"

new_cands_res = get_candidates(authorization=new_header)
assert len(new_cands_res["candidates"]) == 0, f"Expected 0 candidates for new company, got {len(new_cands_res['candidates'])}"

new_dups_res = get_duplicates(authorization=new_header)
assert new_dups_res["total_duplicates"] == 0, f"Expected 0 duplicates for new company, got {new_dups_res['total_duplicates']}"

new_stats_res = get_dashboard_stats(authorization=new_header)
assert new_stats_res["total_candidates"] == 0
assert new_stats_res["total_jobs"] == 0
print("PASS [5b/6]: New company starts with a 100% clean, isolated slate (0 jobs, 0 candidates, 0 duplicates)", flush=True)

# 4. New Company Posts a Job Opening
created_job = create_job(
    JobDescription(
        title="Senior LLM Research Engineer",
        department="Core AI",
        location="Bengaluru (Hybrid)",
        employment_type="Full-Time",
        description="Pioneering transformer and reasoning architectures.",
        required_skills=["PyTorch", "Transformers", "Distributed Training"],
        min_experience=3.0,
        max_experience=7.0,
        min_cgpa=8.5
    ),
    authorization=new_header
)
assert created_job["status"] == "success"
job_id = created_job["job"].id
print(f"PASS [6/6]: New company created job '{created_job['job'].title}' (company_id: {created_job['job'].company_id})", flush=True)

# Verify new company sees 1 job
new_jobs_updated = get_jobs(authorization=new_header)["jobs"]
assert len(new_jobs_updated) == 1
assert new_jobs_updated[0]["job"].id == job_id

# Verify demo company still strictly sees ONLY its 5 demo jobs (NEW JOB IS NOT LEAKED)
demo_jobs_check = get_jobs(authorization=demo_header)["jobs"]
assert len(demo_jobs_check) == 5
assert not any(j["job"].id == job_id for j in demo_jobs_check)
print("PASS: Verified strict isolation! Demo company cannot see new company's job, and new company cannot see demo company's jobs.", flush=True)

print("\n=======================================================", flush=True)
print("ALL MULTI-TENANT AUTHORIZATION TESTS PASSED PERFECTLY!", flush=True)
print("=======================================================", flush=True)
