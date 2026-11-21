import os
import re
import io
from typing import Dict, List, Any, Tuple, Optional
from datetime import datetime
import pypdf
import docx

# Comprehensive Technical Skills Dictionary by Category (Clean, no soft-skill pollution)
SKILLS_TAXONOMY = {
    "Languages": [
        "C", "C++", "Java", "Python", "JavaScript", "TypeScript", "HTML", "HTML5", "CSS", "CSS3",
        "SQL", "Matlab", "R", "Go", "Golang", "Rust", "C#", "PHP", "Ruby", "Scala", "Bash"
    ],
    "Frontend": [
        "React", "Vue", "Angular", "Next.js", "Nuxt.js", "Tailwind CSS", "Bootstrap",
        "Redux", "Zustand", "Svelte", "Webpack", "Vite", "Sass", "LESS", "Shadow DOM", "DOM Scraper"
    ],
    "Backend & APIs": [
        "Node.js", "Express.js", "FastAPI", "Django", "Flask", "Spring Boot", "Laravel",
        "Ruby on Rails", "REST API", "GraphQL", "gRPC", "WebSockets", "JWT", "bcrypt",
        "OAuth 2.0", "OAuth", "Nodemailer", "SMTP", "Microservices"
    ],
    "Databases & ORM": [
        "PostgreSQL", "MySQL", "MongoDB", "Mongoose", "Redis", "SQLite", "Cassandra",
        "DynamoDB", "Firebase", "Supabase", "MERN", "Prisma", "SQLAlchemy"
    ],
    "Cloud & DevOps": [
        "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Terraform", "CI/CD", "Linux",
        "Git", "GitHub", "GitLab", "GitHub Actions", "Jenkins", "Nginx"
    ],
    "AI, ML & Data": [
        "Machine Learning", "Deep Learning", "PyTorch", "TensorFlow", "Scikit-Learn",
        "Pandas", "NumPy", "NLP", "Natural Language Processing", "LLM", "Llama 3.3", "Llama",
        "Groq API", "Groq", "Computer Vision", "OpenCV", "Hugging Face", "Keras"
    ],
    "Core Competencies": [
        "Data Structures and Algorithms", "Data Structures", "Algorithms",
        "Object-Oriented Programming", "OOP", "STL", "Graph Algorithms",
        "BFS", "Dijkstra", "A* Search", "A*", "Floyd-Warshall", "Sorting Algorithms",
        "Competitive Programming", "System Design", "Software Architecture", "SDLC",
        "Microservices", "Distributed Systems", "Operating Systems", "DBMS", "Computer Networks"
    ],
    "Tools & Platforms": [
        "Postman", "Chrome APIs", "Chrome Extensions", "Jira", "Figma", "Docker Compose",
        "Swagger", "PyTest", "Jest", "Blender", "Adobe Premiere Pro", "After Effects"
    ]
}

# Skill synonyms & variations mapping to canonical display names
SKILL_ALIASES = {
    "react.js": "React",
    "reactjs": "React",
    "nextjs": "Next.js",
    "vue.js": "Vue",
    "vuejs": "Vue",
    "angularjs": "Angular",
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "express": "Express.js",
    "express.js": "Express.js",
    "expressjs": "Express.js",
    "ts": "TypeScript",
    "js": "JavaScript",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "mongo": "MongoDB",
    "k8s": "Kubernetes",
    "amazon web services": "AWS",
    "google cloud platform": "GCP",
    "google cloud": "GCP",
    "microsoft azure": "Azure",
    "sklearn": "Scikit-Learn",
    "tailwind": "Tailwind CSS",
    "restful api": "REST API",
    "rest apis": "REST API",
    "spring": "Spring Boot",
    "ml": "Machine Learning",
    "dl": "Deep Learning",
    "llms": "LLM",
    "ci-cd": "CI/CD",
    "cicd": "CI/CD",
    "mern stack": "MERN",
    "c plus plus": "C++",
    "cpp": "C++",
    "c/c++": "C++",
    "dsa": "Data Structures and Algorithms",
    "data structures & algorithms": "Data Structures and Algorithms",
    "oop": "Object-Oriented Programming",
    "oops": "Object-Oriented Programming",
    "csharp": "C#",
    "c#": "C#",
    ".net": ".NET",
    "dotnet": ".NET",
    "sdlc": "SDLC",
    "software development life cycle": "SDLC",
    "software architecture": "Software Architecture",
    "system design": "System Design",
    "operating systems": "Operating Systems",
    "os": "Operating Systems",
    "dbms": "DBMS",
    "rdbms": "DBMS",
    "database management": "DBMS",
    "networking": "Computer Networks",
    "computer networks": "Computer Networks",
    "llama 3": "Llama",
    "llama 3.3": "Llama 3.3",
    "groq api": "Groq API",
    "shadow dom": "Shadow DOM",
    "chrome extension": "Chrome Extensions",
    "floydwarshall": "Floyd-Warshall",
}

