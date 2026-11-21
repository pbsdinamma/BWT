import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.parser import ResumeParser
import os
import json

# 1. Test Revanth's Resume
f_res = 'backend/uploads/4c7a3289-ff18-424a-90a5-021b3dfb35fa_AdmFilePDF.pdf'
with open(f_res, 'rb') as f:
    parsed = ResumeParser.parse_resume(f.read(), 'AdmFilePDF.pdf')

print('=== PARSED REVANTH RESUME ===')
print('Name:', parsed['name'])
print('Email:', parsed['email'])
print('Phone:', parsed['phone'])
print('Location:', parsed['location'])
print('Degree:', parsed['education']['degree'])
print('College:', parsed['education']['college'])
print('CGPA:', parsed['education']['cgpa'])
print('Grad Year:', parsed['education']['graduation_year'])
print('12th:', parsed['education']['twelfth_percentage'], f"({parsed['education']['twelfth_board']})")
print('10th:', parsed['education']['tenth_percentage'], f"({parsed['education']['tenth_board']})")
print('Experience (Years):', parsed['years_of_experience'])
print('Experience History Count:', len(parsed['experience_history']))
print('Projects Count:', len(parsed['projects']))
for p in parsed['projects']:
    print('  *', p['title'], f"({p['date']}):", p['tech_stack'])
print('Skills Count:', len(parsed['skills']))
print('Sample Skills:', parsed['skills'][:15])

# Assertions for accuracy
assert parsed['name'] == 'Pillalamarri Revanth', f"Wrong name: {parsed['name']}"
assert parsed['email'] == 'revanthp2313.24@kgpian.iitkgp.ac.in', f"Wrong email: {parsed['email']}"
assert parsed['education']['cgpa'] == 7.58, f"Wrong CGPA: {parsed['education']['cgpa']}"
assert parsed['education']['graduation_year'] == 2028, f"Wrong grad year: {parsed['education']['graduation_year']}"
assert parsed['education']['twelfth_percentage'] == 97.2, f"Wrong 12th: {parsed['education']['twelfth_percentage']}"
assert parsed['education']['tenth_percentage'] == 93.1, f"Wrong 10th: {parsed['education']['tenth_percentage']}"
assert parsed['years_of_experience'] == 0.0, f"Fresher should have 0 exp: {parsed['years_of_experience']}"
assert len(parsed['experience_history']) == 0, 'Fresher should have empty history'
assert len(parsed['projects']) == 4, f"Expected 4 projects, got {len(parsed['projects'])}"
assert 'Communication' not in parsed['skills'], 'Communication must not be in technical skills'

# Skills must be prioritized: Core engineering stacks (MERN, React, Node.js, Express.js, etc.) at the top
top_5_skills = parsed['skills'][:5]
print('Top 5 skills:', top_5_skills)
assert 'MERN' in top_5_skills, f"MERN should be in top 5, got {top_5_skills}"
assert 'React' in top_5_skills or 'Node.js' in top_5_skills, f"React/Node should be in top 5, got {top_5_skills}"
assert parsed['skills'][-1] in ['Adobe Premiere Pro', 'After Effects', 'Blender', 'Matlab'], f"Media tools should be at bottom, got {parsed['skills'][-1]}"

# 2. Test Non-Resume / Assignment Rejection
f_assign = 'backend/uploads/4c7a3289-ff18-424a-90a5-021b3dfb35fa_2026_Worksheet_Circuit-Simulation-RLC-interconnect.pdf'
try:
    with open(f_assign, 'rb') as f:
        ResumeParser.parse_resume(f.read(), '2026_Worksheet_Circuit-Simulation-RLC-interconnect.pdf')
    assert False, 'Assignment should have been rejected!'
except ValueError as e:
    assert 'not a resume' in str(e).lower(), f"Unexpected error message: {str(e)}"
    print('\nPASS: Non-resume file was correctly rejected with simple message:', str(e))

print('\n=== ALL PARSER INTEGRITY CHECKS PASSED WITH FLYING COLORS! ===')
