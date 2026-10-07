const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { analyzeSentiment } = require('../sentiment');

function normalizeSentiment(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const lower = value.trim().toLowerCase();
  if (lower === 'positive' || lower === 'neutral' || lower === 'negative') {
    return lower;
  }

  return null;
}

function increment(map, key, amount = 1) {
  map[key] = (map[key] || 0) + amount;
}

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT id, text, rating, sentiment, created_at FROM feedback ORDER BY created_at DESC, id DESC');

    const sentimentDistribution = {
      positive: 0,
      neutral: 0,
      negative: 0
    };
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };
    const tagCounts = {};

    let ratingTotal = 0;

    for (const row of rows) {
      const analysis = analyzeSentiment(row.text || '');
      const normalizedSentiment = normalizeSentiment(row.sentiment);
      const sentiment = normalizedSentiment || analysis.sentiment.toLowerCase();
      if (sentimentDistribution[sentiment] !== undefined) {
        sentimentDistribution[sentiment] += 1;
      }

      const rating = Number(row.rating);
      if (Number.isInteger(rating) && ratingDistribution[rating] !== undefined) {
        ratingDistribution[rating] += 1;
        ratingTotal += rating;
      }

      for (const tag of analysis.tags) {
        increment(tagCounts, tag);
      }
    }

    const totalFeedback = rows.length;
    const averageRating = totalFeedback > 0 ? Number((ratingTotal / totalFeedback).toFixed(2)) : 0;
    const positivePercentage = totalFeedback > 0 ? Number(((sentimentDistribution.positive / totalFeedback) * 100).toFixed(2)) : 0;
    const neutralPercentage = totalFeedback > 0 ? Number(((sentimentDistribution.neutral / totalFeedback) * 100).toFixed(2)) : 0;
    const negativePercentage = totalFeedback > 0 ? Number(((sentimentDistribution.negative / totalFeedback) * 100).toFixed(2)) : 0;

    res.json({
      totalFeedback,
      averageRating,
      sentimentDistribution,
      sentimentPercentages: {
        positive: positivePercentage,
        neutral: neutralPercentage,
        negative: negativePercentage
      },
      ratingDistribution,
      tagCounts
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

