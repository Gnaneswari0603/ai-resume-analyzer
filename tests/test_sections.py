from app.resume_analyzer import detect_sections

sample_text = """
SUMMARY

Python developer with experience in web development.

WORK EXPERIENCE

Junior Developer at TechnoHacks.

PROJECTS

Smart Traffic System
Expense Tracker

SKILLS

Python, Django, FastAPI, SQL

EDUCATION

Bachelor of Computer Science

CERTIFICATIONS

Python Full Stack Development
Azure AI Fundamentals
"""

sections = detect_sections(sample_text)

print("Detected Sections:")

for section, found in sections.items():
    print(f"{section}: {found}")
