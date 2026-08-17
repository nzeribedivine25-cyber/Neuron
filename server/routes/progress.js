const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/users/:id/progress
router.get('/:id/progress', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT a.id AS attempt_id, a.quiz_id, q.title, q.topic, q.mode,
              a.score, a.total_points, a.started_at, a.completed_at
       FROM attempts a
       JOIN quizzes q ON a.quiz_id = q.id
       WHERE a.user_id = $1
       ORDER BY a.started_at DESC`,
      [id]
    );

    const completed = result.rows.filter(r => r.completed_at);
    const totalScore = completed.reduce((sum, r) => sum + (r.score || 0), 0);
    const totalPossible = completed.reduce((sum, r) => sum + (r.total_points || 0), 0);

    res.json({
      user_id: id,
      attempts: result.rows,
      summary: {
        completed_attempts: completed.length,
        overall_accuracy: totalPossible > 0 ? +(totalScore / totalPossible * 100).toFixed(1) : null
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;