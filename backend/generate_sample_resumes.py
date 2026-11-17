import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import docx

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "sample_resumes")
os.makedirs(OUTPUT_DIR, exist_ok=True)

SAMPLE_RESUMES_CONFIG = [
    {
        "filename": "Aarav_Sharma_FullStack.pdf",
        "format": "pdf",
        "name": "Aarav Sharma",
        "title": "Senior Full-Stack Engineer",
        "email": "aarav.sharma@example.com",
        "phone": "+91 98201 12345",
        "location": "Bengaluru, India",
        "linkedin": "https://linkedin.com/in/aarav-sharma-tech",
        "github": "https://github.com/aaravsharma",
        "summary": "Full Stack Engineer with 4.5+ years of experience in enterprise web apps, microservices, and cloud deployments. Passionate about system design and frontend performance.",
        "education": "B.Tech in Computer Science and Engineering | IIT Delhi (2016 - 2020)\n• CGPA: 8.85 / 10.0\n• Class XII: 91.8%\n• Class X: 93.4%",
        "skills": "React, TypeScript, Node.js, Express, PostgreSQL, Docker, AWS, Redis, Next.js, Git, REST API, Tailwind CSS, Jest, Microservices",
        "experience": [
            ("Senior Software Engineer", "Razorpay Payments (2022 - Present)", "Architected merchant onboarding flow with React & TypeScript. Optimized PostgreSQL read latency by 45% using Redis caching."),
            ("Software Developer", "Swiggy Tech Labs (2020 - 2022)", "Developed reactive order tracking frontend using React and Dockerized microservices. Maintained 99.9% uptime.")
        ],
        "projects": [
            ("Distributed Task Queuer", "Node.js, Redis, Docker", "Built distributed job processing queue processing 10k messages/sec.")
        ]
    },
    {
        "filename": "Priya_Nair_Frontend.docx",
        "format": "docx",
        "name": "Priya Nair",
        "title": "Frontend Developer (React & Next.js)",
        "email": "priya.nair@example.com",
        "phone": "+91 97412 87654",
        "location": "Bengaluru, India",
        "linkedin": "https://linkedin.com/in/priya-nair-frontend",
        "github": "https://github.com/priyanair",
        "summary": "Creative and detail-oriented Frontend Developer with 2.5 years of experience crafting accessible, responsive, and blazing-fast web interfaces.",
        "education": "B.Tech in Information Technology | NIT Trichy (2018 - 2022)\n• CGPA: 8.4 / 10.0\n• Class XII: 88.5%\n• Class X: 89.0%",
        "skills": "React, Next.js, JavaScript, TypeScript, Tailwind CSS, Redux, HTML5, CSS3, Figma, Jest, Git, Responsive Design",
        "experience": [
            ("Frontend Engineer", "Flipkart Internet (2022 - Present)", "Developed UI components in React and Tailwind CSS. Implemented code-splitting reducing initial bundle size by 38%.")
        ],
        "projects": [
            ("Modern UI Kit", "React, TypeScript, Tailwind CSS", "Open-source component library with 1,200+ stars on GitHub.")
        ]
    },
    {
        "filename": "Rohan_Deshmukh_Backend.pdf",
        "format": "pdf",
        "name": "Rohan Deshmukh",
        "title": "Python / Backend Engineer",
        "email": "rohan.deshmukh@example.com",
        "phone": "+91 91672 34567",
        "location": "Pune, India",
        "linkedin": "https://linkedin.com/in/rohan-deshmukh-py",
        "github": "https://github.com/rohandesh",
        "summary": "Backend specialist with 3.5 years of experience in distributed systems, asynchronous APIs, and relational databases. Strong focus on code maintainability and test coverage.",
        "education": "B.E. Computer Science | BITS Pilani (2017 - 2021)\n• CGPA: 7.9 / 10.0\n• Class XII: 82.0%\n• Class X: 84.5%",
        "skills": "Python, FastAPI, Django, PostgreSQL, Redis, Docker, REST API, Microservices, Git, Linux, Celery",
        "experience": [
            ("Backend Engineer", "Zomato Ltd (2021 - Present)", "Built asynchronous dispatch services with FastAPI and PostgreSQL handling 50k requests/min. Designed automated database migration workflows.")
        ],
        "projects": [
            ("Geofencing Engine", "Python, FastAPI, Redis", "Real-time location indexing engine with sub-millisecond query latency.")
        ]
    },
    {
        "filename": "Aditya_Verma_DevOps.pdf",
        "format": "pdf",
        "name": "Aditya Verma",
        "title": "Senior DevOps & Cloud Engineer",
        "email": "aditya.verma@example.com",
        "phone": "+91 98112 45678",
        "location": "Delhi, India",
        "linkedin": "https://linkedin.com/in/aditya-verma-cloud",
        "github": "https://github.com/adityaverma",
        "summary": "DevOps Engineer with 4.0 years of experience managing Kubernetes clusters, AWS infrastructure, and automated CI/CD pipelines. Certified CKA and AWS Solutions Architect.",
        "education": "B.Tech Computer Science | Delhi Technological University (DTU) (2016 - 2020)\n• CGPA: 8.1 / 10.0\n• Class XII: 86.5%\n• Class X: 88.0%",
        "skills": "Docker, Kubernetes, AWS, Terraform, CI/CD, Linux, GitHub Actions, Prometheus, Grafana, Python, Nginx, Helm",
        "experience": [
            ("DevOps Engineer", "Paytm Labs (2020 - Present)", "Designed multi-region AWS EKS clusters with Terraform GitOps workflows. Reduced deployment cycle time from 40 mins to 4 mins.")
        ],
        "projects": [
            ("Canary Deployer", "Kubernetes, GitHub Actions", "Custom Kubernetes controller managing traffic splits during canary releases.")
        ]
    },
    {
        "filename": "Sneha_Kulkarni_Fresher.docx",
        "format": "docx",
        "name": "Sneha Kulkarni",
        "title": "Software Engineer (Campus Graduate)",
        "email": "sneha.kulkarni@example.com",
        "phone": "+91 94230 98765",
        "location": "Pune, India",
        "linkedin": "https://linkedin.com/in/sneha-kulkarni-fresher",
        "github": "https://github.com/snehakulkarni",
        "summary": "Recent CS Graduate from COEP with 9.42 CGPA. Winner of Smart India Hackathon. Solid grasp of algorithms, data structures, Java, Python, and SQL.",
        "education": "B.Tech Computer Science | College of Engineering Pune (COEP) (2020 - 2024)\n• CGPA: 9.42 / 10.0\n• Class XII: 94.2%\n• Class X: 95.8%",
        "skills": "Java, Python, SQL, C++, Spring Boot, Git, Problem Solving, Data Structures, Algorithms, HTML, CSS",
        "experience": [
            ("Software Engineering Intern", "Amazon India (Jan 2024 - Jun 2024)", "Developed high-volume inventory reconciliation tools using Java and SQL. Automated batch error notifications.")
        ],
        "projects": [
            ("Algorithmic Trading Bot", "Python, SQL", "Backtested quantitative equity strategies using Pandas.")
        ]
    },
    {
        "filename": "Vikram_Singhania_PHP.pdf",
        "format": "pdf",
        "name": "Vikram Singhania",
        "title": "Web Developer",
        "email": "vikram.singhania@example.com",
        "phone": "+91 98300 45678",
        "location": "Mumbai, India",
        "linkedin": "https://linkedin.com/in/vikram-singhania-dev",
        "github": "https://github.com/vikramsingh",
        "summary": "Web developer with 4 years of experience building PHP and Laravel web applications with MySQL databases.",
        "education": "B.E. Computer Engineering | Mumbai University (2016 - 2020)\n• CGPA: 6.8 / 10.0\n• Class XII: 67.0%\n• Class X: 68.5%",
        "skills": "PHP, Laravel, MySQL, JavaScript, HTML, CSS, jQuery, Git, Apache",
        "experience": [
            ("Web Developer", "Apex Web Solutions (2020 - Present)", "Developed and maintained 15+ client websites using Laravel and MySQL.")
        ],
        "projects": [
            ("E-Commerce Portal", "PHP, MySQL", "Online store backend with payment gateway integration.")
        ]
    },
    {
        "filename": "Ananya_Sen_SrFullStack.pdf",
        "format": "pdf",
        "name": "Ananya Sen",
        "title": "Lead Full Stack Engineer",
        "email": "ananya.sen@example.com",
        "phone": "+91 98311 23456",
        "location": "Bengaluru, India",
        "linkedin": "https://linkedin.com/in/ananya-sen-fullstack",
        "github": "https://github.com/ananyasen",
        "summary": "Lead Full Stack Engineer with 5.5 years of experience architecting large-scale React, Node.js, and cloud native architectures. Mentor to 10+ engineers.",
        "education": "B.Tech Computer Science | IIIT Bangalore (2015 - 2019)\n• CGPA: 8.7 / 10.0\n• Class XII: 90.5%\n• Class X: 92.0%",
        "skills": "React, Node.js, TypeScript, PostgreSQL, Docker, AWS, GraphQL, Microservices, Kubernetes, Redis, Jest, Next.js",
        "experience": [
            ("Lead Full Stack Engineer", "Ola Electric (2022 - Present)", "Led engineering for IoT vehicle telemetry console using React and Node.js microservices."),
            ("Senior Developer", "Infosys Ltd (2019 - 2022)", "Constructed microservices in Docker and PostgreSQL for financial enterprise clients.")
        ],
        "projects": [
            ("Federated GraphQL Gateway", "Node.js, GraphQL, Docker", "Unified schema aggregator connecting 12 services.")
        ]
    },
    {
        "filename": "Karthik_Raja_DevOps.docx",
        "format": "docx",
        "name": "Karthik Raja",
        "title": "Cloud DevOps Engineer",
        "email": "karthik.raja@example.com",
        "phone": "+91 94440 12389",
        "location": "Chennai, India",
        "linkedin": "https://linkedin.com/in/karthik-raja-cloud",
        "github": "https://github.com/karthikraja",
        "summary": "DevOps Engineer with 3.2 years of experience in container orchestration, Linux systems, and cloud infrastructure automation.",
        "education": "B.E. Computer Science | Anna University (2017 - 2021)\n• CGPA: 7.6 / 10.0\n• Class XII: 77.0%\n• Class X: 78.5%",
        "skills": "Docker, Kubernetes, AWS, Linux, CI/CD, Git, Terraform, Bash, Python",
        "experience": [
            ("Cloud DevOps Engineer", "Freshworks Inc (2021 - Present)", "Automated infrastructure rollout with Terraform across AWS environments.")
        ],
        "projects": [
            ("Disaster Recovery Automation", "AWS, Terraform, Python", "Automated multi-region database snapshot and restore.")
        ]
    }
]

