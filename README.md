# HireSwift — Smart ATS for Small Teams 🚀

> **Problem Statement 1 (Enginow Hackathon)**: Small companies and startups receive hundreds of resumes for a single role. HR teams scan them by hand, miss good candidates, and take weeks to shortlist.  
> **Solution**: **HireSwift** — A small-scale, ultra-fast, and data-driven Applicant Tracking System that automates bulk resume parsing, calibrates multi-factor JD match scoring, manages hiring pipelines, and streamlines candidate outreach with zero manual screening overhead.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_19_%2B_Vite-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 Executive Summary & Problem Statement Alignment

| Problem Statement Requirement | HireSwift Implementation |
| :--- | :--- |
| **1. Bulk Resume Ingestion (PDF/DOCX)** | High-throughput parsing for batches of `.pdf` and `.docx` files. Extracts contact info, academics (CGPA, 10th %, 12th %, degree), work history, and 150+ categorized skills. |
| **2. Dynamic Job Descriptions & Scoring** | Multi-opening management. Tunable recruiter scoring weights (Skills, Experience, Academics, Domain) with strict 100% total sum enforcement. Composite 0–100% match scores. |
| **3. Multi-Faceted Recruiter Filtering** | Unified 36px control bar: Academic cutoff gates (CGPA, 10th/12th %), Experience dropdowns, Location filter, and **Role-Aware Contextual Skills** bar. |
| **4. Hiring Pipeline Management** | 5-stage interactive workflow (`Applied` ➔ `Shortlisted` ➔ `Interview` ➔ `Offer` / `Rejected`) across both Kanban and Ranked Table views, complete with recruiter notes and structured rejection logs. |
| **5. Recruiter Dashboard & Comparison** | Centralized Company Command Center with real-time applicant stats, combined with a **Side-by-Side Candidate Comparison Matrix** (2–4 candidates) highlighting skill overlaps and gaps. |
| **Bonus: AI Matching & Insights** | Explainable AI pros, risks/gaps, and hiring recommendations generated per candidate against the active JD. |
| **Bonus: Duplicate Detection** | Multi-attribute detection (Email, Phone, LinkedIn, Content Hash, Fuzzy Name + College) with a 1-click **Duplicate Management Hub** to review and merge profiles. |
| **Bonus: Bulk Candidate Outreach** | Dual-Mode templated email dispatch (Interview Invites, Tech Assessments, Shortlist Notifications, Rejections) with dynamic variable interpolation and an auditable dispatch history. |
| **Bonus: Skill-Gap Insights** | Visual color-coded chip breakdown showing matched must-have skills, missing required skills, and complementary bonus technologies. |

---

## 🏛️ System Architecture

HireSwift is engineered as a clean, decoupled full-stack platform:

```
                                  ┌────────────────────────────────────────┐
                                  │      HireSwift Full-Stack Web App      │
                                  │       (React 19 + Vite + Tailwind)     │
                                  └───────────────────┬────────────────────┘
                                                      │ REST API (JSON)
                                                      ▼
                                  ┌────────────────────────────────────────┐
                                  │          FastAPI Async Backend         │
                                  │              (Port 8000)               │
                                  └───────┬──────────────┬───────────┬─────┘
                                          │              │           │
            ┌─────────────────────────────┴────┐         │           └─────────────────────────────┐
            ▼                                  ▼         ▼                                         ▼
┌───────────────────────┐          ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│ Resume Parsing Engine │          │  AI Matcher & Scorer  │ │   Duplicate Detector  │ │ Dual Outreach Engine  │
│ - pypdf & docx text   │          │ - Recruiter Weights   │ │ - Exact Email/Phone   │ │ - Simulated Fast Mode │
│ - Academic NER & CGPA │          │ - TF-IDF Vectorizer   │ │ - Content MD5 Hash    │ │ - Live SMTP (TLS)     │
│ - 150+ Skills Taxon.  │          │ - Cosine Similarity   │ │ - Fuzzy Name + College│ │ - Dynamic Templating  │
└───────────────────────┘          └───────────────────────┘ └───────────────────────┘ └───────────────────────┘
```

---

## 🚀 Key Functional Modules

### 1. 📂 Deep Resume Parsing Engine (PDF & DOCX)
- **High-Precision Academic Extraction**:
  - Automatically identifies college/university degrees (B.Tech, M.Tech, B.E., B.Sc, MBA, etc.).
  - Extracts **College CGPA** (normalized to 10.0 scale, recognizing scales like 4.0 or 10.0).
  - Captures **10th (SSC)** and **12th (HSC)** percentages across Indian State Boards and CBSE/ICSE patterns.
  - Detects **Graduation Year** and education duration.
- **Contextual Contact Extraction**: Isolates applicant email addresses from recruiter session credentials to prevent false identity attribution.
- **Skill Taxonomy Normalization**: Standardizes 150+ skills into canonical forms (e.g. `Postgres` ➔ `PostgreSQL`, `K8s` ➔ `Kubernetes`, `ReactJS` ➔ `React`).

---

