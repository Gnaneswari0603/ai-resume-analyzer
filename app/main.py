from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path

from app.routers.resume import router as resume_router

# -----------------------------
# Base directory

# -----------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

app = FastAPI(title="AI RESUME ANALYZER")


# -----------------------------
# Static files
# -----------------------------
app.mount(
    "/static",
    StaticFiles(directory=BASE_DIR / "static"),
    name="static"
)


# -----------------------------
# HTML templates
# -----------------------------
templates = Jinja2Templates(
    directory= str(BASE_DIR / "templates")
)


# -----------------------------
# Resume API routes
# -----------------------------
app.include_router(resume_router)


# -----------------------------
# Home page
# -----------------------------
@app.get("/")
async def home(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={"request":request}
        
    )