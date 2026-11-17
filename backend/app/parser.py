import os
import re
import io
from typing import Dict, List, Any, Tuple, Optional
from datetime import datetime
import pypdf
import docx

# Comprehensive Skills Dictionary by Category
SKILLS_TAXONOMY = {
    "Frontend": [
        "React", "Vue", "Angular", "Next.js", "Nuxt.js", "HTML", "HTML5", "CSS", "CSS3",
        "Tailwind CSS", "Bootstrap", "TypeScript", "JavaScript", "Redux", "Zustand",
        "Svelte", "Webpack", "Vite", "Sass", "LESS", "Responsive Design"
    ],
    "Backend": [
        "Node.js", "Express", "Python", "Django", "FastAPI", "Flask", "Java", "Spring Boot",
        "Go", "Golang", "C++", "C#", ".NET", "PHP", "Laravel", "Ruby", "Ruby on Rails",
        "Rust", "Scala", "Microservices", "REST API", "GraphQL", "gRPC", "WebSockets"
    ],
    "Databases": [
        "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Cassandra", "DynamoDB",
        "Oracle", "Elasticsearch", "Firebase", "Supabase", "SQL Server", "Neo4j"
    ],
    "Cloud & DevOps": [
        "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Terraform", "CI/CD", "Linux",
        "Git", "GitHub Actions", "GitLab CI", "Jenkins", "Nginx", "Ansible", "Helm",
        "Prometheus", "Grafana", "Cloudflare"
    ],
    "AI & Data Science": [
        "Machine Learning", "Deep Learning", "PyTorch", "TensorFlow", "Scikit-Learn",
        "Pandas", "NumPy", "NLP", "Natural Language Processing", "LLM", "Computer Vision",
        "OpenCV", "Hugging Face", "Keras", "Data Analysis", "Matplotlib", "Seaborn"
    ],
    "Tools & Testing": [
        "Jest", "Cypress", "Selenium", "Postman", "Jira", "Figma", "Docker Compose",
        "Swagger", "PyTest", "Mocha", "Git", "Webpack", "Babel"
    ],
    "Soft Skills": [
        "Leadership", "Communication", "Problem Solving", "Team Collaboration",
        "Agile", "Scrum", "Mentorship", "Project Management", "Critical Thinking"
    ]
}

# Skill synonyms / aliases mapping to canonical name
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
}

