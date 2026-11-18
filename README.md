# HireSwift — Smart ATS for Small Teams 🚀

> **Problem Statement 1**: Small companies and startups receive hundreds of resumes for a single role. HR teams scan them by hand, miss good candidates, and take weeks to shortlist.  
> **Solution**: **HireSwift** — A small-scale, ultra-fast Applicant Tracking System that makes hiring structured, data-driven, and lightning-fast.

---

## 🌟 Key Highlights & Features

### 1. 📂 Bulk Resume Ingestion & Deep Structured Parsing (PDF / DOCX)
- **Multi-format Support**: Ingests batches of `.pdf` and `.docx` resumes simultaneously via drag-and-drop or file selector.
- **Structured Profile Extraction**:
  - **Candidate Contact**: Full Name, Email, Phone, Location, LinkedIn, GitHub, Portfolio links.
  - **Academic Records**: High-precision extraction of **10th (SSC) percentage**, **12th (HSC) percentage**, **College / University**, **Degree & Major**, **College CGPA** (normalized to 10.0 scale), and **Graduation Year**.
  - **Categorized Skills**: Automatically classifies 150+ technologies into *Frontend, Backend, Databases, Cloud & DevOps, AI & Data Science, Tools & Testing, and Soft Skills*. Normalizes aliases (e.g., `Postgres` ➔ `PostgreSQL`, `K8s` ➔ `Kubernetes`, `ReactJS` ➔ `React`).
  - **Experience & Work History**: Computes total years of experience, extracts past company names, job titles, and duration dates.
  - **Projects & Certifications**: Parses technical projects and cloud credentials (AWS Certified, CKA, etc.).
  - **Raw Resume Text**: Preserved for full-text search and recruiter in-app document viewing.

---

### 2. 🎯 Multi-Factor AI Resume-JD Matching Engine (0 - 100%)
- **Dynamic Multi-Opening Scoring**: Create, edit, and switch between multiple Job Descriptions (*Senior Full-Stack, Frontend Specialist, Python Backend, DevOps Engineer, Campus Fresher*).
- **Transparent Composite Score**:
  - 🛠️ **Required Skills Fit (40%)**: Strict exact & semantic overlap against must-have skills.
  - 🌟 **Preferred Skills Bonus (15%)**: Bonus score for supplementary tech stack competencies.
  - 💼 **Experience Fit (20%)**: Evaluates candidate experience against role minimums with fair scaling.
  - 🎓 **Academic Eligibility (15%)**: Checks candidate's CGPA, 10th, and 12th marks against JD cutoff thresholds.
  - 🧠 **Semantic Relevance (10%)**: Uses TF-IDF vectorization and Cosine Similarity to compare candidate background context against job responsibilities.
- **Tier Classification**: Instant badge tiers (*Strong Match >= 80%*, *Good Match 65-79%*, *Moderate Match 50-64%*, *Low Match < 50%*).

---

### 3. 🔍 Multi-Faceted Recruiter Filtering & Global Search
- **Academic Cutoff Sliders**:
  - Filter candidates by minimum **10th (SSC) Percentage** (0% - 95%)
  - Filter candidates by minimum **12th (HSC) Percentage** (0% - 95%)
  - Filter candidates by minimum **College CGPA** (0.0 - 10.0)
  - Graduation Year cutoff (e.g. 2021 or later)
- **Skills Multi-Select**:
  - Filter by required technologies with instant tag selection
  - **Match Logic Toggle**: Match **ANY** selected skill vs. Match **ALL** selected skills
- **Experience Range**: Slider for min & max years of experience
- **Location Filter**: Bengaluru, Pune, Delhi, Mumbai, Hyderabad, Remote, etc.
- **Pipeline Stage Filter**: Filter by Applied, Shortlisted, Interview, Offer, Rejected
- **Minimum Score Cutoff**: Set an ATS score threshold (e.g. only show candidates >= 75%)
- **Global Full-Text Search**: Real-time debounced query across candidate names, skills, college, and raw text.
- **Multi-Parameter Sorting**: Sort by Match Score, Total Experience, CGPA, 12th %, 10th %, or Name.

---

### 4. 📊 Hiring Pipeline Management
- **Full Stage Progression**: `Applied` ➔ `Shortlisted` ➔ `Interview` ➔ `Offer` / `Rejected`
- **Dual Recruiter Views**:
  - **Interactive Kanban Board**: 5 visual stage columns with candidate count badges, quick stage advancement/retreat buttons, and rejection reason tracking.
  - **High-Density Table View**: Screen dozens of candidates in seconds with inline stage selectors and status tags.
