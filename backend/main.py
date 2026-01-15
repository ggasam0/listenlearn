from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="ListenLearn API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Question(BaseModel):
    id: str
    prompt: str
    answer: str


class LessonSummary(BaseModel):
    id: str
    title: str
    level: str
    duration_minutes: int
    description: str


class LessonDetail(LessonSummary):
    audio_url: str
    transcript: str
    questions: list[Question]


class SubmitRequest(BaseModel):
    answers: dict[str, str]


class SubmitResponse(BaseModel):
    score: int
    total: int
    feedback: dict[str, str]


LESSONS: list[LessonDetail] = [
    LessonDetail(
        id="lesson-1",
        title="Morning Routine in English",
        level="A2",
        duration_minutes=6,
        description="Practice listening to daily routine vocabulary.",
        audio_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        transcript=(
            "Every morning, I wake up at seven. I make a cup of coffee and check my "
            "schedule. On weekdays, I take the bus to the office. I like to arrive early "
            "so I can review my notes before the first meeting."
        ),
        questions=[
            Question(
                id="q1",
                prompt="What time does the speaker wake up?",
                answer="seven",
            ),
            Question(
                id="q2",
                prompt="How does the speaker go to the office?",
                answer="bus",
            ),
        ],
    ),
    LessonDetail(
        id="lesson-2",
        title="Travel Planning",
        level="B1",
        duration_minutes=8,
        description="Listen for details about planning a trip.",
        audio_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        transcript=(
            "We decided to visit Kyoto in October because the weather is mild. First, "
            "we compared flight prices and booked a small hotel near the train station. "
            "We also wrote a list of temples we want to see and reserved tickets for a "
            "tea ceremony."
        ),
        questions=[
            Question(
                id="q1",
                prompt="Why did they choose October?",
                answer="mild weather",
            ),
            Question(
                id="q2",
                prompt="Where is the hotel located?",
                answer="near the train station",
            ),
        ],
    ),
]


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/lessons", response_model=list[LessonSummary])
def list_lessons() -> list[LessonSummary]:
    return [
        LessonSummary(
            id=lesson.id,
            title=lesson.title,
            level=lesson.level,
            duration_minutes=lesson.duration_minutes,
            description=lesson.description,
        )
        for lesson in LESSONS
    ]


@app.get("/api/lessons/{lesson_id}", response_model=LessonDetail)
def lesson_detail(lesson_id: str) -> LessonDetail:
    for lesson in LESSONS:
        if lesson.id == lesson_id:
            return lesson
    raise HTTPException(status_code=404, detail="Lesson not found")


@app.post("/api/lessons/{lesson_id}/submit", response_model=SubmitResponse)
def submit_answers(lesson_id: str, payload: SubmitRequest) -> SubmitResponse:
    lesson = next((lesson for lesson in LESSONS if lesson.id == lesson_id), None)
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")

    feedback: dict[str, str] = {}
    score = 0

    for question in lesson.questions:
        user_answer = payload.answers.get(question.id, "").strip().lower()
        expected = question.answer.strip().lower()
        if user_answer and expected in user_answer:
            score += 1
            feedback[question.id] = "✅ 正确"
        else:
            feedback[question.id] = f"❌ 参考答案: {question.answer}"

    return SubmitResponse(score=score, total=len(lesson.questions), feedback=feedback)
