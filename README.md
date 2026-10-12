# AI Resume Analyzer

An AI-powered web application built with **Python and FastAPI** that analyzes resumes, extracts skills, identifies resume sections, and compares candidate skills with job descriptions to help evaluate job suitability.

## Features

- **Resume Upload:** Upload resumes in PDF and DOCX formats.
- **Skill Extraction:** Automatically identify technical skills from resume content.
- **Resume Section Detection:** Identify sections such as summary, experience, education, projects, skills, and certifications.
- **Job Description Matching:** Compare extracted resume skills against a given job description.
- **Skill Gap Analysis:** Display matching and missing skills to identify areas for improvement.
- **Match Percentage:** Calculate a skill-match percentage based on the comparison results.
- **Interactive Interface:** View resume analysis and comparison results through a web interface.

## Technologies Used

- **Programming Language:** Python
- **Backend Framework:** FastAPI
- **Frontend:** HTML, CSS, JavaScript
- **Template Engine:** Jinja2
- **PDF Processing:** PyMuPDF (`fitz`)
- **API Server:** Uvicorn
- **Testing:** pytest

## Project Structure

```text
AI_RESUME_ANALYZER/
├── app/
│   ├── routers/
│   │   └── resume.py
│   ├── services/
│   │   └── pdf_parser.py
│   ├── main.py
│   ├── resume_analyzer.py
│   └── skills.py
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
├── templates/
│   └── index.html
├── tests/
├── uploads/
├── .gitignore
├── requirements.txt
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Gnaneswari0603/ai-resume-analyzer.git
```

### 2. Navigate to the project directory

```bash
cd ai-resume-analyzer
```

### 3. Create a virtual environment

```bash
python -m venv venv
```

Activate the environment.

**Windows PowerShell:**

```powershell
.\venv\Scripts\Activate.ps1
```

**Windows Command Prompt:**

```cmd
venv\Scripts\activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Run the application

```bash
uvicorn app.main:app --reload
```

### 6. Open the application

Visit the following URL in your browser:

http://127.0.0.1:8000

## How It Works

1. Upload a resume in a supported format.
2. The application extracts the resume text.
3. Technical skills and relevant resume sections are identified.
4. Paste a job description into the comparison section.
5. The application compares the resume skills with the job description.
6. Review the match percentage, matching skills, and missing skills.

## Testing

Run the test suite from the project root:

```bash
pytest
```

## Learning Outcomes

This project provided practical experience with:

- Building web applications using FastAPI.
- Designing REST API endpoints.
- Processing uploaded resume files.
- Extracting and matching technical skills from text.
- Integrating Python backend logic with a web interface.
- Writing tests for application functionality.
- Managing dependencies and version control with Git and GitHub.

## Future Enhancements

- Improve skill extraction using NLP techniques.
- Add resume scoring and improvement suggestions.
- Support additional resume formats.
- Generate downloadable resume analysis reports.
- Enhance job description matching with semantic similarity.

## Author

**Gnaneswari**

GitHub: [Gnaneswari0603](https://github.com/Gnaneswari0603)

---

If you find this project useful, feel free to explore the repository and share feedback.
