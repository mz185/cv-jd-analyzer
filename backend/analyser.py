import anthropic
import json
from models import ExtractedData, AnalysisResult

client = anthropic.Anthropic()

async def run_analysis(jd_text: str, cv_text: str) -> AnalysisResult:
    # --- First call: extract structured data ---
    first_response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=1000,
        messages=[{
            "role": "user",
            "content": f"""Extract structured data from this job description and CV.

Return ONLY valid JSON matching this exact structure, no other text, no markdown:
{{
  "jd_skills": ["skill1", "skill2"],
  "cv_skills": ["skill1", "skill2"],
  "cv_experience_years": 5,
  "cv_role_level": "mid"
}}

Job Description:
{jd_text}

CV:
{cv_text}"""
        }]
    )

    raw_first = first_response.content[0].text
    print("FIRST RESPONSE:", raw_first)  # debug

    # Strip markdown fences if present
    clean_first = raw_first.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    extracted = ExtractedData(**json.loads(clean_first))

    # --- Second call: generate analysis ---
    second_response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=1000,
        messages=[{
            "role": "user",
            "content": f"""Based on this candidate data, generate a gap analysis.

JD requires: {extracted.jd_skills}
CV shows: {extracted.cv_skills}
Experience: {extracted.cv_experience_years} years, {extracted.cv_role_level} level

Return ONLY valid JSON matching this exact structure, no other text, no markdown:
{{
  "skill_gaps": ["gap1", "gap2"],
  "interview_questions": ["question1", "question2"],
  "talking_points": ["point1", "point2"]
}}"""
        }]
    )

    raw_second = second_response.content[0].text
    print("SECOND RESPONSE:", raw_second)  # debug

    clean_second = raw_second.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    return AnalysisResult(**json.loads(clean_second))