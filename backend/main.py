from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import shutil
import tempfile
import os
from dotenv import load_dotenv

from models import AssessmentResult
from utils import convert_pdf_to_images
import services

load_dotenv()

app = FastAPI(title="VedaAI Assessment API")

# Allow Next.js frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def save_upload_file_tmp(upload_file: UploadFile) -> str:
    try:
        suffix = os.path.splitext(upload_file.filename)[1]
        fd, path = tempfile.mkstemp(suffix=suffix)
        with os.fdopen(fd, 'wb') as f:
            shutil.copyfileobj(upload_file.file, f)
        return path
    finally:
        upload_file.file.close()

@app.post("/api/assess", response_model=AssessmentResult)
async def assess_paper(
    question_paper: UploadFile = File(...),
    answer_sheet: UploadFile = File(...)
):
    if not os.environ.get("GEMINI_API_KEY"):
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not set on the server.")
        
    try:
        # 1. Save uploaded files temporarily
        qp_path = save_upload_file_tmp(question_paper)
        as_path = save_upload_file_tmp(answer_sheet)
        
        from PIL import Image
        
        # 2. Convert PDFs to images (if they are PDFs)
        qp_images = []
        qp_dims = {}
        if qp_path.lower().endswith('.pdf'):
            qp_images, qp_dims = convert_pdf_to_images(qp_path)
        else:
            qp_images = [qp_path]
            with Image.open(qp_path) as img:
                qp_dims[1] = (img.width, img.height)
            
        as_images = []
        as_dims = {}
        if as_path.lower().endswith('.pdf'):
            as_images, as_dims = convert_pdf_to_images(as_path)
        else:
            as_images = [as_path]
            with Image.open(as_path) as img:
                as_dims[1] = (img.width, img.height)
            
        # 3. AI Extraction
        questions = services.extract_questions_from_images(qp_images, qp_dims)
        answers = services.extract_answers_from_images(as_images, as_dims)
        
        if not questions:
            raise HTTPException(status_code=400, detail="Failed to extract questions from the provided paper.")
            
        # 4. Mapping & Grading
        mappings, unmatched = services.map_answers_to_questions(questions, answers)
        grades = services.grade_answers(questions, answers, mappings)
        
        import base64
        as_base64_list = []
        if as_images:
            for img_path in as_images:
                with open(img_path, "rb") as image_file:
                    b64 = "data:image/png;base64," + base64.b64encode(image_file.read()).decode('utf-8')
                    as_base64_list.append(b64)

        return AssessmentResult(
            questions=questions,
            answers=answers,
            mappings=mappings,
            grades=grades,
            unmatched_answers=unmatched,
            answer_sheet_images_base64=as_base64_list
        )
        
    except Exception as e:
        import traceback
        with open("error_log.txt", "w") as f:
            f.write(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Cleanup temp files would go here in production
        pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
