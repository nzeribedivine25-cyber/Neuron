const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/courses — list all courses, for dropdowns
router.get('/courses/list', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY code');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quizzes — create a quiz with questions, tied to a course
router.post('/', async (req, res) => {
  const { title, course_id, mode, time_limit_seconds, created_by, questions } = req.body;

  if (!title || !course_id || !mode || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'title, course_id, mode, and at least one question are required' });
  }
  if (!['practice', 'focused'].includes(mode)) {
    return res.status(400).json({ error: "mode must be 'practice' or 'focused'" });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const quizResult = await client.query(
      'INSERT INTO quizzes (title, course_id, mode, time_limit_seconds, created_by) VALUES ($1,$2,$3,$4,$5) RETURNING id',
      [title, course_id, mode, time_limit_seconds || null, created_by || null]
    );
    const quizId = quizResult.rows[0].id;

    for (const q of questions) {
      await client.query(
        'INSERT INTO questions (quiz_id, type, question_text, options, correct_answer, points) VALUES ($1,$2,$3,$4,$5,$6)',
        [quizId, q.type, q.question_text, q.options ? JSON.stringify(q.options) : null, q.correct_answer, q.points || 1]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ id: quizId, title, mode });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET /api/quizzes — list all quizzes, grouped-ready (includes course info)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT q.id, q.title, q.mode, q.time_limit_seconds, q.created_at,
              c.id AS course_id, c.code AS course_code, c.name AS course_name
       FROM quizzes q
       LEFT JOIN courses c ON q.course_id = c.id
       ORDER BY c.code, q.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quizzes/:id — quiz + questions (correct_answer stripped)
router.get('/:id', async (req, res) => {
  try {
    const quizResult = await pool.query(
      `SELECT q.*, c.code AS course_code, c.name AS course_name
       FROM quizzes q LEFT JOIN courses c ON q.course_id = c.id
       WHERE q.id = $1`,
      [req.params.id]
    );
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const questionsResult = await pool.query(
      'SELECT id, type, question_text, options, points FROM questions WHERE quiz_id = $1',
      [req.params.id]
    );

    res.json({ ...quizResult.rows[0], questions: questionsResult.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;