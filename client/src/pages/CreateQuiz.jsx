import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

function emptyQuestion() {
  return { type: 'mcq', question_text: '', options: ['', '', '', ''], correct_answer: '', points: 1 };
}

function CreateQuiz() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [mode, setMode] = useState('practice');
  const [timeLimit, setTimeLimit] = useState('');
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/quizzes/courses/list').then(res => setCourses(res.data));
  }, []);

  const updateQuestion = (i, field, value) => {
    setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, [field]: value } : q));
  };

  const updateOption = (i, optIdx, value) => {
    setQuestions(prev => prev.map((q, idx) => {
      if (idx !== i) return q;
      const options = [...q.options];
      options[optIdx] = value;
      return { ...q, options };
    }));
  };

  const addQuestion = () => setQuestions(prev => [...prev, emptyQuestion()]);
  const removeQuestion = (i) => setQuestions(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !courseId || questions.length === 0) {
      setError('Title, course, and at least one question are required');
      return;
    }

    const cleaned = questions.map(q => ({
      type: q.type,
      question_text: q.question_text,
      options: q.type === 'mcq' ? q.options.filter(o => o.trim() !== '') : null,
      correct_answer: q.correct_answer,
      points: q.points || 1
    }));

    setSaving(true);
    try {
      await api.post('/quizzes', {
        title,
        course_id: parseInt(courseId),
        mode,
        time_limit_seconds: timeLimit ? parseInt(timeLimit) : null,
        created_by: user.id,
        questions: cleaned
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create quiz');
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 16px' }}>
      <h2>Create a Quiz</h2>
      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 14, fontWeight: 600 }}>Quiz Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              style={{ width: '100%', padding: 10, marginTop: 4 }} required />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 14, fontWeight: 600 }}>Course</label><br />
            <select value={courseId} onChange={e => setCourseId(e.target.value)}
              style={{ width: '100%', padding: 10, marginTop: 4, borderRadius: 8, border: '1px solid #d1d5db' }} required>
              <option value="">Select a course</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 14, fontWeight: 600 }}>Mode</label><br />
              <select value={mode} onChange={e => setMode(e.target.value)}
                style={{ width: '100%', padding: 10, marginTop: 4, borderRadius: 8, border: '1px solid #d1d5db' }}>
                <option value="practice">Practice (multiple retries)</option>
                <option value="focused">Focused (one attempt only)</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 14, fontWeight: 600 }}>Time limit (seconds, optional)</label>
              <input type="number" value={timeLimit} onChange={e => setTimeLimit(e.target.value)}
                placeholder="Leave blank = untimed"
                style={{ width: '100%', padding: 10, marginTop: 4 }} />
            </div>
          </div>
        </div>

        {questions.map((q, i) => (
          <div key={i} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <strong>Question {i + 1}</strong>
              {questions.length > 1 && (
                <button type="button" onClick={() => removeQuestion(i)}
                  style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 10px', fontSize: 13 }}>
                  Remove
                </button>
              )}
            </div>

            <select value={q.type} onChange={e => updateQuestion(i, 'type', e.target.value)}
              style={{ width: '100%', padding: 8, marginBottom: 8, borderRadius: 8, border: '1px solid #d1d5db' }}>
              <option value="mcq">Multiple choice</option>
              <option value="short_answer">Short answer</option>
            </select>

            <input type="text" placeholder="Question text" value={q.question_text}
              onChange={e => updateQuestion(i, 'question_text', e.target.value)}
              style={{ width: '100%', padding: 10, marginBottom: 8 }} required />

            {q.type === 'mcq' ? (
              <>
                {q.options.map((opt, optIdx) => (
                  <input key={optIdx} type="text" placeholder={`Option ${optIdx + 1}`} value={opt}
                    onChange={e => updateOption(i, optIdx, e.target.value)}
                    style={{ width: '100%', padding: 8, marginBottom: 6 }} />
                ))}
                <input type="text" placeholder="Correct answer (must match one option exactly)"
                  value={q.correct_answer} onChange={e => updateQuestion(i, 'correct_answer', e.target.value)}
                  style={{ width: '100%', padding: 10, marginTop: 4 }} required />
              </>
            ) : (
              <input type="text" placeholder="Correct answer (expected text)"
                value={q.correct_answer} onChange={e => updateQuestion(i, 'correct_answer', e.target.value)}
                style={{ width: '100%', padding: 10 }} required />
            )}
          </div>
        ))}

        <button type="button" onClick={addQuestion} style={{ background: '#e5e7eb', color: '#1a1a2e', marginBottom: 16 }}>
          + Add another question
        </button>

        {error && <p style={{ color: '#dc2626' }}>{error}</p>}

        <button type="submit" disabled={saving} style={{ width: '100%' }}>
          {saving ? 'Saving...' : 'Create Quiz'}
        </button>
      </form>
    </div>
  );
}

export default CreateQuiz;