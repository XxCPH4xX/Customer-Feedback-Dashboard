const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const { analyzeSentiment } = require('../sentiment');

router.get('/', (req, res) => {
  const db = getDb();
  db.all('SELECT * FROM feedback ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching feedback:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve feedback' });
    }
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { text, rating } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Text is required and must be a non-empty string' });
  }

  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
  }

  const analysis = analyzeSentiment(text.trim());
  const sentiment = analysis.sentiment.toLowerCase();
  const db = getDb();

  const sql = 'INSERT INTO feedback (text, rating, sentiment) VALUES (?, ?, ?)';
  db.run(sql, [text.trim(), ratingNum, sentiment], function (err) {
    if (err) {
      console.error('Error inserting feedback:', err.message);
      return res.status(500).json({ error: 'Failed to save feedback' });
    }

    db.get('SELECT * FROM feedback WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        console.error('Error retrieving inserted feedback:', err.message);
        return res.status(500).json({ error: 'Feedback saved but failed to retrieve' });
      }
      res.status(201).json(row);
    });
  });
});

module.exports = router;
