from pydantic import BaseModel, Field
from typing import List, Optional

class Question(BaseModel):
    id: str
    number: str
    text: str
    page: int
    marks: Optional[int] = None

class Region(BaseModel):
    page: int
    bbox: tuple[int, int, int, int] # x1, y1, x2, y2

class Answer(BaseModel):
    id: str
    question_number: str
    text: str
    regions: List[Region] = Field(default_factory=list)
    confidence: float = 1.0

class Mapping(BaseModel):
    question_id: str
    answer_id: Optional[str] = None
    status: str # "matched", "unanswered"
    confidence: float = 1.0

class Grade(BaseModel):
    question_id: str
    marks: int
    max_marks: int
    status: str # "correct", "partially_correct", "incorrect", "needs_review", "unanswered"
    feedback: str

class AssessmentResult(BaseModel):
    questions: List[Question]
    answers: List[Answer]
    mappings: List[Mapping]
    grades: List[Grade]
    unmatched_answers: List[Answer] = Field(default_factory=list)
    answer_sheet_images_base64: List[str] = Field(default_factory=list)
