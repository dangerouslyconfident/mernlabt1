const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT for the customer and sets it as an HttpOnly cookie.
 * @param {import('express').Response} res - Express response object
 * @param {string} customerId - MongoDB Customer _id
 * @returns {string} token - The signed JWT token string
 */
const generateToken = (res, customerId) => {
  const token = jwt.sign(
    { id: customerId },
    process.env.JWT_SECRET || 'supersecretkey',
    { expiresIn: '7d' }
  );

  res.cookie('token', token, {
    httpOnly: true, // Prevents client-side XSS attacks from reading the cookie
    secure: process.env.NODE_ENV === 'production', // Send over HTTPS in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
  });

  return token;
};

module.exports = generateToken;
