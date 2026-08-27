const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'feedback.db');

let db;

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
}

function initDb() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        return reject(err);
      }

      const schema = `
        CREATE TABLE IF NOT EXISTS feedback (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text TEXT NOT NULL,
          rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
          sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `;

      const indexCreated = `CREATE INDEX IF NOT EXISTS idx_created_at ON feedback(created_at);`;
      const indexSentiment = `CREATE INDEX IF NOT EXISTS idx_sentiment ON feedback(sentiment);`;

      db.run(schema, (err) => {
        if (err) {
          console.error('Error creating table:', err.message);
          return reject(err);
        }

        db.run(indexCreated, (err) => {
          if (err) {
            console.error('Error creating idx_created_at:', err.message);
            return reject(err);
          }

          db.run(indexSentiment, (err) => {
            if (err) {
              console.error('Error creating idx_sentiment:', err.message);
              return reject(err);
            }

            console.log('Database initialized successfully');
            resolve(db);
          });
        });
      });
    });
  });
}

function closeDb() {
  return new Promise((resolve, reject) => {
    if (!db) return resolve();
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
        return reject(err);
      }
      db = null;
      resolve();
    });
  });
}

module.exports = { initDb, getDb, closeDb };
