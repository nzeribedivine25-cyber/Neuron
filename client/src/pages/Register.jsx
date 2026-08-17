import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: 380, margin: '80px auto', padding: '0 16px' }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>🧠 Create your Neuron account</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 14, fontWeight: 600 }}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', padding: 10, marginTop: 4 }}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 14, fontWeight: 600 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: 10, marginTop: 4 }}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 14, fontWeight: 600 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: 10, marginTop: 4 }}
            />
          </div>
          {error && <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>}
          <button type="submit" style={{ width: '100%' }}>Register</button>
        </form>
        <p style={{ fontSize: 14, marginTop: 16, marginBottom: 0 }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;