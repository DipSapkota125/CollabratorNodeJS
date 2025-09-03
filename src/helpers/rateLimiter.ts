import rateLimit from "express-rate-limit";

// General rate limiter (all routes)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

// Specific limiter for sensitive routes (login, register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 requests per IP
  message: "Too many login attempts. Try again after 15 minutes.",
});
