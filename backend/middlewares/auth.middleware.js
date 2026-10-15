const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const { fallbackCustomers } = require('../controllers/customer.controller');

/**
 * Middleware to protect routes that require customer authentication.
 * Reads JWT from HttpOnly cookie and verifies the customer in MongoDB.
 */
const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // Also support Authorization: Bearer <token> header for API/Postman tests
    if (!token && req.headers?.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided',
      });
    }

    // Verify token validity and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');

    let customer = null;
    if (mongoose.connection.readyState === 1) {
      customer = await Customer.findById(decoded.id).select('-password');
    } else {
      const match = fallbackCustomers.find(
        (c) => c._id === decoded.id || c._id?.toString() === decoded.id?.toString()
      );
      if (match) {
        customer = {
          _id: match._id,
          fullName: match.fullName,
          email: match.email,
          phone: match.phone,
        };
      }
    }

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Customer not found',
      });
    }

    // Attach authenticated customer to request
    req.user = customer;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired token',
    });
  }
};

module.exports = { protect };
