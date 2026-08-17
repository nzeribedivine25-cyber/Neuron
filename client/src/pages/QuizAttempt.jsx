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
    if (!user) {
      navigate('/login');
      return;
    }
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

  if (error) return <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 16px' }}><p style={{ color: '#dc2626' }}>{error}</p></div>;
  if (!quiz) return <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 16px' }}><p>Loading quiz...</p></div>;

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 16px' }}>
      <h2>{quiz.title}</h2>
      {timeLeft !== null && (
        <div className="card" style={{ marginBottom: 16, padding: 10, textAlign: 'center', fontWeight: 700, color: timeLeft < 30 ? '#dc2626' : '#1a1a2e' }}>
          ⏱ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </div>
      )}

      {quiz.questions.map((q, i) => (
        <div key={q.id} className="card" style={{ marginBottom: 14 }}>
          <p style={{ marginTop: 0 }}><strong>Q{i + 1}.</strong> {q.question_text}</p>
          {q.type === 'mcq' ? (
            q.options.map(opt => (
              <label key={opt} style={{ display: 'block', marginBottom: 8, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  value={opt}
                  checked={answers[q.id] === opt}
                  onChange={() => handleAnswerChange(q.id, opt)}
                  style={{ marginRight: 8 }}
                /> {opt}
              </label>
            ))
          ) : (
            <input
              type="text"
              value={answers[q.id] || ''}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              style={{ width: '100%', padding: 10 }}
            />
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