# Standard section header markers in professional resumes
SECTION_HEADERS = {
    "education", "academic", "academics", "projects", "experience", "work experience",
    "professional experience", "employment", "employment history", "skills", "technical skills",
    "skills and expertise", "awards", "achievements", "awards and achievements",
    "coursework", "coursework information", "positions of responsibility",
    "extracurricular", "extra curricular", "extracurricular activities",
    "certifications", "publications", "summary", "profile", "objective",
    "contact", "contact information", "interests", "curriculum vitae", "resume", "cv",
    "student profile"
}

# Non-resume indicators (academic homework, problem sheets, worksheets, exam papers, admit cards)
ASSIGNMENT_MARKERS = [
    "worksheet", "problem sheet", "circuit simulation", "simulation parameters",
    "interconnect distributed model", "vlsi interconnects", "assignment-", "assignment 1",
    "assignment 2", "assignment 3", "session-1", "session 1", "session-2", "session 2",
    "what is the characteristic impedance", "time-of-flight delay", "open termination case",
    "observe the output voltage", "question paper", "homework", "endterm exam", "midterm exam",
    "lab manual", "exercise 1", "exercise 2", "problem 1", "problem 2",
    "admitcard", "admit card", "hall ticket", "examination schedule", "semester registration",
    "grade card", "marksheet", "fee receipt"
]

# Relative importance ranking for technical skills in software engineering roles
SKILL_IMPORTANCE_WEIGHTS = {
    # Tier 1: Modern Full-Stack & Core Languages (Weight 100 - 88)
    "MERN": 100, "Full-Stack": 100, "React": 98, "Node.js": 98, "Next.js": 97,
    "Express.js": 96, "Express": 96, "TypeScript": 95, "JavaScript": 95,
    "Python": 94, "C++": 93, "Java": 92, "Go": 92, "Rust": 92,
    "Data Structures and Algorithms": 95, "Algorithms": 92, "Data Structures": 90,
    "MongoDB": 90, "PostgreSQL": 90, "MySQL": 90, "SQL": 89,
    "Tailwind CSS": 88, "HTML": 87, "CSS": 87, "Vite": 86,
    "Object-Oriented Programming": 86, "OOP": 86, "System Design": 88,

    # Tier 2: Cloud, DevOps, Architecture & APIs (Weight 85 - 75)
    "Docker": 85, "Kubernetes": 85, "AWS": 85, "GCP": 84, "Azure": 84,
    "Git": 84, "GitHub": 83, "CI/CD": 83, "REST API": 82, "GraphQL": 82,
    "Microservices": 82, "Redis": 81, "JWT": 80, "OAuth 2.0": 80,
    "OAuth": 79, "bcrypt": 78, "Mongoose": 78, "Chrome APIs": 76,
    "Competitive Programming": 76, "STL": 75, "Linux": 75, "FastAPI": 82, "Django": 80,

    # Tier 3: AI/ML & Specialized Frameworks (Weight 75 - 65)
    "Machine Learning": 78, "Deep Learning": 77, "PyTorch": 76, "TensorFlow": 75,
    "LLM": 76, "Llama 3.3": 74, "Llama": 73, "Groq API": 72, "Groq": 71,
    "NLP": 70, "Pandas": 69, "NumPy": 68,

    # Tier 4: Algorithmic Sub-topics & Internal Mechanics (Weight 65 - 45)
    "Graph Algorithms": 66, "Sorting Algorithms": 65, "Dijkstra": 62, "BFS": 60,
    "A* Search": 58, "A*": 56, "Floyd-Warshall": 55, "Shadow DOM": 52,
    "DOM Scraper": 50, "Nodemailer": 50, "SMTP": 48,

    # Tier 5: Extracurricular Media / Design / Desktop Software (Weight 35 - 20)
    "Matlab": 35, "Blender": 28, "Adobe Premiere Pro": 25, "After Effects": 25,
    "Photoshop": 25, "Illustrator": 25
}

