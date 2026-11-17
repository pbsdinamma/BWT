import re
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from .models import Candidate, BulkEmailRequest, SentEmailRecord

DEFAULT_TEMPLATES = {
    "interview": {
        "subject": "Interview Invitation: {{job_title}} at {{company}}",
        "body": """Dear {{name}},

Thank you for your application for the {{job_title}} role at {{company}}.

We were thoroughly impressed by your background and experience. We would like to invite you for a 45-minute technical interview.

Interview Details:
- Role: {{job_title}}
- Date & Time: {{interview_date}}
- Meeting Link: {{interview_link}}

Please confirm your availability by replying to this email. We look forward to speaking with you!

Best regards,
Talent Acquisition Team
{{company}}"""
    },
    "shortlisted": {
        "subject": "Application Update: You have been Shortlisted for {{job_title}}",
        "body": """Hi {{name}},

Great news! Our recruiting team has reviewed your resume and you have been shortlisted for the {{job_title}} position at {{company}}.

Your strong experience aligned closely with our current technical requirements. Our hiring manager is currently scheduling interview rounds, and our team will reach out within 48 hours with specific calendar slots.

Best regards,
Hiring Team
{{company}}"""
    },
    "offer": {
        "subject": "Offer of Employment: {{job_title}} at {{company}}",
        "body": """Dear {{name}},

On behalf of {{company}}, I am thrilled to extend an offer for the position of {{job_title}}!

Throughout the interview process, our team was impressed by your technical depth, problem-solving skills, and cultural fit. We are excited about the prospect of you joining our engineering team.

Please find the detailed offer letter attached. We would love to discuss the details and welcome you aboard.

Warm congratulations!
Recruitment Team
{{company}}"""
    },
    "rejection": {
        "subject": "Update on your application for {{job_title}} at {{company}}",
        "body": """Dear {{name}},

Thank you for taking the time to apply for the {{job_title}} role at {{company}} and sharing your profile with us.

After careful review of your background against our immediate requirements, we have decided to move forward with other candidates whose current skillsets more closely match our specific tech stack for this role.

We truly appreciate your interest in {{company}} and will keep your profile in our active talent pool for future opportunities that align with your expertise.

We wish you the very best in your career pursuits!

Sincerely,
Talent Team
{{company}}"""
    }
}

class EmailService:
    @staticmethod
    def render_template(template_str: str, variables: Dict[str, str]) -> str:
        rendered = template_str
        for key, val in variables.items():
            rendered = re.sub(rf"\{{\{{\s*{key}\s*\}}\}}", str(val), rendered)
        return rendered

    @classmethod
    def send_bulk_emails(
        cls, request: BulkEmailRequest, candidates: List[Candidate], active_job_title: str = "Software Engineer"
    ) -> List[SentEmailRecord]:
        records = []
        company = request.company_name or "HireSwift"
        job_title = request.job_title or active_job_title
        interview_date = request.interview_date or "Tomorrow at 3:00 PM IST"
        interview_link = request.interview_link or "https://meet.google.com/hsw-ats-tech"

        cand_map = {c.id: c for c in candidates}

        for c_id in request.candidate_ids:
            cand = cand_map.get(c_id)
            if not cand:
                continue

            variables = {
                "name": cand.name,
                "job_title": job_title,
                "company": company,
                "skills": ", ".join(cand.skills[:4]) if cand.skills else "Engineering",
                "experience": f"{cand.years_of_experience} years",
                "interview_date": interview_date,
                "interview_link": interview_link
            }

            rendered_subject = cls.render_template(request.subject, variables)
            rendered_body = cls.render_template(request.body_template, variables)

            record = SentEmailRecord(
                candidate_id=cand.id,
                candidate_name=cand.name,
                candidate_email=cand.email,
                subject=rendered_subject,
                body=rendered_body,
                template_type=request.template_type,
                status="Delivered",
                sent_at=datetime.now(timezone.utc).isoformat()
            )
            records.append(record)

        return records