### 2. 🎛️ Recruiter Weight Calibration & Hard Eligibility Gates
- **Interactive Scoring Calibration**:
  - Recruiters customize importance sliders for each job: **Skills Overlap**, **Experience Relevancy**, **Academic Performance**, and **Domain / Semantic Fit**.
  - Built-in sum constraints ensure total weights always equal **100%**.
- **Hard Eligibility Cutoff Gates**:
  - Enforce minimum CGPA cutoffs (e.g. Min 7.0 / 10.0).
  - Enforce 12th board percentage criteria (e.g. Min 75%).
  - Set required minimum engineering experience.
- **Dynamic Skill Clusters**:
  - Classify extracted skills into **Must-Have (Required)** vs. **Nice-to-Have (Complementary)**.

---

### 3. 🔍 Smart Sourcing & Filter Control Bar
- **Unified 36px Control Bar**:
  - **Search**: Real-time debounced query across candidate names, skills, and colleges with `⌘K` shortcut and 1-click clear.
  - **Academic Cutoff Popover**: Floating menu with 1-click presets (`CGPA ≥ 6.0`, `7.0`, `8.0`, `8.5+`; `12th ≥ 70%`, `80%`, `90%`).
  - **Experience Dropdown**: Filter by `Campus / Fresher (0 exp)`, `≥ 1 yr`, `≥ 2 yrs`, `≥ 3 yrs`, `≥ 5+ yrs`.
  - **Location Dropdown**: Filter by major tech hubs (`Bengaluru`, `Pune`, `Delhi`, `Mumbai`, `Hyderabad`, `Remote`).
  - **Match Score Threshold**: Filter by AI fit (`≥ 50%`, `≥ 70%`, `≥ 80%`, `≥ 90%`).
- **Role-Aware Contextual Skills Bar**:
  - Automatically displays target skills relevant to the active role:
    - *UI / UX Designer*: `Figma`, `UI/UX design`, `Wireframing`, `Prototyping`, `Design Systems`, `User Research`.
    - *Software Engineer*: `Data Structures and Algorithms`, `Python`, `JavaScript`, `C++`, `Git`, `React`.
  - Click any skill chip to toggle filtering, or click **`+ Filter by Skill`** to search and filter by any custom technology.

---

### 4. 📊 Hiring Pipeline Kanban & Ranked Table
- **5-Stage Pipeline Progression**:
  - `Applied` ➔ `Shortlisted` ➔ `Interview` ➔ `Offer` / `Rejected`
- **Dual Visualizations**:
  - **Pipeline Kanban**: Horizontal stage columns with candidate count badges, quick stage advancement, and rejection logging.
  - **Ranked Shortlist Table**: High-density recruiter table showing composite match scores, verified academics, total experience, and core skills.
- **Audit Tracking**: Timestamped recruiter notes and structured rejection reasons saved per candidate.

---

### 5. 👥 Side-by-Side Candidate Comparison Matrix
- Check **2 to 4 candidates** and click the illuminated **`Compare (N)`** button to evaluate them side-by-side:
  - **Benchmark Grid**: Compare 10th %, 12th %, CGPA, College, Degree, and Total Experience.
  - **Skill Overlap & Gap Matrix**:
    - *Shared Competencies*: Skills common across all selected candidates.
    - *Unique Strengths*: Skills exclusive to Candidate A vs. Candidate B.
    - *Missing Required Skills*: Technology gaps relative to the job requirements.
  - **AI Pros & Cons**: Head-to-head strengths and risks.
  - **Direct Decision Actions**: Advance candidates to Interview or extend an Offer directly from the matrix.

---

### 6. 🛡️ Multi-Attribute Duplicate Detection & Merge Hub
- Automatically scans incoming resumes using:
  1. Exact normalized email address
  2. Exact 10-digit phone number
  3. LinkedIn profile URL
  4. Document MD5 text hash
  5. Fuzzy candidate name + matching college & graduation year
- **Duplicate Management Hub**: Inspect side-by-side differences between the original candidate and duplicate submission with 1-click **Merge**, **Keep Both**, or **Discard** options.

---

### 7. ✉️ Dual-Mode Bulk Candidate Outreach Engine
- **Dedicated Scopes**:
  - **Role Outreach (Job Workspace)**: Scoped strictly to that role with technical assessment links, deadlines, interview bookings, and a job-isolated dispatch log.
  - **Global Outreach (Navbar)**: Cross-job company announcements, warm talent pool notes, and company-wide rejection updates.
- **Dynamic Variable Interpolation**:
  - Supports `{{first_name}}`, `{{name}}`, `{{job_title}}`, `{{company}}`, `{{skills}}`, `{{assessment_link}}`, `{{assessment_deadline}}`, `{{interview_date}}`, `{{interview_link}}`.
- **Dual Dispatch Modes**:
  - **Mode 1: Simulated Fast Demo Mode (Default)**: Instant delivery with 0 network latency, 100% success rate, dynamic variable rendering, and persistent audit logging. Perfect for hackathon evaluation!
  - **Mode 2: Plug-and-Play Live SMTP**: If credentials are configured in `backend/.env`, HireSwift automatically dispatches real MIME emails over TLS to actual inboxes.

---

## 📁 Repository Structure

