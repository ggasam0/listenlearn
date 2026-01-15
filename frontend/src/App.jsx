import { useEffect, useMemo, useState } from "react";

const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const emptyLesson = {
  id: "",
  title: "",
  level: "",
  duration_minutes: 0,
  description: "",
  audio_url: "",
  transcript: "",
  questions: [],
};

function App() {
  const [lessons, setLessons] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [lesson, setLesson] = useState(emptyLesson);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    const loadLessons = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiBase}/api/lessons`);
        const data = await response.json();
        setLessons(data);
        if (data.length > 0) {
          setSelectedId(data[0].id);
        }
      } catch (error) {
        console.error("Failed to load lessons", error);
      } finally {
        setLoading(false);
      }
    };

    loadLessons();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      return;
    }
    const loadLesson = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiBase}/api/lessons/${selectedId}`);
        const data = await response.json();
        setLesson(data);
        setAnswers({});
        setResult(null);
        setShowTranscript(false);
      } catch (error) {
        console.error("Failed to load lesson", error);
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [selectedId]);

  const progress = useMemo(() => {
    if (!lesson.questions.length) {
      return 0;
    }
    const answered = lesson.questions.filter((question) => answers[question.id]).length;
    return Math.round((answered / lesson.questions.length) * 100);
  }, [lesson.questions, answers]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setResult(null);
    try {
      const response = await fetch(`${apiBase}/api/lessons/${lesson.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Failed to submit answers", error);
    }
  };

  if (loading && lessons.length === 0) {
    return (
      <div className="page">
        <header className="hero">
          <h1>ListenLearn</h1>
          <p>加载课程中...</p>
        </header>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="tag">听力学习 · React + FastAPI</p>
          <h1>ListenLearn 听力训练</h1>
          <p className="subtitle">
            跟随课程进行精听训练，记录答案并立即获得反馈。
          </p>
        </div>
        <div className="progress-card">
          <h2>学习进度</h2>
          <p>{progress}% 已填写</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <h2>课程列表</h2>
          <ul>
            {lessons.map((item) => (
              <li key={item.id}>
                <button
                  className={item.id === selectedId ? "lesson active" : "lesson"}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                >
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <span>
                    {item.level} · {item.duration_minutes} 分钟
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="content">
          <div className="lesson-header">
            <div>
              <h2>{lesson.title}</h2>
              <p>{lesson.description}</p>
            </div>
            <div className="lesson-meta">
              <span>等级: {lesson.level}</span>
              <span>时长: {lesson.duration_minutes} 分钟</span>
            </div>
          </div>

          <div className="audio-card">
            <h3>听力音频</h3>
            <audio controls src={lesson.audio_url}>
              Your browser does not support the audio element.
            </audio>
            <div className="transcript">
              <button
                type="button"
                className="secondary"
                onClick={() => setShowTranscript((prev) => !prev)}
              >
                {showTranscript ? "隐藏原文" : "显示原文"}
              </button>
              {showTranscript && <p>{lesson.transcript}</p>}
            </div>
          </div>

          <form className="quiz" onSubmit={handleSubmit}>
            <h3>听力问题</h3>
            {lesson.questions.map((question) => (
              <div key={question.id} className="question">
                <label htmlFor={question.id}>{question.prompt}</label>
                <input
                  id={question.id}
                  type="text"
                  placeholder="输入你的答案"
                  value={answers[question.id] || ""}
                  onChange={(event) => handleAnswerChange(question.id, event.target.value)}
                />
                {result?.feedback?.[question.id] && (
                  <span className="feedback">{result.feedback[question.id]}</span>
                )}
              </div>
            ))}
            <button type="submit" className="primary">
              提交答案
            </button>
          </form>

          {result && (
            <div className="result">
              <h3>评分结果</h3>
              <p>
                你答对了 {result.score} / {result.total} 题。
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
