import { useLocation, useParams, Link } from 'react-router-dom';

function Results() {
  const location = useLocation();
  const data = location.state;

  if (!data) {
    return (
      <div style={{ maxWidth: 420, margin: '80px auto', padding: '0 16px', textAlign: 'center' }}>
        <div className="card">
          <p>No result data available — this page only works right after submitting a quiz.</p>
          <Link to="/">Back to quizzes</Link>
        </div>
      </div>
    );
  }

  const percent = data.total_points > 0 ? Math.round((data.score / data.total_points) * 100) : 0;

  return (
    <div style={{ maxWidth: 420, margin: '80px auto', padding: '0 16px', textAlign: 'center' }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Quiz Complete</h2>
        <p style={{ fontSize: 56, margin: '10px 0', color: '#4f46e5', fontWeight: 800 }}>{percent}%</p>
        <p style={{ color: '#6b7280' }}>Score: {data.score} / {data.total_points}</p>
        <Link to="/">Back to quizzes</Link>
      </div>
    </div>
  );
}

export default Results;