def generate_pdf(item, filepath):
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    
    header_style = ParagraphStyle(
        'HeaderName',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0f172a'),
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#475569'),
        fontName='Helvetica'
    )
    
    section_title_style = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#1e40af'),
        fontName='Helvetica-Bold',
        spaceBefore=10,
        spaceAfter=4
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#1e293b'),
        fontName='Helvetica'
    )
    
    bold_body = ParagraphStyle(
        'BoldBody',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    story = []
    
    # Name & Title
    story.append(Paragraph(item["name"], header_style))
    contact_line = f"{item['title']} | {item['location']} | {item['email']} | {item['phone']}"
    story.append(Paragraph(contact_line, subtitle_style))
    links_line = f"LinkedIn: {item['linkedin']} | GitHub: {item['github']}"
    story.append(Paragraph(links_line, subtitle_style))
    story.append(Spacer(1, 8))

    # Summary
    story.append(Paragraph("Professional Summary", section_title_style))
    story.append(Paragraph(item["summary"], body_style))
    story.append(Spacer(1, 6))

    # Skills
    story.append(Paragraph("Technical Skills", section_title_style))
    story.append(Paragraph(f"<b>Key Technologies:</b> {item['skills']}", body_style))
    story.append(Spacer(1, 6))

    # Education
    story.append(Paragraph("Education & Academic Background", section_title_style))
    for line in item["education"].split("\n"):
        story.append(Paragraph(line, body_style))
    story.append(Spacer(1, 6))

    # Experience
    story.append(Paragraph("Work Experience", section_title_style))
    for role, comp, desc in item["experience"]:
        story.append(Paragraph(f"<b>{role}</b> — {comp}", bold_body))
        story.append(Paragraph(f"• {desc}", body_style))
        story.append(Spacer(1, 4))

    # Projects
    if "projects" in item and item["projects"]:
        story.append(Paragraph("Key Projects", section_title_style))
        for ptitle, ptech, pdesc in item["projects"]:
            story.append(Paragraph(f"<b>{ptitle}</b> [{ptech}]", bold_body))
            story.append(Paragraph(f"• {pdesc}", body_style))
            story.append(Spacer(1, 4))

    doc.build(story)

def generate_docx(item, filepath):
    doc = docx.Document()
    
    # Header
    title = doc.add_heading(item["name"], level=1)
    title.runs[0].font.color.rgb = docx.shared.RGBColor(15, 23, 42)
    
    contact_p = doc.add_paragraph()
    contact_p.add_run(f"{item['title']} | {item['location']}\n").bold = True
    contact_p.add_run(f"Email: {item['email']} | Phone: {item['phone']}\n")
    contact_p.add_run(f"LinkedIn: {item['linkedin']} | GitHub: {item['github']}")

    # Summary
    doc.add_heading("Professional Summary", level=2)
    doc.add_paragraph(item["summary"])

    # Skills
    doc.add_heading("Technical Skills", level=2)
    p = doc.add_paragraph()
    p.add_run("Skills & Tools: ").bold = True
    p.add_run(item["skills"])

    # Education
    doc.add_heading("Education", level=2)
    for line in item["education"].split("\n"):
        doc.add_paragraph(line)

    # Experience
    doc.add_heading("Work Experience", level=2)
    for role, comp, desc in item["experience"]:
        exp_p = doc.add_paragraph()
        exp_p.add_run(f"{role} — {comp}\n").bold = True
        exp_p.add_run(f"• {desc}")

    # Projects
    if "projects" in item and item["projects"]:
        doc.add_heading("Key Projects", level=2)
        for ptitle, ptech, pdesc in item["projects"]:
            proj_p = doc.add_paragraph()
            proj_p.add_run(f"{ptitle} ({ptech})\n").bold = True
            proj_p.add_run(f"• {pdesc}")

    doc.save(filepath)

def main():
    print(f"Generating realistic sample resumes in {OUTPUT_DIR}...")
    for item in SAMPLE_RESUMES_CONFIG:
        path = os.path.join(OUTPUT_DIR, item["filename"])
        if item["format"] == "pdf":
            generate_pdf(item, path)
            print(f"✓ Generated PDF: {item['filename']}")
        else:
            generate_docx(item, path)
            print(f"✓ Generated DOCX: {item['filename']}")
    print("Done generating sample files!")

if __name__ == "__main__":
    main()
