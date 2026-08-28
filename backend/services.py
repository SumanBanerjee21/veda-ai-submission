import os
import json
import re
from google import genai
from google.genai import types
from PIL import Image
from models import Question, Answer, Region, Mapping, Grade
from rapidfuzz import fuzz

def get_genai_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable not set")
    return genai.Client(api_key=api_key)

def extract_questions_from_images(image_paths, page_dimensions):
    client = get_genai_client()
    
    prompt = """
    Extract all questions from the provided question paper images.
    Preserve the original numbering exactly. 
    If there are subquestions like '11 (a)' and '11 (b)', extract them as separate questions '11(a)' and '11(b)'.
    Include the question text and any marks specified.
    IMPORTANT: Look for instructions like "Each question carries 2 marks". If present, apply those marks to EVERY question. If you cannot find any marks, default to 2.
    Return a list of JSON objects where each object has:
    - id (string, unique like 'q1')
    - number (string, the question number)
    - text (string, the question text)
    - page (int, the page number where it appears)
    - marks (int, MUST NOT BE NULL. Default to 2 if unknown)
    """
    
    contents = [prompt]
    for i, path in enumerate(image_paths):
        img = Image.open(path)
        contents.append(f"Page {i+1}:")
        contents.append(img)
        
        response = client.models.generate_content(
        model='gemini-3.6-flash',
        contents=contents,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.1
        ),
    )
    
    try:
        data = json.loads(response.text)
        questions = []
        for q in data:
            questions.append(Question(
                id=q.get('id', f"q_{q.get('number')}"),
                number=str(q.get('number')),
                text=q.get('text', ''),
                page=q.get('page', 1),
                marks=q.get('marks')
            ))
        return questions
    except Exception as e:
        print(f"Error parsing questions: {e}")
        return []

def extract_answers_from_images(image_paths, page_dimensions):
    client = get_genai_client()
    
    prompt = """
    Extract all handwritten answers from the provided student answer sheet images.
    For each distinct answer, identify the question number it is answering.
    Provide the transcribed text of the answer.
    Also, provide the bounding box of the answer region on the page.
    The bounding box MUST be in the format [ymin, xmin, ymax, xmax] scaled to 1000. 
    (e.g., [100, 200, 300, 800] means ymin=100, xmin=200, ymax=300, xmax=800 out of 1000).
    An answer might span multiple pages, in which case provide multiple regions.
    Return a list of JSON objects where each object has:
    - id (string, unique like 'a1')
    - question_number (string, the question number it answers)
    - text (string, transcribed text)
    - regions (list of objects with 'page' (int) and 'bbox' (list of 4 ints: [ymin, xmin, ymax, xmax] out of 1000))
    """
    
    contents = [prompt]
    for i, path in enumerate(image_paths):
        img = Image.open(path)
        contents.append(f"Page {i+1}:")
        contents.append(img)
        
        response = client.models.generate_content(
        model='gemini-3.6-flash',
        contents=contents,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.1
        ),
    )
    
    try:
        data = json.loads(response.text)
        answers = []
        for a in data:
            regions = []
            for r in a.get('regions', []):
                page = r.get('page', 1)
                norm_bbox = r.get('bbox', [0, 0, 0, 0])
                if len(norm_bbox) == 4 and page in page_dimensions:
                    ymin, xmin, ymax, xmax = norm_bbox
                    regions.append(Region(page=page, bbox=(ymin, xmin, ymax, xmax)))
            
            answers.append(Answer(
                id=a.get('id', f"a_{a.get('question_number')}"),
                question_number=str(a.get('question_number')),
                text=a.get('text', ''),
                regions=regions,
                confidence=1.0
            ))
        return answers
    except Exception as e:
        print(f"Error parsing answers: {e}")
        return []

def normalize_q_num(q_num):
    q_num = str(q_num).lower().strip()
    q_num = re.sub(r'^q\s*', '', q_num) 
    q_num = re.sub(r'[^a-z0-9]', '', q_num) 
    return q_num

def map_answers_to_questions(questions, answers):
    mappings = []
    unmatched_answers = []
    
    q_dict = {normalize_q_num(q.number): q for q in questions}
    matched_q_ids = set()
    
    for ans in answers:
        norm_ans_num = normalize_q_num(ans.question_number)
        
        if norm_ans_num in q_dict:
            q = q_dict[norm_ans_num]
            mappings.append(Mapping(question_id=q.id, answer_id=ans.id, status="matched", confidence=1.0))
            matched_q_ids.add(q.id)
        else:
            best_match = None
            best_score = 0
            for q in questions:
                if q.id not in matched_q_ids:
                    score = fuzz.token_set_ratio(ans.text.lower(), q.text.lower())
                    if score > best_score:
                        best_score = score
                        best_match = q
            
            if best_match and best_score > 70:
                mappings.append(Mapping(question_id=best_match.id, answer_id=ans.id, status="matched", confidence=best_score / 100.0))
                matched_q_ids.add(best_match.id)
            else:
                unmatched_answers.append(ans)
            
    for q in questions:
        if q.id not in matched_q_ids:
            mappings.append(Mapping(question_id=q.id, status="unanswered"))
            
    return mappings, unmatched_answers

def grade_answers(questions, answers, mappings):
    client = get_genai_client()
    grades = []
    
    q_dict = {q.id: q for q in questions}
    a_dict = {a.id: a for a in answers}
    
    pairs_to_grade = []
    
    for mapping in mappings:
        q = q_dict.get(mapping.question_id)
        if mapping.status == "unanswered":
            grades.append(Grade(question_id=q.id, marks=0, max_marks=q.marks if q.marks is not None else 2, status="unanswered", feedback="No answer provided."))
            continue
            
        a = a_dict.get(mapping.answer_id)
        if not a or not q:
            continue
            
        pairs_to_grade.append({
            "question_id": q.id,
            "question_text": q.text,
            "max_marks": q.marks if q.marks is not None else 2,
            "student_answer": a.text
        })

    if not pairs_to_grade:
        return grades

    prompt = f"""
    Evaluate the following student answers.
    You are provided a JSON array of questions and their corresponding student answers.
    Input:
    {json.dumps(pairs_to_grade)}
    
    Return a list of JSON objects where each object has:
    - question_id: (string) exactly as provided in the input
    - marks: (int) the marks awarded (must not exceed max_marks)
    - status: (string) one of "correct", "partially_correct", "incorrect", "needs_review"
    - feedback: (string) very brief feedback explaining the marks
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1
            ),
        )
        batch_results = json.loads(response.text)
        res_dict = {r['question_id']: r for r in batch_results if 'question_id' in r}
        
        for pair in pairs_to_grade:
            qid = pair['question_id']
            max_marks = pair['max_marks']
            
            if qid in res_dict:
                data = res_dict[qid]
                awarded_marks = max(0, min(data.get('marks', 0), max_marks))
                grades.append(Grade(question_id=qid, marks=awarded_marks, max_marks=max_marks, status=data.get('status', 'needs_review'), feedback=data.get('feedback', '')))
            else:
                grades.append(Grade(question_id=qid, marks=0, max_marks=max_marks, status="needs_review", feedback="AI failed to grade this item in batch."))
                
    except Exception as e:
        print(f"Batch grading failed: {e}")
        for pair in pairs_to_grade:
            grades.append(Grade(question_id=pair['question_id'], marks=0, max_marks=pair['max_marks'], status="needs_review", feedback="Could not automatically grade (API Error)."))
            
    return grades
