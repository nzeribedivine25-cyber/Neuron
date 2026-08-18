import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';

function QuizAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get(`/quizzes/${id}`).then(res => {
      setQuiz(res.data);
      return api.post(`/quizzes/${id}/attempts`, { user_id: user.id });
    }).then(res => {
      setAttemptId(res.data.attempt_id);
      if (res.data.time_limit_seconds) setTimeLeft(res.data.time_limit_seconds);
    }).catch(err => {
      setError(err.response?.data?.error || 'Could not start quiz');
    });
  }, [id]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (submitting || !attemptId) return;
    setSubmitting(true);
    const payload = {
      answers: Object.entries(answers).map(([question_id, user_answer]) => ({
        question_id: parseInt(question_id),
        user_answer
      }))
    };
    try {
      const res = await api.put(`/attempts/attempt/${attemptId}`, payload);
      navigate(`/results/${res.data.attempt_id}`, { state: res.data });
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;

  if (error) return <div style={{ maxWidth: 640, margin: '60px auto', padding: '0 16px' }}><p style={{ color: '#c0392b' }}>{error}</p></div>;
  if (!quiz) return <div style={{ maxWidth: 640, margin: '60px auto', padding: '0 16px' }}><p>Loading quiz...</p></div>;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>
      <h2 style={{ marginBottom: 4 }}>{quiz.title}</h2>
      <p style={{ color: '#8a8378', fontSize: 14, marginTop: 0 }}>
        {answeredCount} of {quiz.questions.length} answered
      </p>

      {timeLeft !== null && (
        <div className="card" style={{ marginBottom: 16, padding: 12, textAlign: 'center', fontWeight: 800, fontSize: 18, color: timeLeft < 30 ? '#c0392b' : '#e8622c' }}>
          ⏱ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </div>
      )}

      {quiz.questions.map((q, i) => (
        <div key={q.id} className="card" style={{ marginBottom: 14 }}>
          <p style={{ marginTop: 0, fontWeight: 600 }}>Q{i + 1}. {q.question_text}</p>
          {q.type === 'mcq' ? (
            q.options.map(opt => (
              <label key={opt} style={{
                display: 'block', marginBottom: 8, padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                background: answers[q.id] === opt ? '#fdf0e8' : 'transparent',
                border: answers[q.id] === opt ? '1.5px solid #e8622c' : '1.5px solid #e6dbc8'
              }}>
                <input
                  type="radio" name={`q-${q.id}`} value={opt}
                  checked={answers[q.id] === opt}
                  onChange={() => handleAnswerChange(q.id, opt)}
                  style={{ marginRight: 10 }}
                /> {opt}
              </label>
            ))
          ) : (
            <input type="text" value={answers[q.id] || ''} onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              style={{ width: '100%', padding: 11 }} />
          )}
        </div>
      ))}

      <button onClick={handleSubmit} disabled={submitting} style={{ width: '100%' }}>
        {submitting ? 'Submitting...' : 'Submit Quiz'}
      </button>
    </div>
  );
}

export default QuizAttempt;