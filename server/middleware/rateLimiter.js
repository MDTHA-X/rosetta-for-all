// server/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// Authentication Rate Limiter: 10 requests per 3 minutes
const authRateLimiter = rateLimit({
  windowMs: 3 * 60 * 1000, // 3 minutes in milliseconds
  max: 10, // Limit each IP to 10 requests per windowMs
  standardHeaders: true, // Return standard `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      error: 'Too many requests',
      message: 'Too many authentication attempts. Rate limit is 10 requests per 3 minutes. Please try again later.',
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
    });
  },
});

module.exports = {
  authRateLimiter,
};
