
import re


SKILLS = [
    "Python",
    "Java",
    "C++",
    "C",
    "JavaScript",
    "HTML",
    "CSS",
    "SQL",
    "Django",
    "Flask",
    "FastAPI",
    "MySQL",
    "MongoDB",
    "SQLite",
    "Pandas",
    "NumPy",
    "TensorFlow",
    "PyTorch",
    "Scikit-learn",
    "Selenium",
    "BeautifulSoup",
    "Git",
    "GitHub",
    "Linux",
    "Docker",
    "AWS",
    "Azure",
    "REST API",
    "RESTful API",
    "Machine Learning",
    "Deep Learning",
    "NLP",
    "Artificial Intelligence",
    "Bootstrap",
    "Jinja2",
    "Postman"
]


def extract_skills(text):
    found_skills = []

    if not text:
        return found_skills

    # Convert extracted resume text to lowercase
    text = text.lower()

    for skill in SKILLS:

        skill_lower = skill.lower()

        # ==========================================
        # C
        # ==========================================

        if skill_lower == "c":
            pattern = r"(?<![a-z0-9+#])c(?![a-z0-9+#])"

        # ==========================================
        # C++
        # ==========================================

        elif skill_lower == "c++":
            pattern = r"(?<![a-z0-9])c\+\+(?![a-z0-9])"

        # ==========================================
        # C#
        # ==========================================

        elif skill_lower == "c#":
            pattern = r"(?<![a-z0-9])c#(?![a-z0-9])"

        # ==========================================
        # Skills containing spaces
        # ==========================================

        elif " " in skill_lower:
            pattern = (
                r"(?<![a-z0-9])"
                + re.escape(skill_lower)
                + r"(?![a-z0-9])"
            )

        # ==========================================
        # Normal skills
        # ==========================================

        else:
            pattern = (
                r"(?<![a-z0-9])"
                + re.escape(skill_lower)
                + r"(?![a-z0-9])"
            )

        # ==========================================
        # Check whether skill exists
        # ==========================================

        if re.search(pattern, text):
            found_skills.append(skill)

    return found_skills