```
BWT/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py               # FastAPI application, routing, CORS & static bundle mount
│   │   ├── parser.py             # PDF & DOCX text extraction, academic & skill heuristics
│   │   ├── matcher.py            # AI multi-factor matching, TF-IDF cosine similarity, insights
│   │   ├── duplicates.py         # Multi-attribute duplicate detection engine
│   │   ├── models.py             # Pydantic v2 schemas for Candidates, Jobs, Scores, Emails
│   │   ├── db.py                 # Multi-tenant persistent JSON storage engine
│   │   ├── email_service.py      # Templated outreach, variable interpolation & SMTP engine
│   │   └── pdf_generator.py      # On-the-fly authentic PDF resume generator
│   ├── sample_resumes/           # Authentic .pdf and .docx sample test resumes
│   ├── uploads/                  # Ephemeral upload storage for incoming applicant resumes
│   ├── data/                     # Persistent JSON database (ats_database.json)
│   ├── .env.example              # Sample configuration for optional live SMTP
│   ├── requirements.txt          # Python backend dependencies
│   └── run_backend.py            # Standalone launcher for FastAPI backend
├── frontend/                     # Modern React 19 + Vite + Tailwind CSS SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                # Navigation, company branding, and global actions
│   │   │   ├── CompanyJobsDashboard.jsx  # Company landing page with active position cards
│   │   │   ├── CandidateFilters.jsx      # Unified 36px filter bar & role-aware skills
│   │   │   ├── CandidateRankingTable.jsx # Recruiter table view with score badge tiers
│   │   │   ├── CandidateDetailModal.jsx  # Candidate dossier with raw resume text viewer
│   │   │   ├── PipelineKanban.jsx        # 5-stage interactive hiring Kanban board
│   │   │   ├── SideBySideComparison.jsx  # 2-4 candidate comparison matrix
│   │   │   ├── ResumeUploader.jsx        # Bulk drag-and-drop uploader & sample loader
│   │   │   ├── JobDescriptionManager.jsx # JD creator, weight calibration & criteria editor
│   │   │   ├── DuplicateManagerModal.jsx # Duplicate review & 1-click merge center
│   │   │   ├── BulkEmailModal.jsx        # Templated email composer, preview & dispatch log
│   │   │   └── ExtendDeadlineModal.jsx   # Quick job deadline extension modal
│   │   ├── api.js                        # Authenticated API service layer
│   │   ├── App.jsx                       # Master state orchestrator & view routing
│   │   └── index.css                     # Tailwind CSS v4 & Google Stitch design tokens
│   ├── package.json
│   └── vite.config.js
├── tests/
│   └── test_hireswift.py         # Automated test suite for ATS capabilities
├── start_hireswift.bat           # 1-click Windows Batch launcher
├── start_hireswift.ps1           # 1-click PowerShell launcher
└── README.md                     # Comprehensive project documentation
```

---

## ⚡ Quick Start Guide (Run Locally)

### Prerequisites
- **Python**: 3.10+ (Tested with Python 3.12 / 3.13)
- **Node.js**: v18+ (Only required if modifying frontend source)

### Method 1: One-Click Startup (Recommended for Windows)

Simply double-click or run:
```powershell
.\start_hireswift.bat
```
*Or via PowerShell:*
```powershell
.\start_hireswift.ps1
```

---

### Method 2: Manual Startup

#### Step 1: Install Python Dependencies
```powershell
pip install -r backend/requirements.txt
```

#### Step 2: Build Frontend (Optional if pre-built)
```powershell
cd frontend
npm install
npm run build
cd ..
```

#### Step 3: Launch the Full-Stack Server
```powershell
python backend\run_backend.py
```

#### Step 4: Open in Browser
- **Recruiter Web Application**: [http://localhost:8000](http://localhost:8000)
- **Interactive OpenAPI / Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🧪 Demo Login Credentials

HireSwift includes pre-seeded multi-tenant demo data:
* **Email:** `revanthp2313.24@kgpian.iitkgp.ac.in`
* **Password:** `revanth`
* **Company:** `HappyWave`

---

## 📋 Evaluation Criteria Mapping

| Criterion | Implementation in HireSwift |
| :--- | :--- |
| **Filter Accuracy** | High-precision filters for **CGPA**, **12th %**, **10th %**, **Experience**, and **Location**. Dynamic role-aware skill chips with instant filtering. |
| **Parsing Quality** | `pypdf` and `python-docx` extract text reliably; regex & heuristic NER accurately parse contact info, normalized CGPA, board marks, 150+ skills, and employment history. |
| **UI / UX** | Clean Google Stitch-inspired design system permanently locked to Light Mode. Features a unified 36px control toolbar, interactive Kanban pipeline, split candidate dossier, and side-by-side comparison matrix. |
| **Scalability** | Modular FastAPI async backend, scikit-learn TF-IDF vectorization, persistent JSON storage with multi-tenancy, and production-optimized React 19 bundle. |
| **Real-world Usability** | 1-click demo data reset, side-by-side comparison matrix, interactive pipeline Kanban, bulk email campaigns with live preview, and duplicate detection & merge tools. |
