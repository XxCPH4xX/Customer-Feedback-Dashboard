const express = require('express');
const path = require('path');
const { query, closeDb } = require('./db');
const feedbackRoutes = require('./routes/feedback');
const analyticsRoutes = require('./routes/analytics');

const app = express();
app.use(express.json({ limit: '32kb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.get('/api/health', async (req, res, next) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});
app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must be valid JSON' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large' });
  }
  console.error('Database request failed:', error.code || 'UNKNOWN');
  res.status(503).json({ error: 'Feedback storage is unavailable. Please try again later.' });
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  const server = app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => server.close(async () => {
      await closeDb();
      process.exit(0);
    }));
  }
}

module.exports = app;