- **Recruiter Notes**: Add timestamped evaluation notes (e.g., *"Passed technical screening; salary expectation 24 LPA"*) stored per candidate.
- **Structured Rejection**: Record specific rejection reasons (*Skill gap in Kubernetes, Experience mismatch, etc.*) to ensure transparent feedback.

---

### 5. 👥 Side-by-Side Candidate Comparison Matrix
- Select **2, 3, or 4 candidates** using checkboxes and open the comparison matrix.
- **Comparative Analysis**:
  - **Match Score & Sub-scores**: Compare skills, experience, academics, and semantic relevance side-by-side.
  - **Academic Benchmark Grid**: Compare 10th %, 12th %, CGPA, College, Degree, and Passing Year.
  - **Skill Overlap & Gap Matrix**:
    - *Common Skills*: Shared by all selected candidates.
    - *Unique Skills*: Competencies exclusive to Candidate A vs Candidate B.
    - *Missing Required Skills*: Relative to the target Job Description.
  - **AI Pros & Cons**: Strengths and potential risks compared head-to-head.
  - **Direct Decision Buttons**: Advance to Interview or Extend Offer directly from the matrix.

---

### 6. 🎁 Bonus Features Included

#### 🤖 AI Resume-JD Matching & Explainable Insights
- Generates transparent, human-readable explanations of why a candidate scored high or low:
  - **Key Strengths**: Specific highlights (e.g. *"Matches 5 core required technologies: React, TypeScript, Node.js, PostgreSQL"*).
  - **Risks & Gaps**: Flagging missing skills or academic deficits (e.g. *"Missing required skill: Kubernetes"*).
  - **Hiring Recommendation**: Concrete advice (*"Strong Hire: Fast-track to technical screening"*).

#### 🛡️ Duplicate Detection & Resolution Center
- Automatically scans incoming resumes against existing candidates using:
  - Exact normalized email match
  - Exact normalized 10-digit phone number
  - LinkedIn profile URL
  - Exact document content MD5 hash
  - Fuzzy candidate name + matching college / graduation year
- **Duplicate Management Hub**: View flagged duplicates, inspect diff with original profile, and resolve with one click:
  - **Merge**: Merges new skills and experience into original candidate.
  - **Keep Both**: Retains both as distinct applicants.
  - **Discard**: Removes the duplicate record.

#### ✉️ Bulk Email Campaigns with Dynamic Templates
- Pre-built templates:
  - *Technical Interview Invitation* (with interview date and meeting link)
  - *Application Shortlisted Notification*
  - *Job Offer Letter*
  - *Polite Rejection with Constructive Skill Gap Feedback*
- **Dynamic Variable Interpolation**: `{{name}}`, `{{job_title}}`, `{{company}}`, `{{skills}}`, `{{experience}}`, `{{interview_date}}`, `{{interview_link}}`.
- **Live Preview**: See exact rendered email for the selected candidate before sending.
- **Sent Outbox**: Log of all dispatched emails with delivery status and timestamps.

#### 💡 Skill-Gap Visualizer
- Color-coded chips breaking down matched required skills (green), missing required skills (red), matched preferred skills (teal), and bonus skills (purple).

---

## 📁 Repository Structure

