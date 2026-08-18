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

  const grouped = quizzes.reduce((acc, q) => {
    const key = q.course_code || 'Uncategorized';
    if (!acc[key]) acc[key] = { name: q.course_name, quizzes: [] };
    acc[key].quizzes.push(q);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>🧠 Neuron</h1>
        {user ? (
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 14 }}>
            <span>Hi, {user.name.split(' ')[0]}</span>
            <Link to={`/progress/${user.id}`}>My Progress</Link>
            <Link to="/create">+ New Quiz</Link>
            <button onClick={handleLogout} style={{ background: '#eef0f7', color: '#1a1a2e', padding: '8px 16px' }}>Log out</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <Link to="/login">Log in</Link>
            <Link to="/register"><button>Get Started</button></Link>
          </div>
        )}
      </div>

      {!user && (
        <div className="hero">
          <h1>Practice tools shouldn't be scarce.</h1>
          <p>Neuron gives UNICAL students real, curriculum-matched quizzes across every 100L course — free, and built to help you actually learn.</p>
          <Link to="/register"><button style={{ background: 'white', color: '#4f46e5' }}>Start practicing free</button></Link>
        </div>
      )}

      <h2 style={{ fontSize: 20 }}>Available Courses</h2>
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
      {quizzes.length === 0 && !error && <p style={{ color: '#6b7280' }}>No quizzes yet.</p>}

      {Object.entries(grouped).map(([code, group]) => (
        <div key={code} style={{ marginBottom: 28 }}>
          <h3 style={{ marginBottom: 4 }}>{code}</h3>
          <p style={{ margin: '0 0 12px', color: '#6b7280', fontSize: 14 }}>{group.name}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {group.quizzes.map(q => (
              <div key={q.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <strong style={{ fontSize: 17 }}>{q.title}</strong>
                  <span className={`badge ${q.mode === 'practice' ? 'badge-practice' : 'badge-focused'}`}>
                    {q.mode === 'practice' ? 'Practice' : 'Focused'}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', margin: '6px 0 12px' }}>
                  {q.time_limit_seconds ? `⏱ ${q.time_limit_seconds}s` : 'Untimed'}
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