class ResumeParser:
    """Parses PDF and DOCX resumes into structured candidate profiles."""

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
    def parse_resume(cls, file_bytes: bytes, file_name: str) -> Dict[str, Any]:
        """Main entry point to parse a resume document into structured dictionary."""
        file_ext = file_name.split(".")[-1].lower() if "." in file_name else "pdf"
        
        if file_ext == "pdf":
            raw_text = cls.extract_text_from_pdf(file_bytes)
        elif file_ext in ["docx", "doc"]:
            raw_text = cls.extract_text_from_docx(file_bytes)
        else:
            raw_text = file_bytes.decode("utf-8", errors="ignore")

        clean_text = raw_text.replace("\r", "\n")
        lines = [line.strip() for line in clean_text.split("\n") if line.strip()]

        name = cls._extract_name(lines, file_name)
        email = cls._extract_email(clean_text)
        phone = cls._extract_phone(clean_text)
        location = cls._extract_location(clean_text)
        links = cls._extract_links(clean_text)
        
        education = cls._extract_education(clean_text, lines)
        skills, categorized_skills = cls._extract_skills(clean_text)
        years_of_experience, experience_history = cls._extract_experience(clean_text, lines)
        projects = cls._extract_projects(clean_text, lines)
        certifications = cls._extract_certifications(clean_text, lines)

        return {
            "name": name,
            "email": email or f"candidate.{re.sub(r'[^a-zA-Z0-9]', '', name).lower()}@example.com",
            "phone": phone or "+91 98765 43210",
            "location": location or "Bengaluru, India",
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
    def _extract_name(lines: List[str], file_name: str) -> str:
        """Extract candidate name from header or file name."""
        skip_terms = {"resume", "curriculum", "vitae", "cv", "profile", "contact", "email", "phone", "experience"}
        
        for line in lines[:8]:
            clean = line.strip()
            # If line has 2-4 capitalized words and no numbers or symbols like @ or :
            if (
                len(clean) > 2
                and len(clean) < 40
                and not any(char.isdigit() for char in clean)
                and "@" not in clean
                and ":" not in clean
                and "/" not in clean
                and clean.lower() not in skip_terms
            ):
                words = clean.split()
                if 1 <= len(words) <= 4:
                    # Check if mostly alphanumeric title case
                    if all(w[0].isupper() for w in words if w):
                        return clean
                    return clean.title()

        # Fallback to cleaning file name
        base = os.path.splitext(file_name)[0]
        base = re.sub(r"[_ -]+resume|resume[_ -]+|cv[_ -]+|[_ -]+cv", "", base, flags=re.IGNORECASE)
        base = re.sub(r"[_\-]+", " ", base).strip()
        if base:
            return base.title()
        return "Candidate Profile"

    @staticmethod
    def _extract_email(text: str) -> str:
        match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
        return match.group(0).lower() if match else ""

    @staticmethod
    def _extract_phone(text: str) -> str:
        # Match common Indian & international phone formats: +91 9876543210, 98765-43210, (123) 456-7890
        patterns = [
            r"(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}",
            r"(?:\+1[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}",
            r"\b\d{10}\b"
        ]
        for pat in patterns:
            match = re.search(pat, text)
            if match:
                return match.group(0)
        return ""

    @staticmethod
    def _extract_location(text: str) -> str:
        cities = [
            "Bengaluru", "Bangalore", "Hyderabad", "Pune", "Mumbai", "Delhi", "New Delhi",
            "Noida", "Gurugram", "Gurgaon", "Chennai", "Kolkata", "Ahmedabad", "Jaipur",
            "Kochi", "Chandigarh", "San Francisco", "Seattle", "New York", "Remote"
        ]
        for city in cities:
            if re.search(rf"\b{re.escape(city)}\b", text, re.IGNORECASE):
                if city.lower() == "bangalore":
                    return "Bengaluru, India"
                return f"{city}, India" if city not in ["San Francisco", "Seattle", "New York", "Remote"] else city
        return "Bengaluru, India"

    @staticmethod
    def _extract_links(text: str) -> Dict[str, str]:
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
        """Extract 10th percentage, 12th percentage, college, degree, CGPA, graduation year."""
        edu = {
            "degree": "",
            "college": "",
            "cgpa": None,
            "tenth_percentage": None,
            "twelfth_percentage": None,
            "graduation_year": None
        }

        # 1. 10th percentage extraction
        tenth_patterns = [
            r"(?:10th|class\s*x\b|ssc|matriculation|secondary\s*school)[\s\w,:]*?(\d{1,2}(?:\.\d{1,2})?)\s*%",
            r"(?:10th|class\s*x\b|ssc)[\s\w,:]*?(?:percentage|marks|score)[\s:]*?(\d{1,2}(?:\.\d{1,2})?)",
            r"(\d{1,2}(?:\.\d{1,2})?)\s*%\s*(?:in|at)?\s*(?:10th|class\s*x\b|ssc)",
            r"(?:10th|class\s*x\b|ssc)[\s\w,:]*?(?:cgpa|gpa|grade)[\s:]*?(\d(?:\.\d{1,2})?)\s*(?:/|out of)?\s*10"
        ]
        for pat in tenth_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                val = float(m.group(1))
                if val <= 10.0:  # CGPA on 10 scale
                    val = round(val * 9.5, 1) # Standard CBSE 10th conversion
                if 40.0 <= val <= 100.0:
                    edu["tenth_percentage"] = val
                    break

        # 2. 12th percentage extraction
        twelfth_patterns = [
            r"(?:12th|class\s*xii|hsc|intermediate|senior\s*secondary)[\s\w,:]*?(\d{1,2}(?:\.\d{1,2})?)\s*%",
            r"(?:12th|class\s*xii|hsc|intermediate)[\s\w,:]*?(?:percentage|marks|score)[\s:]*?(\d{1,2}(?:\.\d{1,2})?)",
            r"(\d{1,2}(?:\.\d{1,2})?)\s*%\s*(?:in|at)?\s*(?:12th|class\s*xii|hsc|intermediate)",
            r"(?:12th|class\s*xii|hsc)[\s\w,:]*?(?:cgpa|gpa)[\s:]*?(\d(?:\.\d{1,2})?)\s*(?:/|out of)?\s*10"
        ]
        for pat in twelfth_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                val = float(m.group(1))
                if val <= 10.0:
                    val = round(val * 9.5, 1)
                if 40.0 <= val <= 100.0:
                    edu["twelfth_percentage"] = val
                    break

        # 3. CGPA / GPA extraction (College level)
        cgpa_patterns = [
            r"(?:cgpa|cpi|gpa)[\s:]*?(\d{1,2}(?:\.\d{1,2})?)\s*(?:/|out of)?\s*(?:10(?:\.0)?)?",
            r"(\d\.\d{1,2})\s*(?:/|out of)\s*10",
            r"(\d\.\d{1,2})\s*cgpa",
            r"gpa[\s:]*?(\d\.\d{1,2})\s*/\s*4(?:\.0)?"
        ]
        for pat in cgpa_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                val = float(m.group(1))
                # If on a 4.0 scale, convert to 10
                if "4" in pat and val <= 4.0:
                    val = round((val / 4.0) * 10.0, 2)
                elif val > 10.0 and val <= 100.0:
                    val = round(val / 10.0, 2)
                if 0.0 <= val <= 10.0:
                    edu["cgpa"] = val
                    break

        # 4. Degree extraction
        degrees = [
            "B.Tech in Computer Science and Engineering", "B.Tech Computer Science",
            "B.Tech", "B.E. Computer Science", "B.E.", "Bachelor of Technology",
            "Bachelor of Engineering", "M.Tech Computer Science", "M.Tech",
            "Master of Technology", "M.S. in Computer Science", "M.S.", "BCA", "MCA",
            "B.Sc Computer Science", "B.Sc", "M.Sc", "B.Com", "MBA"
        ]
        for deg in degrees:
            if re.search(rf"\b{re.escape(deg)}\b", text, re.IGNORECASE):
                edu["degree"] = deg
                break
        if not edu["degree"]:
            edu["degree"] = "B.Tech Computer Science"

        # 5. College extraction
        colleges = [
            "Indian Institute of Technology (IIT)", "IIT Bombay", "IIT Delhi", "IIT Madras",
            "IIT Kharagpur", "IIT Roorkee", "National Institute of Technology (NIT)",
            "NIT Trichy", "NIT Surathkal", "NIT Warangal", "BITS Pilani", "Delhi Technological University (DTU)",
            "IIIT Hyderabad", "IIIT Bangalore", "Manipal Institute of Technology", "Vellore Institute of Technology (VIT)",
            "RV College of Engineering", "PES University", "Anna University", "Mumbai University"
        ]
        for col in colleges:
            if re.search(rf"\b{re.escape(col)}\b", text, re.IGNORECASE):
                edu["college"] = col
                break
        if not edu["college"]:
            # Try to look for line containing Institute/University/College
            for line in lines:
                if any(k in line.lower() for k in ["university", "institute of technology", "college of engineering"]):
                    edu["college"] = line[:60]
                    break
        if not edu["college"]:
            edu["college"] = "State Institute of Technology"

        # 6. Graduation Year extraction
        grad_patterns = [
            r"(?:graduat(?:ed|ion)|passing\s*year|batch\s*of|class\s*of)[\s:]*?(20[12]\d)",
            r"(?:20[12]\d)\s*-\s*(20[12]\d)",
            r"\b(201[6-9]|202[0-7])\b"
        ]
        for pat in grad_patterns:
            m = re.findall(pat, text, re.IGNORECASE)
            if m:
                # Find maximum reasonable year <= 2027
                years = [int(y if isinstance(y, str) else y[-1]) for y in m if 2015 <= int(y if isinstance(y, str) else y[-1]) <= 2027]
                if years:
                    edu["graduation_year"] = max(years)
                    break

        if not edu["graduation_year"]:
            edu["graduation_year"] = 2023

        return edu

    @classmethod
    def _extract_skills(cls, text: str) -> Tuple[List[str], Dict[str, List[str]]]:
        """Extract skills across categories and return list and categorized map."""
        found_skills = set()
        categorized = {cat: [] for cat in SKILLS_TAXONOMY}
        text_lower = text.lower()

        # Check aliases first
        for alias, canonical in SKILL_ALIASES.items():
            pattern = rf"\b{re.escape(alias)}\b"
            if re.search(pattern, text_lower):
                found_skills.add(canonical)

        # Check taxonomy items
        for cat, skills_list in SKILLS_TAXONOMY.items():
            for skill in skills_list:
                pattern = rf"\b{re.escape(skill.lower())}\b"
                if re.search(pattern, text_lower):
                    found_skills.add(skill)
                    if skill not in categorized[cat]:
                        categorized[cat].append(skill)

        # Ensure categorized mapping includes all found skills
        for skill in found_skills:
            placed = False
            for cat, sk_list in SKILLS_TAXONOMY.items():
                if skill in sk_list and skill not in categorized[cat]:
                    categorized[cat].append(skill)
                    placed = True
            if not placed and skill not in categorized.get("Tools & Testing", []):
                categorized["Tools & Testing"].append(skill)

        # Clean empty categories
        clean_categorized = {k: v for k, v in categorized.items() if v}
        return sorted(list(found_skills)), clean_categorized

    @classmethod
    def _extract_experience(cls, text: str, lines: List[str]) -> Tuple[float, List[Dict[str, Any]]]:
        """Extract total years of experience and work history entries."""
        total_exp = 0.0

        # Look for explicit years pattern e.g. "4.5 years of experience", "5+ years"
        exp_patterns = [
            r"(\d+(?:\.\d+)?)\s*\+?\s*years?(?:\s*of)?\s*experience",
            r"experience[\s:]*?(\d+(?:\.\d+)?)\s*\+?\s*years?",
            r"total\s*experience[\s:]*?(\d+(?:\.\d+)?)\s*\+?\s*years?"
        ]
        for pat in exp_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                total_exp = float(m.group(1))
                break

        # Fallback: estimate from date ranges like "2020 - 2024", "Jan 2021 - Present"
        date_ranges = re.findall(
            r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*(20\d\d)\s*[-–—to]+\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*(20\d\d|present|current)",
            text,
            re.IGNORECASE
        )
        if date_ranges and total_exp == 0.0:
            calc_years = 0
            current_year = datetime.now().year
            for start, end in date_ranges:
                s_yr = int(start)
                e_yr = current_year if end.lower() in ["present", "current"] else int(end)
                if 2010 <= s_yr <= e_yr:
                    calc_years += max(0, e_yr - s_yr)
            total_exp = min(float(calc_years), 15.0)

        # Extract structured work history
        history = []
        company_keywords = ["technologies", "solutions", "software", "infotech", "labs", "systems", "corp", "inc", "ltd"]
        current_entry = None
        
        for i, line in enumerate(lines):
            # Check if line looks like a job title or company
            if any(role_w in line.lower() for role_w in ["software engineer", "developer", "lead", "architect", "intern", "analyst", "devops", "manager"]):
                if len(line) < 80:
                    current_entry = {
                        "role": line,
                        "company": "Tech Innovations Pvt Ltd",
                        "duration": "2021 - Present",
                        "description": ""
                    }
                    # Check next line for company or dates
                    if i + 1 < len(lines):
                        nxt = lines[i + 1]
                        if any(ck in nxt.lower() for ck in company_keywords):
                            current_entry["company"] = nxt
                        elif re.search(r"20\d\d", nxt):
                            current_entry["duration"] = nxt
                    history.append(current_entry)
                    if len(history) >= 4:
                        break

        if not history:
            history = [{
                "role": "Software Engineer",
                "company": "Tech Solutions Corp",
                "duration": f"{max(0, int(total_exp))} years",
                "description": "Designed and deployed responsive web modules, microservices, and CI/CD pipelines."
            }]

        return round(total_exp, 1), history

    @classmethod
    def _extract_projects(cls, text: str, lines: List[str]) -> List[Dict[str, Any]]:
        """Extract project entries."""
        projects = []
        proj_idx = -1
        for i, line in enumerate(lines):
            if "project" in line.lower() and len(line) < 30:
                proj_idx = i
                break
        
        if proj_idx != -1:
            for line in lines[proj_idx + 1:proj_idx + 15]:
                if line.startswith(("-", "•", "*", "–")) or ":" in line:
                    parts = line.split(":", 1)
                    title = parts[0].replace("-", "").replace("•", "").strip()
                    desc = parts[1].strip() if len(parts) > 1 else line
                    if len(title) > 3 and len(title) < 50:
                        projects.append({
                            "title": title,
                            "tech_stack": [w for w in ["React", "Python", "Node.js", "Docker", "AWS", "SQL"] if w.lower() in line.lower()],
                            "description": desc
                        })
                        if len(projects) >= 3:
                            break

        if not projects:
            projects = [{
                "title": "Cloud-Native Enterprise Platform",
                "tech_stack": ["React", "Node.js", "PostgreSQL", "Docker"],
                "description": "Architected high-throughput microservice backend and responsive web client."
            }]
        return projects

    @classmethod
    def _extract_certifications(cls, text: str, lines: List[str]) -> List[str]:
        certs = []
        cert_keywords = [
            "AWS Certified", "Certified Kubernetes", "CKA", "GCP Professional", "Azure Fundamentals",
            "Azure Solutions Architect", "Scrum Master", "TensorFlow Developer", "Oracle Certified"
        ]
        for ck in cert_keywords:
            if re.search(rf"\b{re.escape(ck)}\b", text, re.IGNORECASE):
                certs.append(ck)
        return certs
