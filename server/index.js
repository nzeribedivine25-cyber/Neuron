const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Neuron API is running. Try /api/health for a status check.' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Neuron server running' });
});

const pool = require('./db');

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const quizRoutes = require('./routes/quizzes');
app.use('/api/quizzes', quizRoutes);

const attemptRoutes = require('./routes/attempts');
app.use('/api/quizzes', attemptRoutes);
app.use('/api/attempts', attemptRoutes);

const progressRoutes = require('./routes/progress');
app.use('/api/users', progressRoutes);

app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'db connected', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Neuron server running on port ${PORT}`);
});