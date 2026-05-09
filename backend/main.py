from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from parser import extract_text_from_pdf
from analyser import run_analysis
from models import AnalysisResult

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyse", response_model=AnalysisResult)
async def analyse(
    jd_text: str = Form(...),
    cv_file: UploadFile = File(...)
):
    cv_bytes = await cv_file.read()
    cv_text = extract_text_from_pdf(cv_bytes)
    result = await run_analysis(jd_text, cv_text)
    return result