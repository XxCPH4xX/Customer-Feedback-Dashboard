const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { analyzeSentiment } = require('../sentiment');

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM feedback ORDER BY created_at DESC, id DESC');
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const { text, rating } = req.body || {};
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text is required and must be a non-empty string' });
  }
  if (text.trim().length > 5000) {
    return res.status(400).json({ error: 'Feedback must be 5000 characters or fewer' });
  }
  const ratingNum = Number(rating);
  if (!['number', 'string'].includes(typeof rating) || !Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
  }
  try {
    const sentiment = analyzeSentiment(text.trim()).sentiment.toLowerCase();
    const { rows } = await query(
      'INSERT INTO feedback (text, rating, sentiment) VALUES ($1, $2, $3) RETURNING *',
      [text.trim(), ratingNum, sentiment]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
