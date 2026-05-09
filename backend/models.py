from pydantic import BaseModel
from typing import Optional

class ExtractedData(BaseModel):
    jd_skills: list[str]
    cv_skills: list[str]
    cv_experience_years: Optional[int]
    cv_role_level: Optional[str]

class AnalysisResult(BaseModel):
    skill_gaps: list[str]
    interview_questions: list[str]
    talking_points: list[str]