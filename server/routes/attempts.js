const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/:quizId/attempts', async (req, res) => {
  const { quizId } = req.params;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  try {
    const quizResult = await pool.query('SELECT * FROM quizzes WHERE id = $1', [quizId]);
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    const quiz = quizResult.rows[0];

    if (quiz.mode === 'focused') {
      const existing = await pool.query(
        'SELECT id FROM attempts WHERE quiz_id = $1 AND user_id = $2 AND completed_at IS NOT NULL',
        [quizId, user_id]
      );
      if (existing.rows.length > 0) {
        return res.status(403).json({ error: 'This is a focused quiz — you have already completed your one attempt' });
      }
    }

    const attemptResult = await pool.query(
      'INSERT INTO attempts (user_id, quiz_id, started_at) VALUES ($1, $2, NOW()) RETURNING id, started_at',
      [user_id, quizId]
    );

    res.status(201).json({ attempt_id: attemptResult.rows[0].id, started_at: attemptResult.rows[0].started_at, time_limit_seconds: quiz.time_limit_seconds });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/attempt/:id', async (req, res) => {
  const { id } = req.params;
  const { answers } = req.body;

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'answers array is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const attemptResult = await client.query('SELECT * FROM attempts WHERE id = $1', [id]);
    if (attemptResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Attempt not found' });
    }
    const attempt = attemptResult.rows[0];
    if (attempt.completed_at) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'This attempt has already been submitted' });
    }

    let score = 0;
    let totalPoints = 0;
    const breakdown = [];

    for (const ans of answers) {
      const qResult = await client.query('SELECT * FROM questions WHERE id = $1', [ans.question_id]);
      if (qResult.rows.length === 0) continue;
      const question = qResult.rows[0];
      totalPoints += question.points;

      const normalize = (s) => (s || '').toString().trim().toLowerCase();
      const isCorrect = normalize(ans.user_answer) === normalize(question.correct_answer);
      if (isCorrect) score += question.points;

      await client.query(
        'INSERT INTO answers (attempt_id, question_id, user_answer, is_correct) VALUES ($1,$2,$3,$4)',
        [id, ans.question_id, ans.user_answer, isCorrect]
      );

      breakdown.push({
        question_id: question.id,
        question_text: question.question_text,
        user_answer: ans.user_answer,
        correct_answer: question.correct_answer,
        is_correct: isCorrect,
        explanation: question.explanation
      });
    }

    await client.query(
      'UPDATE attempts SET score = $1, total_points = $2, completed_at = NOW() WHERE id = $3',
      [score, totalPoints, id]
    );

    await client.query('COMMIT');
    res.json({ attempt_id: id, score, total_points: totalPoints, breakdown });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;