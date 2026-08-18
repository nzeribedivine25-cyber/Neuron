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
  const wrongAnswers = (data.breakdown || []).filter(b => !b.is_correct);

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>
      <div className="card" style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 40 }}>{emoji}</div>
        <h2 style={{ margin: '8px 0 0' }}>Quiz Complete</h2>
        <p style={{ fontSize: 56, margin: '10px 0', color: '#e8622c', fontWeight: 800 }}>{percent}%</p>
        <p style={{ color: '#8a8378' }}>Score: {data.score} / {data.total_points}</p>
        <Link to="/"><button style={{ marginTop: 8 }}>Back to quizzes</button></Link>
      </div>

      {wrongAnswers.length > 0 && (
        <div>
          <h3>Review your mistakes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {wrongAnswers.map(b => (
              <div key={b.question_id} className="card">
                <p style={{ marginTop: 0, fontWeight: 600 }}>{b.question_text}</p>
                <p style={{ margin: '4px 0', fontSize: 14, color: '#c0392b' }}>Your answer: {b.user_answer || '(blank)'}</p>
                <p style={{ margin: '4px 0', fontSize: 14, color: '#1a7f37' }}>Correct answer: {b.correct_answer}</p>
                {b.explanation && (
                  <p style={{ margin: '8px 0 0', fontSize: 14, color: '#6b6357', paddingTop: 8, borderTop: '1px solid #ece4d4' }}>
                    💡 {b.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Results;