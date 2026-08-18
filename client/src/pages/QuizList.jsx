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

  const handleDelete = async (quizId) => {
    if (!confirm('Delete this quiz?')) return;
    try {
      await api.delete(`/quizzes/${quizId}`, { data: { user_id: user.id } });
      setQuizzes(prev => prev.filter(q => q.id !== quizId));
    } catch (err) {
      alert(err.response?.data?.error || 'Could not delete quiz');
    }
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
        <img src="/logo.png" alt="Neuron" className="logo" />
        {user ? (
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 14 }}>
            <span>Hi, {user.name.split(' ')[0]}</span>
            <Link to={`/progress/${user.id}`}>My Progress</Link>
            <Link to="/create">+ New Quiz</Link>
            <button onClick={handleLogout} style={{ background: '#ece4d4', color: '#1a1a1a', padding: '8px 16px' }}>Log out</button>
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
          <Link to="/register"><button className="btn-accent">Start practicing free</button></Link>
        </div>
      )}

      <h2 style={{ fontSize: 20 }}>Available Courses</h2>
      {error && <p style={{ color: '#c0392b' }}>{error}</p>}
      {quizzes.length === 0 && !error && <p style={{ color: '#8a8378' }}>No quizzes yet.</p>}

      {Object.entries(grouped).map(([code, group]) => (
        <div key={code} style={{ marginBottom: 28 }}>
          <h3 style={{ marginBottom: 4 }}>{code}</h3>
          <p style={{ margin: '0 0 12px', color: '#8a8378', fontSize: 14 }}>{group.name}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {group.quizzes.map(q => (
              <div key={q.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <strong style={{ fontSize: 17 }}>{q.title}</strong>
                  <span className={`badge ${q.mode === 'practice' ? 'badge-practice' : 'badge-focused'}`}>
                    {q.mode === 'practice' ? 'Practice' : 'Focused'}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#8a8378', margin: '6px 0 12px' }}>
                  {q.time_limit_seconds ? `⏱ ${q.time_limit_seconds}s` : 'Untimed'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Link to={`/quiz/${q.id}`}>Take this quiz →</Link>
                  {user && q.created_by === user.id && (
                    <button
                      onClick={() => handleDelete(q.id)}
                      style={{ background: '#fdeeee', color: '#c62828', padding: '4px 10px', fontSize: 12, marginLeft: 12 }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default QuizList;