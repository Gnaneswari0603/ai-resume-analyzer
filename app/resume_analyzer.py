SECTION_KEYWORDS = {
    "summary": [
        "summary",
        "profile",
        "objective",
        "professional summary"
    ],

    "experience": [
        "work experience",
        "experience",
        "employment history",
        "professional experience"
    ],

    "projects": [
        "projects",
        "project experience"
    ],

    "skills": [
        "skills",
        "technical skills",
        "core skills"
    ],

    "education": [
        "education",
        "academic background",
        "academic qualifications"
    ],

    "certifications": [
        "certifications",
        "certificates",
        "licenses"
    ]
}


def detect_sections(text):
    text_lower = text.lower()

    sections = {}

    for section, keywords in SECTION_KEYWORDS.items():
        sections[section] = any(
            keyword in text_lower
            for keyword in keywords
        )

    return sections
