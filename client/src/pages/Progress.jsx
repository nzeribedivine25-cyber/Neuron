import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../api/client';

function Progress() {
  const { userId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/users/${userId}/progress`)
      .then(res => setData(res.data))
      .catch(() => setError('Could not load progress'));
  }, [userId]);

  if (error) return <div style={{ maxWidth: 640, margin: '60px auto', padding: '0 16px' }}><p style={{ color: '#c0392b' }}>{error}</p></div>;
  if (!data) return <div style={{ maxWidth: 640, margin: '60px auto', padding: '0 16px' }}><p>Loading...</p></div>;

  const completed = data.attempts.filter(a => a.completed_at);
  const chartData = completed.map(a => ({
    name: a.title.length > 18 ? a.title.slice(0, 18) + '…' : a.title,
    accuracy: a.total_points > 0 ? Math.round((a.score / a.total_points) * 100) : 0
  })).reverse();

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px' }}>
      <Link to="/">← Back to quizzes</Link>
      <h2 style={{ marginTop: 12 }}>Your Progress</h2>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#8a8378' }}>Completed Quizzes</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#1a1a1a' }}>{data.summary.completed_attempts}</div>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#8a8378' }}>Overall Accuracy</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#e8622c' }}>
            {data.summary.overall_accuracy !== null ? `${data.summary.overall_accuracy}%` : '—'}
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginTop: 0, fontSize: 16 }}>Accuracy by Attempt</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ece4d4" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="accuracy" fill="#e8622c" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

{Object.entries(
  completed.reduce((acc, a) => {
    const key = a.topic || 'Other';
    if (!acc[key]) acc[key] = { correct: 0, total: 0 };
    acc[key].correct += a.score;
    acc[key].total += a.total_points;
    return acc;
  }, {})
).length > 0 && (
  <div className="card" style={{ marginBottom: 24 }}>
    <h3 style={{ marginTop: 0, fontSize: 16 }}>Accuracy by Course</h3>
    {Object.entries(
      completed.reduce((acc, a) => {
        const key = a.topic || 'Other';
        if (!acc[key]) acc[key] = { correct: 0, total: 0 };
        acc[key].correct += a.score;
        acc[key].total += a.total_points;
        return acc;
      }, {})
    ).map(([course, stats]) => (
      <div key={course} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14 }}>
        <span>{course}</span>
        <span style={{ fontWeight: 700, color: stats.total > 0 && (stats.correct / stats.total) < 0.5 ? '#c0392b' : '#1a7f37' }}>
          {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
        </span>
      </div>
    ))}
  </div>
)}

      <h3>Attempt History</h3>
      {data.attempts.length === 0 && <p style={{ color: '#8a8378' }}>No attempts yet.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.attempts.map(a => (
          <div key={a.attempt_id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{a.title}</strong>
              <span className={`badge ${a.mode === 'practice' ? 'badge-practice' : 'badge-focused'}`}>
                {a.mode}
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#8a8378', marginTop: 4 }}>
              {a.completed_at ? `Score: ${a.score}/${a.total_points}` : 'In progress'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Progress;