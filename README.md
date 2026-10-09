# Customer Feedback Dashboard

An Express app for collecting feedback and ratings, storing them in PostgreSQL, and displaying charts with Chart.js. Sentiment classification uses keyword matching.

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

### SQLite migration

Existing records in `server/feedback.db` need a separate import into PostgreSQL. Back up the SQLite file before migrating. Vercel functions cannot retain a local SQLite database between instances.

## Tests

```sh
cd server
npm test
TEST_DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/feedback_test npm test
```

The first command checks startup and failure handling without a database. The second also checks submission, validation, analytics and persistence against PostgreSQL. Use a dedicated test database: the integration test clears its feedback table.
