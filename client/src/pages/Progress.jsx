import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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

  if (error) return <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 16px' }}><p style={{ color: '#dc2626' }}>{error}</p></div>;
  if (!data) return <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 16px' }}><p>Loading...</p></div>;

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 16px' }}>
      <Link to="/">← Back to quizzes</Link>
      <h2>Your Progress</h2>
      <div className="card" style={{ display: 'flex', gap: 24, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>Completed</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{data.summary.completed_attempts}</div>
        </div>
        <div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>Accuracy</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>
            {data.summary.overall_accuracy !== null ? `${data.summary.overall_accuracy}%` : 'N/A'}
          </div>
        </div>
      </div>

      <h3>Attempt History</h3>
      {data.attempts.length === 0 && <p style={{ color: '#6b7280' }}>No attempts yet.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.attempts.map(a => (
          <div key={a.attempt_id} className="card">
            <strong>{a.title}</strong> {a.topic && <span style={{ color: '#6b7280' }}>({a.topic})</span>}
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
              {a.mode} · {a.completed_at ? `Score: ${a.score}/${a.total_points}` : 'In progress'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Progress;