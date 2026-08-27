// Rule-based sentiment analysis engine
const positiveWords = ['good', 'great', 'excellent', 'awesome', 'fantastic', 'love', 'like', 'happy', 'pleased', 'satisfied', 'amazing', 'wonderful', 'best', 'better', 'perfect', 'positive', 'recommend'];
const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'unhappy', 'disappointed', 'poor', 'worst', 'worse', 'negative', 'angry', 'frustrated', 'annoyed', 'issue', 'problem', 'bug'];

// Tag extraction keywords
const tagKeywords = {
  UI: ['ui', 'interface', 'design', 'layout', 'button', 'menu', 'screen'],
  Performance: ['performance', 'speed', 'slow', 'fast', 'lag', 'loading', 'responsive'],
  Pricing: ['price', 'cost', 'expensive', 'cheap', 'pricing', 'fee', 'charge', 'value'],
  Feature: ['feature', 'functionality', 'option', 'capability', 'tool'],
  Bug: ['bug', 'error', 'crash', 'glitch', 'fix', 'issue', 'problem'],
  Support: ['support', 'help', 'service', 'assistance', 'response']
};

/**
 * Analyze sentiment of text
 * @param {string} text - Feedback text to analyze
 * @returns {Object} { sentiment: string, confidence: number, tags: string[] }
 */
function analyzeSentiment(text) {
  if (!text || typeof text !== 'string') {
    return { sentiment: 'Neutral', confidence: 0, tags: [] };
  }

  const lowerText = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;

  // Count positive and negative words
  positiveWords.forEach(word => {
    const matches = lowerText.match(new RegExp(`\\b${word}\\b`, 'g'));
    positiveCount += matches ? matches.length : 0;
  });

  negativeWords.forEach(word => {
    const matches = lowerText.match(new RegExp(`\\b${word}\\b`, 'g'));
    negativeCount += matches ? matches.length : 0;
  });

  // Determine sentiment
  let sentiment;
  if (positiveCount > negativeCount) {
    sentiment = 'Positive';
  } else if (negativeCount > positiveCount) {
    sentiment = 'Negative';
  } else {
    sentiment = 'Neutral';
  }

  // Calculate confidence (0-100)
  const total = positiveCount + negativeCount;
  let confidence = 0;
  if (total > 0) {
    confidence = Math.abs(positiveCount - negativeCount) / total * 100;
  }
  // Ensure confidence is between 0 and 100
  confidence = Math.max(0, Math.min(100, confidence));

  // Extract tags
  const tags = [];
  Object.entries(tagKeywords).forEach(([tag, keywords]) => {
    const found = keywords.some(keyword => lowerText.includes(keyword));
    if (found) {
      tags.push(tag);
    }
  });

  return {
    sentiment,
    confidence: Math.round(confidence * 10) / 10, // Round to 1 decimal place
    tags
  };
}

module.exports = { analyzeSentiment };