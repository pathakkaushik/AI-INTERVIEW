const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for a given user ID.
 * @param {string} userId - The user's MongoDB _id
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

/**
 * Calculate a percentile string based on a numeric score.
 * @param {number} score - Score between 0 and 100
 * @returns {string} Human-readable percentile label
 */
const calculatePercentile = (score) => {
  if (score >= 90) return 'Top 5% of Candidates';
  if (score >= 80) return 'Top 10% of Candidates';
  if (score >= 70) return 'Top 25% of Candidates';
  if (score >= 60) return 'Top 40% of Candidates';
  if (score >= 50) return 'Top 50% of Candidates';
  if (score >= 40) return 'Top 65% of Candidates';
  if (score >= 30) return 'Top 75% of Candidates';
  return 'Top 90% of Candidates';
};

/**
 * Format a duration in seconds to a human-readable string.
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (e.g. '45m' or '1h 30m')
 */
const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}m`;
};

module.exports = {
  generateToken,
  calculatePercentile,
  formatDuration
};
