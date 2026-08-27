# Customer Feedback Dashboard - Project Blueprint

## API Endpoints

### POST /api/feedback
Submit new feedback for sentiment analysis

**Request Format:**
```json
{
  "text": "string (required, minlength 1)",
  "rating": "integer (required, 1-5)"
}
```

**Response Format (Success):**
```json
{
  "id": "integer",
  "text": "string",
  "rating": "integer",
  "sentiment": "string (positive|neutral|negative)",
  "created_at": "ISO 8601 timestamp"
}
```

**Response Format (Error):**
```json
{
  "error": "string (description of validation error)"
}
```

### GET /api/feedback
Retrieve all feedback items

**Response Format:**
```json
[
  {
    "id": "integer",
    "text": "string",
    "rating": "integer",
    "sentiment": "string (positive|neutral|negative)",
    "created_at": "ISO 8601 timestamp"
  }
]
```

### GET /api/analytics
Get aggregated analytics data

**Response Format:**
```json
{
  "totalFeedback": "integer",
  "averageRating": "number (float with 2 decimal places)",
  "sentimentDistribution": {
    "positive": "integer",
    "neutral": "integer",
    "negative": "integer"
  },
  "ratingDistribution": {
    "1": "integer",
    "2": "integer",
    "3": "integer",
    "4": "integer",
    "5": "integer"
  }
}
```

## Database Schema

SQLite database `feedback.db` with table `feedback`:

```sql
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Indexes:
- `CREATE INDEX idx_created_at ON feedback(created_at);`
- `CREATE INDEX idx_sentiment ON feedback(sentiment);`

## Frontend Specifications

### Required DOM IDs

**Form Elements:**
- `feedback-form`: form element for submitting feedback
- `feedback-text`: textarea for feedback input
- `feedback-rating`: select element for rating (1-5)
- `feedback-submit`: button to submit feedback
- `feedback-list`: container div for displaying feedback items
- `stats-container`: div containing summary statistics
  - `total-feedback`: span for total feedback count
  - `average-rating`: span for average rating (to 2 decimal places)

**Chart Containers:**
- `rating-chart`: canvas for rating distribution bar chart
- `sentiment-chart`: canvas for sentiment distribution pie chart

### Chart Specifications (using Chart.js v3+)

**Rating Distribution Bar Chart:**
- Type: `bar`
- Data:
  - Labels: `['1', '2', '3', '4', '5']`
  - Dataset: 
    - Label: 'Number of Feedback'
    - Data: `[count1, count2, count3, count4, count5]` (from analytics.ratingDistribution)
    - BackgroundColor: 'rgba(54, 162, 235, 0.5)'
    - BorderColor: 'rgba(54, 162, 235, 1)'
    - BorderWidth: 1
- Options:
  - Responsive: true
  - Plugins:
    - Title: 
      - Display: true
      - Text: 'Feedback Rating Distribution'
  - Scales:
    - Y:
      - BeginAtZero: true
      - Ticks: 
        - Precision: 0

**Sentiment Distribution Pie Chart:**
- Type: `doughnut`
- Data:
  - Labels: `['Positive', 'Neutral', 'Negative']`
  - Dataset:
    - Data: `[positiveCount, neutralCount, negativeCount]` (from analytics.sentimentDistribution)
    - BackgroundColor: 
      - 'rgba(75, 192, 192, 0.5)' (positive)
      - 'rgba(255, 206, 86, 0.5)' (neutral)
      - 'rgba(255, 99, 132, 0.5)' (negative)
    - BorderColor:
      - 'rgba(75, 192, 192, 1)'
      - 'rgba(255, 206, 86, 1)'
      - 'rgba(255, 99, 132, 1)'
    - BorderWidth: 1
- Options:
  - Responsive: true
  - Plugins:
    - Title:
      - Display: true
      - Text: 'Feedback Sentiment Distribution'

### AI Features
- Sentiment analysis performed on backend using natural language processing
- Rating validation (1-5 scale)
- Automatic timestamp generation
- Real-time updates via polling (every 5 seconds) or WebSockets (future enhancement)

## Module Instructions

### Module 1: Backend Setup & API Endpoints
1. Initialize Node.js project in `/server` with `npm init -y`
2. Install dependencies: express, sqlite3, cors
3. Create `server.js` with Express server setup
4. Implement SQLite database connection in `db.js`
5. Create `/routes/feedback.js` for POST/GET /api/feedback endpoints
6. Create `/routes/analytics.js` for GET /api/analytics endpoint
7. Implement sentiment analysis function (placeholder: simple keyword-based)
8. Add CORS middleware and JSON body parsing
9. Test endpoints with REST client or curl
10. Ensure proper error handling and validation

### Module 2: Frontend Dashboard
1. Create `client/index.html` with required DOM structure
2. Add Chart.js library via CDN in HTML head
3. Create `client/style.css` for basic layout and responsiveness
4. Implement `client/script.js` with:
   - Form submission handler (POST to /api/feedback)
   - Feedback display renderer
   - Statistics updater from /api/analytics
   - Chart initialization and update functions
   - Periodic data refresh (every 5 seconds)
5. Ensure responsive design for mobile/desktop
6. Add loading states and error handling

### Module 3: Integration & Deployment
1. Serve frontend static files from Express backend (optional)
2. Configure CORS for development frontend-backend communication
3. Add production-ready error logging
4. Implement basic sentiment analysis improvement (optional: integrate external API)
5. Create startup scripts for development and production
6. Document API usage and database backup procedures
7. Perform end-to-end testing of feedback submission and display
8. Prepare deployment instructions for various platforms (Heroku, Vercel, etc.)