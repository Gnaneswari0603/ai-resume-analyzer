
import os
import re

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

from app.services.pdf_parser import extract_text_from_pdf
from app.skills import extract_skills, SKILLS
from app.resume_analyzer import detect_sections


router = APIRouter()

# ==================================================
# REQUEST MODEL
# ==================================================

class JDComparisonRequest(BaseModel):
    resume_skills: list[str]
    job_description: str


# ==================================================
# UPLOAD SETTINGS
# ==================================================

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".docx"}


# ==================================================
# ADDITIONAL SKILLS FOR JD COMPARISON
# These are separate from app/skills.py.
# ==================================================

ADDITIONAL_JD_SKILLS = [
    "TypeScript",
    "Kubernetes",
    "Cloud Computing",
    "Cloud",
    "Google Cloud",
    "GCP",
    "Microsoft Azure",
    "Amazon Web Services",
    "DevOps",
    "CI/CD",
    "Jenkins",
    "Terraform",
    "Ansible",
    "React",
    "Angular",
    "Vue.js",
    "Node.js",
    "Express.js",
    "Next.js",
    "Spring Boot",
    "ASP.NET",
    ".NET",
    "PHP",
    "Ruby",
    "Go",
    "Rust",
    "Kotlin",
    "Swift",
    "Dart",
    "Flutter",
    "Redis",
    "PostgreSQL",
    "Oracle",
    "SQL Server",
    "MariaDB",
    "Elasticsearch",
    "Apache Spark",
    "PySpark",
    "Hadoop",
    "Kafka",
    "Airflow",
    "Power BI",
    "Tableau",
    "Excel",
    "Data Analysis",
    "Data Engineering",
    "Data Science",
    "Generative AI",
    "GenAI",
    "Large Language Models",
    "LLM",
    "OpenAI API",
    "Prompt Engineering",
    "LangChain",
    "RAG",
    "Computer Vision",
    "Natural Language Processing",
    "API Testing",
    "Automation Testing",
    "Manual Testing",
    "Playwright",
    "Cypress",
    "JUnit",
    "Pytest",
    "GitLab",
    "GitHub Actions",
    "Networking",
    "Cybersecurity",
    "Information Security",
    "Object-Oriented Programming",
    "OOP",
    "Data Structures",
    "Algorithms",
    "Microservices",
    "GraphQL",
    "SOAP",
    "Agile",
    "Scrum",
]

ALL_JD_SKILLS = list(dict.fromkeys(SKILLS + ADDITIONAL_JD_SKILLS))


# ==================================================
# SKILL ALIASES
# ==================================================

SKILL_ALIASES = {
    "js": "javascript",
    "ts": "typescript",
    "k8s": "kubernetes",
    "postgres": "postgresql",
    "nodejs": "node.js",
    "vue": "vue.js",
    "ml": "machine learning",
    "llms": "llm",
    "rest api": "restful api",
    "chatbot": "chatbot development",
}


def normalize_skill(skill: str) -> str:
    value = re.sub(r"\s+", " ", skill.strip()).lower()
    return SKILL_ALIASES.get(value, value)


# ==================================================
# CHECK WHETHER A SKILL EXISTS IN TEXT
# ==================================================

def skill_exists_in_text(skill: str, text: str) -> bool:

    if not skill or not text:
        return False

    skill = skill.strip().lower()
    text = text.lower()

    # C must be a standalone token.
    # Avoid false matches in cloud, cisco, CSS, etc.
    if skill == "c":
        return bool(
            re.search(
                r"(?<![a-z0-9+#])c(?![a-z0-9+#])",
                text
            )
        )

    # C++
    if skill == "c++":
        return bool(
            re.search(
                r"(?<![a-z0-9])c\+\+(?![a-z0-9])",
                text
            )
        )

    # C#
    if skill == "c#":
        return bool(
            re.search(
                r"(?<![a-z0-9])c#(?![a-z0-9])",
                text
            )
        )

    # Whole-word and phrase matching.
    # This prevents Java from matching JavaScript.
    pattern = (
        r"(?<![a-z0-9])"
        + re.escape(skill)
        + r"(?![a-z0-9])"
    )

    return bool(re.search(pattern, text))


# ==================================================
# EXTRACT SKILLS FROM JOB DESCRIPTION
# ==================================================

