const API_BASE = 'http://localhost:3000/api';

let ratingChart = null;
let sentimentChart = null;

// --- DOM refs ---
const form = document.getElementById('feedback-form');
const textarea = document.getElementById('feedback-text');
const ratingSelect = document.getElementById('feedback-rating');
const submitBtn = document.getElementById('feedback-submit');
const formStatus = document.getElementById('form-status');
const feedbackList = document.getElementById('feedback-list');
const totalFeedback = document.getElementById('total-feedback');
const averageRating = document.getElementById('average-rating');

// --- Fetch helpers ---
async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed (${res.status})`);
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `POST ${path} failed`);
  return data;
}

// --- Form submission ---
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formStatus.textContent = '';
  formStatus.className = 'form-status';

  const text = textarea.value.trim();
  const rating = ratingSelect.value;
  if (!text || !rating) {
    formStatus.textContent = 'Please fill in all fields.';
    formStatus.className = 'form-status error';
    return;
  }

  submitBtn.disabled = true;
  try {
    await apiPost('/feedback', { text, rating: Number(rating) });
    formStatus.textContent = 'Feedback submitted!';
    formStatus.className = 'form-status success';
    textarea.value = '';
    ratingSelect.value = '';
    loadFeedback();
    loadAnalytics();
  } catch (err) {
    formStatus.textContent = err.message;
    formStatus.className = 'form-status error';
  } finally {
    submitBtn.disabled = false;
  }
});

// --- Render feedback list ---
function renderFeedbackList(items) {
  if (!items.length) {
    feedbackList.innerHTML = '<div class="empty-state">No feedback yet. Be the first!</div>';
    return;
  }
  feedbackList.innerHTML = items.map((fb) => {
    const stars = '\u2605'.repeat(fb.rating) + '\u2606'.repeat(5 - fb.rating);
    const date = new Date(fb.created_at).toLocaleString();
    return `
      <div class="feedback-item">
        <div class="feedback-item-body">
          <div class="feedback-item-text">${escapeHtml(fb.text)}</div>
          <div class="feedback-item-meta">${date}</div>
        </div>
        <div class="feedback-item-right">
          <span class="sentiment-badge ${fb.sentiment}">${fb.sentiment}</span>
          <span class="rating-stars">${stars}</span>
        </div>
      </div>`;
  }).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// --- Load feedback ---
async function loadFeedback() {
  try {
    const items = await apiGet('/feedback');
    renderFeedbackList(items);
  } catch {
    feedbackList.innerHTML = '<div class="empty-state">Could not load feedback.</div>';
  }
}

// --- Load analytics & render stats + charts ---
async function loadAnalytics() {
  try {
    const data = await apiGet('/analytics');

    totalFeedback.textContent = data.totalFeedback;
    averageRating.textContent = data.averageRating.toFixed(2);

    updateRatingChart(data.ratingDistribution);
    updateSentimentChart(data.sentimentDistribution);
  } catch {
    // Analytics endpoint may not exist yet; show defaults
    totalFeedback.textContent = '0';
    averageRating.textContent = '0.00';
  }
}

// --- Rating bar chart ---
function updateRatingChart(dist) {
  const labels = ['1', '2', '3', '4', '5'];
  const values = labels.map((k) => dist[k] || 0);

  if (ratingChart) {
    ratingChart.data.datasets[0].data = values;
    ratingChart.update();
    return;
  }

  const ctx = document.getElementById('rating-chart').getContext('2d');
  ratingChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Number of Feedback',
        data: values,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Feedback Rating Distribution', color: '#e4e6f0' },
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0, color: '#9195a9' },
          grid: { color: '#2e3143' },
        },
        x: {
          ticks: { color: '#9195a9' },
          grid: { color: '#2e3143' },
        },
      },
    },
  });
}

// --- Sentiment doughnut chart ---
function updateSentimentChart(dist) {
  const values = [dist.positive || 0, dist.neutral || 0, dist.negative || 0];

  if (sentimentChart) {
    sentimentChart.data.datasets[0].data = values;
    sentimentChart.update();
    return;
  }

  const ctx = document.getElementById('sentiment-chart').getContext('2d');
  sentimentChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Positive', 'Neutral', 'Negative'],
      datasets: [{
        data: values,
        backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(255, 206, 86, 0.5)', 'rgba(255, 99, 132, 0.5)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Feedback Sentiment Distribution', color: '#e4e6f0' },
        legend: { labels: { color: '#e4e6f0' } },
      },
    },
  });
}

// --- Initial load + polling ---
loadFeedback();
loadAnalytics();
setInterval(() => {
  loadFeedback();
  loadAnalytics();
}, 5000);
