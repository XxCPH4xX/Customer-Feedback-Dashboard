# Customer Feedback Dashboard

An AI-powered customer feedback dashboard with sentiment analysis, real-time analytics, and interactive charts.

## Features

- **Feedback Submission** - Submit customer feedback with ratings (1-5)
- **Sentiment Analysis** - Automatic sentiment detection (positive/neutral/negative)
- **Analytics Dashboard** - Real-time statistics and charts
- **Rating Distribution** - Bar chart showing feedback ratings
- **Sentiment Distribution** - Doughnut chart showing sentiment breakdown

## Tech Stack

**Backend:**
- Node.js + Express
- SQLite3 database
- CORS middleware

**Frontend:**
- HTML5, CSS3, JavaScript
- Chart.js v4 for data visualization

## Project Structure

```
Customer Feedback Dashboard/
├── client/
│   ├── index.html          # Dashboard UI
│   ├── style.css           # Styles
│   ├── app.js              # Frontend logic
│   └── script.js           # Additional scripts
├── server/
│   ├── server.js           # Express server
│   ├── db.js               # Database setup
│   ├── sentiment.js        # Sentiment analysis
│   ├── package.json        # Dependencies
│   └── routes/
│       ├── feedback.js     # Feedback API routes
│       └── analytics.js    # Analytics API routes
├── PROJECT_BLUEPRINT.md    # Project specification
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd "Customer Feedback Dashboard"

# Install server dependencies
cd server
npm install
```

### Running the App

```bash
# From the server directory
npm start
```

The app will be available at `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/feedback` | Submit new feedback |
| GET | `/api/feedback` | Get all feedback |
| GET | `/api/analytics` | Get analytics data |
| GET | `/api/health` | Health check |

## License

MIT