```
c:\PBS\BWT\
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py               # FastAPI application, routing, CORS, static mounting
│   │   ├── parser.py             # PDF & DOCX text extraction, academic & skill heuristics
│   │   ├── matcher.py            # AI multi-factor matching, TF-IDF cosine similarity, insights
│   │   ├── duplicates.py         # Multi-attribute duplicate detection engine
│   │   ├── models.py             # Pydantic v2 schemas for Candidates, JDs, Scores, Emails
│   │   ├── db.py                 # Persistent database store & seeding mechanism
│   │   ├── email_service.py      # Templated email rendering & outbox logger
│   │   └── sample_data.py        # Realistic sample Job Descriptions & Candidate profiles
│   ├── sample_resumes/           # Real generated .pdf and .docx test resumes
│   ├── uploads/                  # Storage directory for newly uploaded resumes
│   ├── data/                     # Persistent JSON database (ats_database.json)
│   ├── generate_sample_resumes.py# Script to generate authentic PDF & DOCX test files
│   ├── requirements.txt          # Python backend dependencies
│   └── run_backend.py            # Standalone launcher for FastAPI backend
├── frontend/                     # Modern React + Vite + Tailwind CSS SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                # Navigation, active JD switcher, theme toggle, actions
│   │   │   ├── DashboardStats.jsx        # Metrics, pipeline funnel bar, quick status cards
│   │   │   ├── CandidateFilters.jsx      # Academic sliders, skills selector, exp range
│   │   │   ├── CandidateRankingTable.jsx # Recruiter table & card views with sorting
│   │   │   ├── CandidateDetailModal.jsx  # AI score breakdown, skill gap chips, paper preview, notes
│   │   │   ├── PipelineKanban.jsx        # 5-stage interactive hiring Kanban board
│   │   │   ├── SideBySideComparison.jsx  # 2-4 candidate comparison matrix
│   │   │   ├── ResumeUploader.jsx        # Bulk drag-and-drop uploader & sample downloader
│   │   │   ├── JobDescriptionManager.jsx # JD creator, editor, and criteria manager
│   │   │   ├── DuplicateManagerModal.jsx # Duplicate review & merge center
│   │   │   └── BulkEmailModal.jsx        # Templated email composer, preview & outbox
│   │   ├── api.js                        # Client API communication service
│   │   ├── App.jsx                       # Master state orchestrator & theme persistence
│   │   └── index.css                     # Tailwind CSS v4 & Light/Dark Stitch design tokens
│   ├── package.json
│   └── vite.config.js
├── stitch_export/                # Stitch UI design system spec & HTML screen references
├── tests/
│   └── test_hireswift.py         # Comprehensive unit & integration test suite (8 tests)
├── start_hireswift.ps1           # 1-click PowerShell launcher
├── start_hireswift.bat           # 1-click Windows Batch launcher
└── README.md                     # Complete documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: 3.10+ (Tested with Python 3.13)
- **Node.js**: v18+

### Step 1: Install Python Dependencies
```powershell
pip install -r backend/requirements.txt
```

### Step 2: Install Frontend Dependencies & Build
```powershell
cd frontend
npm install
npm run build
cd ..
```

### Step 3: Launch HireSwift Full-Stack Application
You can run the launcher script:
```powershell
.\start_hireswift.ps1
```
Or run directly with Python:
```powershell
py backend\run_backend.py
```

### Step 4: Access the Application
- **Recruiter Web Application**: [http://localhost:8000](http://localhost:8000)
- **Interactive OpenAPI / Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

*(Optional for Frontend Hot-Reload Development)*:
```powershell
cd frontend
npm run dev
# Vite runs at http://localhost:5173 with API proxying to port 8000
```

---

## 🧪 Running the Automated Test Suite

To verify all system components (parsing, matching, filtering, stage progression, duplicates, comparison, emails):

```powershell
py tests\test_hireswift.py
```

**Test Coverage Summary**:
- `test_01_health_and_stats`: Validates dashboard API & stage counters
- `test_02_pdf_and_docx_parsing`: Verifies exact extraction of 10th %, 12th %, CGPA, and skills from real PDF and DOCX files
- `test_03_bulk_upload_endpoint`: Tests bulk multipart upload and automatic duplicate detection
- `test_04_filtering_by_academics_and_skills`: Tests multi-faceted filtering on CGPA (>=8.5), 12th (>=90%), and skills (AND/OR logic)
- `test_05_ai_matching_engine`: Validates multi-factor composite scoring and AI insights generation
- `test_06_pipeline_stage_transition`: Validates moving candidates across stages, adding recruiter notes, and recording rejection reasons
- `test_07_side_by_side_comparison`: Validates side-by-side comparison matrix and skill overlap calculation
- `test_08_bulk_email_campaigns`: Validates bulk templated email rendering with placeholder substitution and outbox logging

---

## 📋 Evaluation Criteria Mapping

| Criterion | Implementation in HireSwift |
| :--- | :--- |
| **Filter Accuracy** | Precise sliders for **10th %**, **12th %**, **CGPA**, and **Graduation Year**; multi-select skills with *Match ANY* vs *Match ALL* modes; range slider for years of experience; location dropdown. |
| **Parsing Quality** | `pypdf` and `python-docx` extract text reliably; regex & heuristic NER accurately extract contact info, academic scores, 150+ categorized skills, and work history. |
| **UI / UX** | Clean Stitch-inspired design system with persistent 1-click Light Mode & Dark Mode toggle, built with Tailwind CSS v4 and Lucide icons; interactive Kanban pipeline, ranked recruiter table, split dossier with paper resume viewer, and color-coded score badges. |
| **Scalability** | Modular Python backend using FastAPI async endpoints, scikit-learn TF-IDF vectorization, persistent JSON/SQLite storage, and standalone frontend bundle. |
| **Real-world Usability** | One-click demo data reset, side-by-side comparison matrix, interactive pipeline Kanban, bulk email campaigns with live preview, and duplicate detection & merge tools. |
