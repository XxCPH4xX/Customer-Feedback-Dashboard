# Customer Feedback Dashboard

A small Express app for collecting feedback and showing ratings and sentiment charts. Sentiment comes from keyword matching; it does not call an AI service.

## Run locally

You need Node.js 22 and a PostgreSQL database.

```sh
cd server
npm ci
cp .env.example .env
# Set DATABASE_URL in .env to your PostgreSQL connection string.
npm start
```

Open http://localhost:3000. The app creates its feedback table on the first API request. Database credentials stay on the server.

## Deploy on Vercel

1. Import this repository and set **Root Directory** to `server` and **Framework Preset** to `Express`. Leave build and output directory overrides off.
2. Connect a PostgreSQL database, such as Neon, to the project. Set `DATABASE_URL` (or `POSTGRES_URL`) for Production using the provider's pooled connection string and SSL settings. Use a separate database for previews.
3. Deploy. If you add or change an environment variable afterward, redeploy so the function receives it.
4. Check `/api/health`; it returns `{"status":"ok"}` only when the database is reachable and the schema is ready.

Vercel serves `server/public` as static files. The frontend uses `/api`, so the same files work locally and on the deployed domain. Pushes to the connected production branch trigger a new deployment.

The old version wrote to `server/feedback.db`. Vercel cannot keep that SQLite file between function instances. This version uses PostgreSQL; it does not import existing SQLite records automatically. Keep a backup of any old database if you have feedback to migrate.

## Tests

```sh
cd server
npm test
TEST_DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/feedback_test npm test
```

The first command checks startup and failure handling without a database. The second also checks submission, validation, analytics and persistence against PostgreSQL. Use a dedicated test database: the integration test clears its feedback table.
