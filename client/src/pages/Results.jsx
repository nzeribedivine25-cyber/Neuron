import { useLocation, Link } from 'react-router-dom';

function Results() {
  const location = useLocation();
  const data = location.state;

  if (!data) {
    return (
      <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
        <div className="card" style={{ maxWidth: 420, textAlign: 'center' }}>
          <p>No result data available — this page only works right after submitting a quiz.</p>
          <Link to="/">Back to quizzes</Link>
        </div>
      </div>
    );
  }

  const percent = data.total_points > 0 ? Math.round((data.score / data.total_points) * 100) : 0;
  const emoji = percent >= 80 ? '🎉' : percent >= 50 ? '👍' : '💪';

  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
      <div className="card" style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>{emoji}</div>
        <h2 style={{ margin: '8px 0 0' }}>Quiz Complete</h2>
        <p style={{ fontSize: 56, margin: '10px 0', color: '#4f46e5', fontWeight: 800 }}>{percent}%</p>
        <p style={{ color: '#6b7280' }}>Score: {data.score} / {data.total_points}</p>
        <Link to="/"><button style={{ marginTop: 8 }}>Back to quizzes</button></Link>
      </div>
    </div>
  );
}

export default Results;