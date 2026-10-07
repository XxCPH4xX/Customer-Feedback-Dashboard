const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const app = require('../server');
const { closeDb, query } = require('../db');

async function serve(t) {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await closeDb();
  });
  return `http://127.0.0.1:${server.address().port}`;
}

function post(url, body) {
  return fetch(`${url}/api/feedback`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
}

test('static pages load without storage; API failures are explicit and recoverable', async (t) => {
  delete process.env.DATABASE_URL;
  delete process.env.POSTGRES_URL;
  const url = await serve(t);
  const page = await fetch(url);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Customer Feedback Dashboard/);
  const script = await fetch(`${url}/app.js`);
  assert.equal(script.status, 200);
  assert.match(await script.text(), /const API_BASE = '\/api'/);
  assert.equal((await fetch(`${url}/style.css`)).status, 200);
  for (const path of ['health', 'feedback', 'analytics']) {
    const response = await fetch(`${url}/api/${path}`);
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), { error: 'Feedback storage is unavailable. Please try again later.' });
  }
  const malformed = await fetch(`${url}/api/feedback`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(malformed.status, 400);
  const oversized = await post(url, { text: 'x'.repeat(40000), rating: 5 });
  assert.equal(oversized.status, 413);
  process.env.DATABASE_URL = 'postgresql://test:do_not_expose@127.0.0.1:1/unavailable';
  const unavailable = await fetch(`${url}/api/health`);
  assert.equal(unavailable.status, 503);
  assert.doesNotMatch(await unavailable.text(), /do_not_expose/);
});

test('PostgreSQL submissions, analytics and persistence', { skip: !process.env.TEST_DATABASE_URL }, async (t) => {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  // This must be a separate database. Require an explicit test name before clearing data.
  assert.match(new URL(process.env.TEST_DATABASE_URL).pathname, /test/i);
  const url = await serve(t);
  const initial = await Promise.all(Array.from({ length: 8 }, () => fetch(`${url}/api/health`)));
  assert.ok(initial.every((response) => response.status === 200));
  await query('TRUNCATE feedback RESTART IDENTITY');
  assert.deepEqual(await (await fetch(`${url}/api/feedback`)).json(), []);
  for (const body of [{text:'',rating:5},{text:'  ',rating:2},{text:1,rating:3},{text:'x',rating:0},{text:'x',rating:6},{text:'x',rating:2.5},{text:'x',rating:true},{text:'x',rating:[]},{text:'x'.repeat(5001),rating:4}]) {
    assert.equal((await post(url, body)).status, 400);
  }
  const feedback = [
    { text: "Great service! It's excellent.", rating: 5 },
    { text: 'Terrible and slow', rating: 1 },
    { text: "Ordinary'); DROP TABLE feedback; --", rating: 3 }
  ];
  for (const item of feedback) {
    const response = await post(url, item);
    assert.equal(response.status, 201);
    const saved = await response.json();
    assert.equal(saved.text, item.text);
    assert.equal(saved.rating, item.rating);
    assert.ok(Number.isInteger(saved.id));
    assert.ok(!Number.isNaN(Date.parse(saved.created_at)));
  }
  const analytics = await (await fetch(`${url}/api/analytics`)).json();
  assert.equal(analytics.totalFeedback, 3);
  assert.equal(analytics.averageRating, 3);
  assert.deepEqual(analytics.sentimentDistribution, {positive:1, neutral:1, negative:1});
  assert.deepEqual(analytics.ratingDistribution, {1:1,2:0,3:1,4:0,5:1});
  await closeDb();
  const persisted = await (await fetch(`${url}/api/feedback`)).json();
  assert.equal(persisted.length, 3);
  assert.equal(persisted[0].text, feedback[2].text);
  await query('TRUNCATE feedback RESTART IDENTITY');
});