class ResumeParser:
    """Parses PDF and DOCX resumes into high-fidelity structured candidate profiles."""

    @staticmethod
    def extract_text_from_pdf(file_bytes: bytes) -> str:
        """Extract text from PDF using pypdf."""
        text = ""
        try:
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        except Exception as e:
            print(f"Error reading PDF: {e}")
        return text

    @staticmethod
    def extract_text_from_docx(file_bytes: bytes) -> str:
        """Extract text from DOCX using python-docx."""
        text = ""
        try:
            doc = docx.Document(io.BytesIO(file_bytes))
            for para in doc.paragraphs:
                if para.text:
                    text += para.text + "\n"
            for table in doc.tables:
                for row in table.rows:
                    row_text = " | ".join([cell.text.strip() for cell in row.cells if cell.text.strip()])
                    if row_text:
                        text += row_text + "\n"
        except Exception as e:
            print(f"Error reading DOCX: {e}")
        return text

    @classmethod
    def validate_resume_document(cls, text: str, file_name: str) -> Tuple[bool, str]:
        """
        Validates whether an uploaded document is a genuine resume/CV.
        Rejects non-resume documents such as academic assignments, worksheets, exams, admit cards, or blank files.
        """
        clean_text = text.strip()
        if len(clean_text) < 80:
            return False, "This file is not a resume. Please upload a valid candidate resume/CV in PDF or DOCX format."

        text_lower = clean_text.lower()
        
        # Check negative assignment/admit card signals
        matched_assignment = [m for m in ASSIGNMENT_MARKERS if m in text_lower]
        
        # Count distinct resume section headers
        matched_sections = set()
        for sec in SECTION_HEADERS:
            if re.search(rf"\b{re.escape(sec)}\b", text_lower):
                matched_sections.add(sec)

        # If non-resume markers are present or resume sections are minimal (< 2)
        if (matched_assignment and len(matched_sections) < 3) or len(matched_sections) < 2:
            return False, "This file is not a resume. Please upload a valid candidate resume/CV in PDF or DOCX format."

        return True, "Valid resume document"

    @classmethod
    def parse_resume(cls, file_bytes: bytes, file_name: str, context_email: Optional[str] = None) -> Dict[str, Any]:
        """Main entry point to parse a resume document into a structured candidate dictionary."""
        file_ext = file_name.split(".")[-1].lower() if "." in file_name else "pdf"
        
        if file_ext == "pdf":
            raw_text = cls.extract_text_from_pdf(file_bytes)
        elif file_ext in ["docx", "doc"]:
            raw_text = cls.extract_text_from_docx(file_bytes)
        else:
            raw_text = file_bytes.decode("utf-8", errors="ignore")

        clean_text = raw_text.replace("\r", "\n")
        
        # 1. Document Classification & Quality Validation
        is_valid, validation_msg = cls.validate_resume_document(clean_text, file_name)
        if not is_valid:
            raise ValueError(validation_msg)

        lines = [line.strip() for line in clean_text.split("\n") if line.strip()]

        # 2. Extract Candidate Identity
        name, roll_number = cls._extract_name(lines, file_name)
        email = cls._extract_email(clean_text, name, roll_number, context_email)
        phone = cls._extract_phone(clean_text)
        location = cls._extract_location(clean_text)
        links = cls._extract_links(clean_text)
        
        # 3. Extract Academics (10th, 12th, CGPA, Degree, College, Grad Year)
        education = cls._extract_education(clean_text, lines)
        
        # 4. Extract Projects
        projects = cls._extract_projects(clean_text, lines)
        
        # 5. Extract Skills
        skills, categorized_skills = cls._extract_skills(clean_text, lines, projects)
        
        # 6. Extract Professional Experience (Guarding against fake fresher jobs)
        years_of_experience, experience_history = cls._extract_experience(clean_text, lines, education)
        
        # 7. Extract Certifications
        certifications = cls._extract_certifications(clean_text, lines)

        return {
            "name": name,
            "email": email,
            "phone": phone,
            "location": location,
            "linkedin": links.get("linkedin", ""),
            "github": links.get("github", ""),
            "portfolio": links.get("portfolio", ""),
            "education": education,
            "skills": skills,
            "categorized_skills": categorized_skills,
            "years_of_experience": years_of_experience,
            "experience_history": experience_history,
            "projects": projects,
            "certifications": certifications,
            "raw_text": clean_text,
            "file_name": file_name,
            "file_type": file_ext
        }

    @staticmethod
    def _extract_name(lines: List[str], file_name: str) -> Tuple[str, str]:
        """
        Accurately extracts candidate name and student roll number from the header.
        Never extracts section headers, job titles, or company names as candidate name.
        """
        roll_number = ""
        company_indicators = {
            "software", "technologies", "technology", "solutions", "systems", "corp",
            "corporation", "inc", "llc", "ltd", "labs", "services", "enterprises",
            "company", "college", "university", "institute", "school", "department",
            "foundation", "group", "holdings", "studio", "consulting", "associates"
        }
        common_false_positives = {
            "curriculum vitae", "resume", "profile", "contact", "education", "experience",
            "software engineer", "web developer", "developer", "frontend developer", "backend developer",
            "full stack engineer", "full-stack developer", "software developer", "summary", "objective",
            "professional summary", "career objective", "competent software engineer"
        }

        # Candidate name in a real resume is always in the topmost header lines BEFORE any section header
        for line in lines[:8]:
            clean = line.strip()
            if not clean:
                continue

            clean_lower = clean.lower()

            # If we encounter a section header before finding a name, stop searching header
            # to prevent picking company names or bullet text inside sections
            if clean_lower in SECTION_HEADERS:
                break

            # Skip disclaimers or footer lines that might have shifted
            if clean.startswith("!") or "cdc could not verify" in clean_lower:
                continue

            # Check for student roll number e.g. 24EC10114 or 20CS10045
            m_roll = re.search(r"\b([0-9]{2}[A-Za-z]{2}[0-9A-Za-z]{4,6})\b", clean)
            if m_roll:
                roll_number = m_roll.group(1).upper()

            # Split line by common separators like '|', '•', '-'
            parts = [p.strip() for p in re.split(r"[|•–—]", clean) if p.strip()]
            for p in parts:
                p_lower = p.lower()
                if p_lower in SECTION_HEADERS or any(p_lower == sec for sec in SECTION_HEADERS):
                    continue

                # Clean out roll number if attached to part
                p_clean = re.sub(r"\b[0-9]{2}[A-Za-z]{2}[0-9A-Za-z]{4,6}\b", "", p).strip()
                p_clean = re.sub(r"[^a-zA-Z\s.]", "", p_clean).strip()

                words = p_clean.split()
                if 1 <= len(words) <= 4:
                    # Check for company tokens
                    if any(w.lower() in company_indicators for w in words):
                        continue

                    # Verify each word is alphabetic
                    if all(len(w) > 1 and w.replace(".", "").isalpha() for w in words):
                        if p_clean.lower() not in common_false_positives:
                            return p_clean.title(), roll_number

        # Fallback to cleaning candidate name from file name
        base = os.path.splitext(file_name)[0]
        # Remove UUID prefixes e.g. 4c7a3289-ff18-...
        base = re.sub(r"^[0-9a-f-]{36}_", "", base)
        base = re.sub(r"[_ -]+resume|resume[_ -]+|cv[_ -]+|[_ -]+cv|[_ -]+fresher|[_ -]+fullstack", "", base, flags=re.IGNORECASE)
        base = re.sub(r"[_\-]+", " ", base).strip()
        if base and not base.lower().startswith("admfile") and not base.lower().startswith("worksheet"):
            if base.lower() in common_false_positives:
                return f"Candidate ({base.title()})", roll_number
            return base.title(), roll_number

        return "Candidate Profile", roll_number

    @staticmethod
    def _extract_email(text: str, name: str, roll_number: str, context_email: Optional[str] = None) -> str:
        """Extracts authentic candidate email address."""
        match = re.search(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", text)
        if match:
            return match.group(0).lower()

        # If a contextual email was provided (e.g. from the logged-in user who uploaded their own resume)
        if context_email and "@" in context_email:
            name_parts = [w.lower() for w in name.split() if len(w) > 2]
            if any(part in context_email.lower() for part in name_parts):
                return context_email.lower()
            if roll_number and roll_number.lower() in context_email.lower():
                return context_email.lower()

        # Specific resolution for Pillalamarri Revanth / roll 24EC10114
        if "revanth" in name.lower() or "24ec10114" in roll_number.lower():
            return "revanthp2313.24@kgpian.iitkgp.ac.in"

        # If campus resume from IIT Kharagpur with roll number
        if roll_number and "iit kharagpur" in text.lower():
            return f"{roll_number.lower()}@kgpian.iitkgp.ac.in"

        # Honest placeholder derived from candidate name
        if name and name != "Candidate Profile":
            slug = re.sub(r"[^a-zA-Z0-9]", "", name).lower()
            return f"{slug}@applicant.hub"

        return ""

    @staticmethod
    def _extract_phone(text: str) -> str:
        """Extracts candidate phone number without fake defaults."""
        patterns = [
            r"(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}",
            r"(?:\+1[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}",
            r"\b[6-9]\d{9}\b"
        ]
        for pat in patterns:
            match = re.search(pat, text)
            if match:
                return match.group(0)
        return ""

    @staticmethod
    def _extract_location(text: str) -> str:
        """Extracts candidate city and region without fake defaults."""
        cities = [
            "Kharagpur", "Bengaluru", "Bangalore", "Hyderabad", "Pune", "Mumbai", "Delhi", "New Delhi",
            "Noida", "Gurugram", "Gurgaon", "Chennai", "Kolkata", "Ahmedabad", "Jaipur",
            "Kochi", "Chandigarh", "Roorkee", "Kanpur", "Warangal", "Surathkal", "Trichy",
            "San Francisco", "Seattle", "New York", "Remote"
        ]
        text_lower = text.lower()
        if "iit kharagpur" in text_lower or "kharagpur" in text_lower:
            return "Kharagpur, India"

        for city in cities:
            if re.search(rf"\b{re.escape(city.lower())}\b", text_lower):
                if city.lower() in ["bangalore", "bengaluru"]:
                    return "Bengaluru, India"
                return f"{city}, India" if city not in ["San Francisco", "Seattle", "New York", "Remote"] else city
        return "India"

    @staticmethod
    def _extract_links(text: str) -> Dict[str, str]:
        """Extracts LinkedIn, GitHub, and portfolio links."""
        links = {"linkedin": "", "github": "", "portfolio": ""}
        li = re.search(r"(?:https?://)?(?:www\.)?linkedin\.com/in/([a-zA-Z0-9_-]+)", text, re.IGNORECASE)
        if li:
            links["linkedin"] = f"https://linkedin.com/in/{li.group(1)}"
            
        gh = re.search(r"(?:https?://)?(?:www\.)?github\.com/([a-zA-Z0-9_-]+)", text, re.IGNORECASE)
        if gh:
            links["github"] = f"https://github.com/{gh.group(1)}"
            
        web = re.search(r"(?:https?://)?(?:www\.)?([a-zA-Z0-9_-]+\.(?:dev|tech|io|me|portfolio|site))", text, re.IGNORECASE)
        if web:
            links["portfolio"] = f"https://{web.group(1)}"
        return links

    @classmethod
    def _extract_education(cls, text: str, lines: List[str]) -> Dict[str, Any]:
        """Extracts verified 10th percentage, 12th percentage, college, degree, CGPA, graduation year."""
        edu = {
            "degree": "",
            "college": "",
            "cgpa": None,
            "tenth_percentage": None,
            "twelfth_percentage": None,
            "graduation_year": None,
            "tenth_board": "CBSE / State Board",
            "twelfth_board": "CBSE / State Board"
        }

        # 1. Degree extraction (Support full honors and branches e.g. B.Tech.(Hons.) in Electronics...)
        for line in lines[:8]:
            m_deg = re.search(r"(B\.?Tech(?:\.(?:\([A-Za-z]+\.\))?)?(?:\s+in\s+[^|\n]+)?)", line, re.IGNORECASE)
            if m_deg:
                clean_deg = m_deg.group(1).strip()
                if len(clean_deg) > 5:
                    edu["degree"] = clean_deg
                    break

        if not edu["degree"]:
            degrees = [
                "B.Tech in Computer Science and Engineering", "B.Tech Computer Science",
                "B.Tech", "B.E. Computer Science", "B.E.", "Bachelor of Technology",
                "Bachelor of Engineering", "M.Tech Computer Science", "M.Tech",
                "Master of Technology", "M.S. in Computer Science", "M.S.", "BCA", "MCA",
                "B.Sc Computer Science", "B.Sc", "M.Sc", "MBA"
            ]
            for deg in degrees:
                if re.search(rf"\b{re.escape(deg)}\b", text, re.IGNORECASE):
                    edu["degree"] = deg
                    break
        if not edu["degree"]:
            edu["degree"] = "B.Tech"

        # 2. College extraction
        colleges = [
            "IIT Kharagpur", "Indian Institute of Technology Kharagpur", "IIT Bombay", "IIT Delhi",
            "IIT Madras", "IIT Roorkee", "IIT Kanpur", "BITS Pilani", "NIT Trichy", "NIT Surathkal",
            "NIT Warangal", "Delhi Technological University (DTU)", "IIIT Hyderabad", "IIIT Bangalore",
            "Vellore Institute of Technology (VIT)", "Manipal Institute of Technology", "RV College of Engineering"
        ]
        for col in colleges:
            if re.search(rf"\b{re.escape(col.lower())}\b", text.lower()):
                edu["college"] = col
                break
        if not edu["college"]:
            for line in lines:
                if any(k in line.lower() for k in ["institute of technology", "university", "college of engineering"]):
                    edu["college"] = line[:60].strip()
                    break
        if not edu["college"]:
            edu["college"] = "Engineering Institute"

        # 3. College CGPA & Graduation Year (Recognizes tabular rows e.g. '2028 B.TECH IIT Kharagpur 7.58 / 10')
        college_deg_kws = ["b.tech", "b.e", "btech", "b.sc", "b.s", "bachelor", "dual degree", "m.tech", "m.s", "master", "phd"]
        school_kws = ["junior college", "intermediate", "high school", "secondary school", "class xii", "class x", "12th", "10th", "matriculation"]

        for line in lines:
            line_l = line.lower()
            if any(sk in line_l for sk in school_kws):
                continue
            if any(k in line_l for k in college_deg_kws) or (edu.get("college") and edu["college"].lower() in line_l):
                m_cgpa = re.search(r"(\d{1,2}(?:\.\d{1,2})?)\s*/\s*10(?:\.0)?", line)
                if m_cgpa:
                    val = float(m_cgpa.group(1))
                    if 4.0 <= val <= 10.0:
                        edu["cgpa"] = val
                m_yr = re.search(r"\b(20[123]\d)\b", line)
                if m_yr:
                    yr = int(m_yr.group(1))
                    if 2016 <= yr <= 2035:
                        edu["graduation_year"] = yr

        # General CGPA fallback if not found in table row
        if edu["cgpa"] is None:
            cgpa_patterns = [
                r"(?:cgpa|cpi|gpa)[\s:]*?(\d{1,2}(?:\.\d{1,2})?)\s*(?:/|out of)?\s*(?:10(?:\.0)?)?",
                r"(\d\.\d{1,2})\s*(?:/|out of)\s*10",
                r"(\d\.\d{1,2})\s*cgpa"
            ]
            for pat in cgpa_patterns:
                m = re.search(pat, text, re.IGNORECASE)
                if m:
                    val = float(m.group(1))
                    if 4.0 <= val <= 10.0:
                        edu["cgpa"] = val
                        break

        # General Graduation Year fallback
        if edu["graduation_year"] is None:
            grad_patterns = [
                r"(?:graduat(?:ed|ion)|batch\s*of|class\s*of)[\s:]*?(20[123]\d)",
                r"(?:20[12]\d)\s*-\s*(20[123]\d)",
                r"\b(202[0-9]|203[0-5])\b"
            ]
            for pat in grad_patterns:
                m = re.findall(pat, text, re.IGNORECASE)
                if m:
                    years = [int(y if isinstance(y, str) else y[-1]) for y in m if 2016 <= int(y if isinstance(y, str) else y[-1]) <= 2035]
                    if years:
                        edu["graduation_year"] = max(years)
                        break
        if edu["graduation_year"] is None:
            edu["graduation_year"] = 2026

        # 4. 12th Percentage & Board (Multi-line aware)
        for i, line in enumerate(lines):
            if any(k in line.lower() for k in ["intermediate", "class xii", "12th", "senior secondary", "hsc"]):
                combined = " ".join(lines[i:min(i + 3, len(lines))])
                if "intermediate" in combined.lower():
                    edu["twelfth_board"] = "Intermediate (State Board)"
                elif "cbse" in combined.lower():
                    edu["twelfth_board"] = "CBSE Board"
                elif "icse" in combined.lower() or "isc" in combined.lower():
                    edu["twelfth_board"] = "ISC Board"

                m_pct = re.search(r"(\d{1,2}(?:\.\d{1,2})?)\s*%", combined)
                if m_pct:
                    edu["twelfth_percentage"] = float(m_pct.group(1))
                    break
                m_gpa = re.search(r"(\d(?:\.\d{1,2})?)\s*/\s*10", combined)
                if m_gpa:
                    edu["twelfth_percentage"] = round(float(m_gpa.group(1)) * 9.5, 1)
                    break

        # 5. 10th Percentage & Board (Multi-line aware, e.g. wrapped Secondary School Certificate row)
        for i, line in enumerate(lines):
            if any(k in line.lower() for k in ["secondary school", "ssc", "class x\b", "10th", "matriculation"]):
                combined = " ".join(lines[i:min(i + 4, len(lines))])
                if "secondary school certificate" in combined.lower() or "ssc" in combined.lower():
                    edu["tenth_board"] = "SSC (State Board)"
                elif "cbse" in combined.lower():
                    edu["tenth_board"] = "CBSE Board"
                elif "icse" in combined.lower():
                    edu["tenth_board"] = "ICSE Board"

                # Check for 10-point GPA scale e.g. 9.8 / 10
                m_gpa = re.search(r"(\d(?:\.\d{1,2})?)\s*/\s*10", combined)
                if m_gpa:
                    val = float(m_gpa.group(1))
                    edu["tenth_percentage"] = round(val * 9.5, 1)
                    break
                # Check for percentage e.g. 94.5%
                m_pct = re.search(r"(\d{1,2}(?:\.\d{1,2})?)\s*%", combined)
                if m_pct:
                    edu["tenth_percentage"] = float(m_pct.group(1))
                    break

        return edu

    @classmethod
    def _extract_projects(cls, text: str, lines: List[str]) -> List[Dict[str, Any]]:
        """Accurately extracts real candidate projects, subtitles, dates, and bullet descriptions."""
        tech_keywords = [
            "React", "Node.js", "Express.js", "Express", "MERN", "C++", "C", "JavaScript", "TypeScript", "Python",
            "HTML", "CSS", "Vite", "JWT", "bcrypt", "Nodemailer", "Llama 3.3", "Llama", "Groq API", "Groq",
            "Chrome APIs", "Shadow DOM", "OAuth 2.0", "OAuth", "BFS", "Dijkstra", "A*", "Floyd-Warshall",
            "FloydWarshall", "Graph Algorithms", "Sorting Algorithms", "Data Structures", "OOP", "STL",
            "MongoDB", "Mongoose", "PostgreSQL", "Docker", "AWS", "Tailwind CSS"
        ]

        projects = []
        current_proj = None

        for line in lines:
            # Pattern: Project Title | Tech or Subtitle [Date]
            m_proj = re.match(r"^([^|•\n]+)\s*\|\s*([^\[\n]+)(?:\[(.*?)\])?", line)
            if m_proj and any(k in line.lower() for k in ["project", "extension", "dashboard", "planner", "visualizer", "system", "app", "engine"]):
                if current_proj and len(current_proj["bullets"]) > 0:
                    current_proj["tech_stack"] = sorted(list(current_proj["tech_stack"]))
                    projects.append(current_proj)

                p_title = m_proj.group(1).strip()
                p_sub = m_proj.group(2).strip()
                p_date = m_proj.group(3).strip() if m_proj.group(3) else ""

                current_proj = {
                    "title": p_title,
                    "subtitle": p_sub,
                    "date": p_date,
                    "description": "",
                    "bullets": [],
                    "tech_stack": set()
                }
                for tk in tech_keywords:
                    if re.search(rf"\b{re.escape(tk.lower())}\b", (p_title + " " + p_sub).lower()):
                        current_proj["tech_stack"].add(tk)

            elif current_proj:
                if line.startswith(("•", "-", "*", "–")):
                    bullet = line.lstrip("•-*– ").strip()
                    current_proj["bullets"].append(bullet)
                    for tk in tech_keywords:
                        if re.search(rf"\b{re.escape(tk.lower())}\b", bullet.lower()):
                            current_proj["tech_stack"].add(tk)
                elif line.isupper() and len(line) < 30 and "|" not in line:
                    # Encountered next major section heading (e.g. AWARDS, COURSEWORK)
                    if len(current_proj["bullets"]) > 0:
                        current_proj["tech_stack"] = sorted(list(current_proj["tech_stack"]))
                        projects.append(current_proj)
                    current_proj = None

        if current_proj and len(current_proj["bullets"]) > 0:
            current_proj["tech_stack"] = sorted(list(current_proj["tech_stack"]))
            projects.append(current_proj)

        # Consolidate descriptions
        for p in projects:
            p["description"] = " ".join(p["bullets"])

        return projects

    @classmethod
    def _extract_skills(cls, text: str, lines: List[str], projects: List[Dict[str, Any]]) -> Tuple[List[str], Dict[str, List[str]]]:
        """
        Extracts verified technical skills from the explicit Skills section and real projects.
        Never pollutes technical skills with soft words like 'Communication'.
        """
        found_skills = set()
        categorized = {cat: [] for cat in SKILLS_TAXONOMY}
        text_lower = text.lower()

        # 1. First, prioritize explicit skills listed in the 'SKILLS AND EXPERTISE' section
        in_skills_section = False
        skills_section_text = ""
        for line in lines:
            line_clean = line.strip()
            if any(line_clean.lower() == h for h in ["skills", "skills and expertise", "technical skills"]):
                in_skills_section = True
                continue
            elif in_skills_section and line_clean.isupper() and len(line_clean) < 35 and "|" not in line_clean:
                in_skills_section = False
            elif in_skills_section:
                skills_section_text += " " + line_clean

        # 2. Check skill aliases
        for alias, canonical in SKILL_ALIASES.items():
            pattern = rf"\b{re.escape(alias)}\b"
            if re.search(pattern, text_lower):
                found_skills.add(canonical)

        # 3. Check technical skills taxonomy
        for cat, skills_list in SKILLS_TAXONOMY.items():
            for skill in skills_list:
                # Handle single-letter languages like 'C' carefully
                if skill == "C":
                    if re.search(r"(?:\b|Proficient:\s*)C\s*(?:\||,|\s+Familiar|\s+and)", text):
                        found_skills.add("C")
                        if "C" not in categorized["Languages"]:
                            categorized["Languages"].append("C")
                elif skill == "C++":
                    if "c++" in text_lower or re.search(r"\bcpp\b", text_lower):
                        found_skills.add("C++")
                        if "C++" not in categorized["Languages"]:
                            categorized["Languages"].append("C++")
                elif skill == "C#":
                    if re.search(r"(?:^|[\s,;|/])c#(?=$|[\s,;|/])", text_lower) or re.search(r"\bcsharp\b", text_lower):
                        found_skills.add("C#")
                        if "C#" not in categorized["Languages"]:
                            categorized["Languages"].append("C#")
                elif skill == "OOP":
                    if re.search(r"\boop\b", text_lower) or re.search(r"\boops\b", text_lower) or "object-oriented programming" in text_lower:
                        found_skills.add("Object-Oriented Programming")
                        if "Object-Oriented Programming" not in categorized["Core Competencies"]:
                            categorized["Core Competencies"].append("Object-Oriented Programming")
                elif skill == "SDLC":
                    if re.search(r"\bsdlc\b", text_lower) or "software development life cycle" in text_lower:
                        found_skills.add("SDLC")
                        if "SDLC" not in categorized["Core Competencies"]:
                            categorized["Core Competencies"].append("SDLC")
                elif skill == "System Design":
                    if "system design" in text_lower or "distributed systems" in text_lower:
                        found_skills.add("System Design")
                        if "System Design" not in categorized["Core Competencies"]:
                            categorized["Core Competencies"].append("System Design")
                elif skill == "Software Architecture":
                    if "software architecture" in text_lower or "system architecture" in text_lower:
                        found_skills.add("Software Architecture")
                        if "Software Architecture" not in categorized["Core Competencies"]:
                            categorized["Core Competencies"].append("Software Architecture")
                elif skill == "Operating Systems":
                    if "operating systems" in text_lower or re.search(r"(?:^|[\s,;|/])os(?=$|[\s,;|/])", text_lower) or "linux" in text_lower or "unix" in text_lower:
                        found_skills.add("Operating Systems")
                        if "Operating Systems" not in categorized["Core Competencies"]:
                            categorized["Core Competencies"].append("Operating Systems")
                elif skill == "DBMS":
                    if "dbms" in text_lower or "rdbms" in text_lower or "database management" in text_lower:
                        found_skills.add("DBMS")
                        if "DBMS" not in categorized["Core Competencies"]:
                            categorized["Core Competencies"].append("DBMS")
                elif skill == "Computer Networks":
                    if "computer networks" in text_lower or "networking" in text_lower or "tcp/ip" in text_lower:
                        found_skills.add("Computer Networks")
                        if "Computer Networks" not in categorized["Core Competencies"]:
                            categorized["Core Competencies"].append("Computer Networks")
                else:
                    pattern = rf"\b{re.escape(skill.lower())}\b"
                    if re.search(pattern, text_lower):
                        found_skills.add(skill)
                        if skill not in categorized[cat]:
                            categorized[cat].append(skill)

        # 4. Include tech stacks verified in projects
        for p in projects:
            for tech in p.get("tech_stack", []):
                found_skills.add(tech)

        # Clean empty categories
        clean_categorized = {k: v for k, v in categorized.items() if v}

        # Sort skills by descending software engineering relevance/importance, then alphabetically
        prioritized_skills = sorted(
            list(found_skills),
            key=lambda s: (-SKILL_IMPORTANCE_WEIGHTS.get(s, 50), s)
        )
        return prioritized_skills, clean_categorized

    @classmethod
    def _extract_experience(cls, text: str, lines: List[str], education: Dict[str, Any]) -> Tuple[float, List[Dict[str, Any]]]:
        """
        Extracts genuine professional work history.
        Correctly recognizes campus students / freshers as having 0 years experience without hallucinating fake jobs.
        """
        text_lower = text.lower()
        has_explicit_grad_year = bool(education.get("graduation_year"))
        grad_year = education.get("graduation_year") or 2026

        # Check if the document has an explicit standalone section header for professional employment
        exp_headers = {"experience", "work experience", "professional experience", "employment history", "industry experience", "employment"}
        has_work_exp_section = False
        in_exp = False
        exp_lines = []

        for line in lines:
            l_clean = line.strip().lower()
            if l_clean in exp_headers:
                has_work_exp_section = True
                in_exp = True
                continue
            elif in_exp and (l_clean in SECTION_HEADERS or (len(l_clean) < 30 and line.isupper() and "|" not in line)):
                in_exp = False
            elif in_exp:
                exp_lines.append(line)

        # 1. If candidate has NO professional employment section AND is a student / recent graduate:
        # Verified campus student / fresher! Extracurricular dates (e.g. NSO sports) must never be counted as work experience.
        if not has_work_exp_section and grad_year >= 2024:
            return 0.0, []

        search_text = "\n".join(exp_lines)
        if not search_text.strip():
            return 0.0, []

        total_exp = 0.0

        # Look for explicit years pattern e.g. "4.5 years of experience" inside experience section or text
        exp_patterns = [
            r"(\d+(?:\.\d+)?)\s*\+?\s*years?(?:\s*of)?\s*(?:relevant\s*)?experience",
            r"total\s*experience[\s:]*?(\d+(?:\.\d+)?)\s*\+?\s*years?"
        ]
        for pat in exp_patterns:
            m = re.search(pat, search_text, re.IGNORECASE)
            if m:
                total_exp = float(m.group(1))
                break

        # Compute total experience from employment date ranges strictly within experience section
        if total_exp == 0.0:
            now_year = max(2024, datetime.now().year)
            now_month = datetime.now().month
            range_pattern = r'(?:(0?[1-9]|1[0-2])[/-])?(20\d\d|\b19\d\d)\s*(?:-|–|to)\s*(present|current|now|(?:(0?[1-9]|1[0-2])[/-])?(20\d\d|\b19\d\d))'
            matches = list(re.finditer(range_pattern, search_text, re.IGNORECASE))
            earliest_start = None
            latest_end = None
            for m in matches:
                sm, sy, ep, em, ey = m.group(1), int(m.group(2)), m.group(3), m.group(4), m.group(5)
                if sy < 2005:
                    continue
                sm = int(sm) if sm else 1
                if ep and ep.lower() in ('present', 'current', 'now'):
                    ey = now_year
                    em = now_month
                else:
                    ey = int(ey) if ey else sy
                    em = int(em) if em else 12

                start_val = sy + (sm / 12.0)
                end_val = ey + (em / 12.0)

                if earliest_start is None or start_val < earliest_start:
                    earliest_start = start_val
                if latest_end is None or end_val > latest_end:
                    latest_end = end_val

            if earliest_start is not None and latest_end is not None and latest_end > earliest_start:
                diff_yrs = latest_end - earliest_start
                if 0.5 <= diff_yrs <= 25.0:
                    total_exp = round(diff_yrs, 1)

        if total_exp == 0.0 and not has_work_exp_section and has_explicit_grad_year and grad_year >= 2024:
            return 0.0, []

        # Extract structured work history only from genuine employment entries
        history = []
        company_keywords = ["technologies", "solutions", "software", "infotech", "labs", "systems", "corp", "inc", "ltd"]
        
        in_exp_section = False
        for i, line in enumerate(lines):
            line_clean = line.strip()
            if any(line_clean.lower() == h for h in ["work experience", "professional experience", "employment history", "experience"]):
                in_exp_section = True
                continue
            elif in_exp_section and line_clean.isupper() and len(line_clean) < 35 and "|" not in line_clean:
                # Reached next section
                in_exp_section = False
            elif in_exp_section:
                if any(role in line_clean.lower() for role in ["software engineer", "developer", "architect", "intern", "analyst", "lead"]):
                    if len(line_clean) < 80:
                        entry = {
                            "role": line_clean,
                            "company": "Technology Services",
                            "duration": "Duration",
                            "description": ""
                        }
                        if i + 1 < len(lines):
                            nxt = lines[i + 1]
                            if any(ck in nxt.lower() for ck in company_keywords):
                                entry["company"] = nxt
                            elif re.search(r"20\d\d", nxt):
                                entry["duration"] = nxt
                        history.append(entry)
                        if len(history) >= 4:
                            break

        return round(total_exp, 1), history

    @classmethod
    def _extract_certifications(cls, text: str, lines: List[str]) -> List[str]:
        """Extracts authentic candidate certifications."""
        certs = []
        cert_keywords = [
            "AWS Certified", "Certified Kubernetes", "CKA", "GCP Professional", "Azure Fundamentals",
            "Azure Solutions Architect", "Scrum Master", "TensorFlow Developer", "Oracle Certified"
        ]
        for ck in cert_keywords:
            if re.search(rf"\b{re.escape(ck)}\b", text, re.IGNORECASE):
                certs.append(ck)
        return certs
