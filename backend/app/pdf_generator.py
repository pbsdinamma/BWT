import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_candidate_pdf(cand, output_path: str):
    """
    Generates a clean, professional, ATS-formatted PDF resume document
    from structured Candidate model data.
    """
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    styles = getSampleStyleSheet()

    # Typography & Styles matching HireSwift palette
    title_style = ParagraphStyle(
        'CandName',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0F172A'),
        alignment=1  # Centered
    )
    contact_style = ParagraphStyle(
        'CandContact',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#475569'),
        alignment=1  # Centered
    )
    section_heading = ParagraphStyle(
        'SectionHead',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#1E3A8A'),
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        'CandBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1E293B')
    )
    bold_subhead = ParagraphStyle(
        'BoldSub',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0F172A')
    )
    sub_detail = ParagraphStyle(
        'SubDetail',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#64748B'),
        alignment=2  # Right align
    )
    bullet_style = ParagraphStyle(
        'CandBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#334155'),
        leftIndent=12
    )

    story = []

    # 1. Header (Name & Contact)
    cand_name = getattr(cand, 'name', 'Candidate Resume')
    story.append(Paragraph(cand_name.upper(), title_style))
    
    contact_items = []
    loc = getattr(cand, 'location', '')
    if loc:
        contact_items.append(loc)
    em = getattr(cand, 'email', '')
    if em:
        contact_items.append(em)
    ph = getattr(cand, 'phone', '')
    if ph:
        contact_items.append(ph)
    li = getattr(cand, 'linkedin', '')
    if li:
        contact_items.append(li)
    gh = getattr(cand, 'github', '')
    if gh:
        contact_items.append(gh)
        
    story.append(Spacer(1, 4))
    story.append(Paragraph(" • ".join(contact_items) if contact_items else "Contact Information on File", contact_style))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=6))

    # 2. Candidate Profile & Summary
    exp_yrs = float(getattr(cand, 'years_of_experience', 0.0) or getattr(cand, 'experience_years', 0.0) or 0.0)
    edu = getattr(cand, 'education', None)
    college = (edu.college if edu and edu.college else None) or "Institute of Technology"
    degree = (edu.degree if edu and edu.degree else None) or "B.Tech"
    grad_year = (edu.graduation_year if edu and edu.graduation_year else None) or "2026"
    skills_list = getattr(cand, 'skills', []) or []
    skills_preview = ", ".join(skills_list[:6]) if skills_list else "Software Engineering"

    if exp_yrs > 0:
        story.append(Paragraph("PROFESSIONAL SUMMARY", section_heading))
        summary = (
            f"Experienced software engineering professional with {exp_yrs} years of practical experience "
            f"specializing in building scalable applications, backend services, and robust web solutions. "
            f"Demonstrated core competencies across {skills_preview}."
        )
    else:
        story.append(Paragraph("CANDIDATE PROFILE & OBJECTIVE", section_heading))
        summary = (
            f"Undergraduate student at {college} ({degree}, Graduating {grad_year}) with strong technical "
            f"and analytical foundations in {skills_preview}. Actively seeking software engineering opportunities "
            f"to apply algorithmic skills and hands-on project experience."
        )
    story.append(Paragraph(summary, body_style))
    story.append(Spacer(1, 6))

    # 3. Education & Academics
    story.append(Paragraph("EDUCATION & ACADEMICS", section_heading))
    cgpa_str = f"<b>CGPA: {edu.cgpa} / 10.0</b>" if (edu and edu.cgpa) else ""
    edu_table_data = [
        [
            Paragraph(f"<b>{college}</b>", bold_subhead),
            Paragraph(f"Grad: {grad_year}", sub_detail)
        ],
        [
            Paragraph(f"{degree}", body_style),
            Paragraph(cgpa_str, sub_detail)
        ]
    ]
    t_edu = Table(edu_table_data, colWidths=[380, 160])
    t_edu.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
        ('TOPPADDING', (0,0), (-1,-1), 1),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_edu)

    if edu and (edu.twelfth_percentage or edu.tenth_percentage):
        board_bits = []
        if edu.twelfth_percentage:
            board_bits.append(f"Class XII: {edu.twelfth_percentage}% ({edu.twelfth_board or 'Higher Secondary'})")
        if edu.tenth_percentage:
            board_bits.append(f"Class X: {edu.tenth_percentage}% ({edu.tenth_board or 'Secondary School'})")
        story.append(Spacer(1, 2))
        story.append(Paragraph(" • ".join(board_bits), contact_style))
    story.append(Spacer(1, 6))

    # 4. Technical Skills
    if skills_list:
        story.append(Paragraph("TECHNICAL SKILLS", section_heading))
        cat_skills = getattr(cand, 'categorized_skills', {}) or {}
        if cat_skills:
            for cat, sks in cat_skills.items():
                if sks:
                    story.append(Paragraph(f"<b>{cat}:</b> {', '.join(sks)}", body_style))
                    story.append(Spacer(1, 2))
        else:
            story.append(Paragraph(f"<b>Core Technologies:</b> {', '.join(skills_list)}", body_style))
        story.append(Spacer(1, 6))

    # 5. Work Experience (if any)
    exp_hist = getattr(cand, 'experience_history', []) or []
    if exp_hist:
        story.append(Paragraph("WORK EXPERIENCE", section_heading))
        for exp in exp_hist:
            exp_table = [
                [
                    Paragraph(f"<b>{exp.role or 'Software Engineer'}</b> — {exp.company or 'Company'}", bold_subhead),
                    Paragraph(exp.duration or "", sub_detail)
                ]
            ]
            et = Table(exp_table, colWidths=[380, 160])
            et.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 1),
                ('TOPPADDING', (0,0), (-1,-1), 1),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ]))
            story.append(et)
            if exp.description:
                story.append(Paragraph(exp.description, body_style))
            story.append(Spacer(1, 4))
        story.append(Spacer(1, 4))

    # 6. Projects
    projs = getattr(cand, 'projects', []) or []
    if projs:
        story.append(Paragraph("KEY TECHNICAL PROJECTS", section_heading))
        for p in projs:
            tech_note = f" (Tech: {', '.join(p.tech_stack)})" if p.tech_stack else ""
            p_table = [
                [
                    Paragraph(f"<b>{p.title}</b>{tech_note}", bold_subhead),
                    Paragraph(p.date or "", sub_detail)
                ]
            ]
            pt = Table(p_table, colWidths=[400, 140])
            pt.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 1),
                ('TOPPADDING', (0,0), (-1,-1), 1),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ]))
            story.append(pt)
            if p.bullets:
                for b in p.bullets:
                    story.append(Paragraph(f"• {b}", bullet_style))
            elif p.description:
                story.append(Paragraph(p.description, body_style))
            story.append(Spacer(1, 4))

    # 7. Certifications (if any)
    certs = getattr(cand, 'certifications', []) or []
    if certs:
        story.append(Paragraph("CERTIFICATIONS & ACHIEVEMENTS", section_heading))
        for c_cert in certs:
            story.append(Paragraph(f"• {c_cert}", bullet_style))
        story.append(Spacer(1, 4))

    doc.build(story)
    return output_path