def extract_jd_skills(job_description: str) -> list[str]:

    if not job_description or not job_description.strip():
        return []

    text = job_description.strip()
    found = []

    # Find recognized skills, checking longer phrases first.
    sorted_skills = sorted(ALL_JD_SKILLS, key=len, reverse=True)

    for skill in sorted_skills:
        if skill_exists_in_text(skill, text):
            found.append(skill)

    # Support explicitly separated skill lists.
    # Examples:
    # python, django, sap
    # python | django | sap
    # python
    # sap

    is_delimited_list = (
        bool(re.search(r"[,;|\n]", text))
        and len(text.split()) <= 50
    )

    is_single_skill = (
        len(text.split()) == 1
        and bool(
            re.fullmatch(
                r"[A-Za-z][A-Za-z0-9+#./-]*",
                text
            )
        )
    )

    # Support short, space-separated skill lists such as:
    # chatbot python sap
    #
    # Avoid treating an ordinary sentence as a list.
    words = text.split()

    sentence_words = {
        "i", "we", "you", "he", "she", "they", "the",
        "a", "an", "and", "or", "for", "with", "to",
        "of", "in", "on", "is", "are", "be", "have",
        "has", "who", "which", "that", "looking",
        "seeking", "required", "experience", "experienced",
        "developer", "engineer", "candidate", "knowledge",
        "skills", "responsibilities", "requirements"
    }

    is_space_separated_list = (
        1 < len(words) <= 8
        and not re.search(r"[.!?:]", text)
        and not any(
            word.lower() in sentence_words
            for word in words
        )
    )

    if is_delimited_list:
        candidates = [
            item.strip()
            for item in re.split(r"[,;|\n]+", text)
            if item.strip()
        ]
    elif is_single_skill:
        candidates = [text]
    elif is_space_separated_list:
        candidates = words
    else:
        candidates = []

    # Track detected skills after normalization.
    known = {normalize_skill(skill) for skill in found}

    for candidate in candidates:
        candidate = candidate.strip()
        normalized = normalize_skill(candidate)

        if not re.fullmatch(
            r"[A-Za-z][A-Za-z0-9+#./ -]*",
            candidate
        ):
            continue

        # Don't add individual words that are already part of
        # a recognized multi-word skill.
        is_part_of_known_phrase = any(
            re.search(
                r"(?<![a-z0-9])"
                + re.escape(normalized)
                + r"(?![a-z0-9])",
                known_skill
            )
            for known_skill in known
        )

        if normalized not in known and not is_part_of_known_phrase:
            found.append(candidate)
            known.add(normalized)

    # Remove duplicate skills while preserving their order.
    result = []
    seen = set()

    for skill in found:
        key = normalize_skill(skill)

        if key not in seen:
            result.append(skill)
            seen.add(key)

    return result


# ==================================================
# UPLOAD RESUME
# ==================================================

@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):

    filename = os.path.basename(file.filename or "")

    extension = os.path.splitext(filename)[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are allowed"
        )

    if not filename:
        raise HTTPException(
            status_code=400,
            detail="A valid filename is required"
        )

    file_path = os.path.join(UPLOAD_FOLDER, filename)

    contents = await file.read()

    with open(file_path, "wb") as f:
        f.write(contents)

    if extension == ".pdf":
        text = extract_text_from_pdf(file_path)
        skills = extract_skills(text)
        sections = detect_sections(text)

    else:
        # DOCX extraction is not implemented in the existing code.
        text = "DOCX extraction will be added next."
        skills = []
        sections = {}

    return {
        "message": "Resume uploaded successfully",
        "filename": filename,
        "text": text,
        "skills": skills,
        "sections": sections
    }


# ==================================================
# COMPARE RESUME WITH JOB DESCRIPTION
# ==================================================

@router.post("/compare-jd")
async def compare_jd(data: JDComparisonRequest):

    resume_skills = data.resume_skills
    job_description = data.job_description

    # Normalize the current resume skills received from the frontend.
    resume_skills_lower = {
        normalize_skill(skill)
        for skill in resume_skills
        if skill and skill.strip()
    }

    # Extract skills from the JD.
    jd_skills = extract_jd_skills(job_description)

    print("----------------------------------------")
    print("JD RECEIVED:")
    print(repr(job_description))

    print("JD SKILLS DETECTED:")
    print(jd_skills)

    print("RESUME SKILLS RECEIVED:")
    print(resume_skills)

    print("----------------------------------------")

    # Compare skills.
    matching_skills = []
    missing_skills = []

    for skill in jd_skills:
        if normalize_skill(skill) in resume_skills_lower:
            matching_skills.append(skill)
        else:
            missing_skills.append(skill)

    # Calculate match percentage.
    if jd_skills:
        match_percentage = round(
            len(matching_skills) / len(jd_skills) * 100,
            1
        )
    else:
        match_percentage = 0

    return {
        "job_description_skills": jd_skills,
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "match_percentage": match_percentage
    }