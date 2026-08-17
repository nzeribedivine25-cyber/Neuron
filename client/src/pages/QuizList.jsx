import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';

function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    api.get('/quizzes')
      .then(res => setQuizzes(res.data))
      .catch(() => setError('Could not load quizzes'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Group quizzes by course code
  const grouped = quizzes.reduce((acc, q) => {
    const key = q.course_code || 'Uncategorized';
    if (!acc[key]) acc[key] = { name: q.course_name, quizzes: [] };
    acc[key].quizzes.push(q);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>🧠 Neuron</h1>
        {user ? (
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span>Hi, {user.name}</span>
            <Link to={`/progress/${user.id}`}>My Progress</Link>
            <Link to="/create">+ New Quiz</Link>
            <button onClick={handleLogout} style={{ background: '#e5e7eb', color: '#1a1a2e' }}>Log out</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/login">Log in</Link>
            <Link to="/register">Register</Link>
          </div>
        )}
      </div>

      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
      {quizzes.length === 0 && !error && <p style={{ color: '#6b7280' }}>No quizzes yet.</p>}

      {Object.entries(grouped).map(([code, group]) => (
        <div key={code} style={{ marginBottom: 28 }}>
          <h2 style={{ marginBottom: 4 }}>{code}</h2>
          <p style={{ margin: '0 0 12px', color: '#6b7280', fontSize: 14 }}>{group.name}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {group.quizzes.map(q => (
              <div key={q.id} className="card">
                <strong style={{ fontSize: 17 }}>{q.title}</strong>
                <div style={{ fontSize: 13, color: '#6b7280', margin: '6px 0 10px' }}>
                  {q.mode === 'practice' ? '🔁 Practice — retry anytime' : '🎯 Focused — one attempt only'}
                  {q.time_limit_seconds ? ` · ⏱ ${q.time_limit_seconds}s` : ' · Untimed'}
                </div>
                <Link to={`/quiz/${q.id}`}>Take this quiz →</Link>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default QuizList;