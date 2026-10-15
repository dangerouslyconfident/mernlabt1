require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const customerRoutes = require('./routes/customer.routes');
const productRoutes = require('./routes/product.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');

const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    credentials: true, // Allow cookies to be sent across origins
  })
);
app.use(express.json());
app.use(cookieParser());

// Direct root routes matching .md specifications exactly (Lab 01, 02, 03, 04, 05, 06)
app.use('/customers', customerRoutes);
app.use('/auth', customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

// Namespaced /api routes for frontend service & API proxy compatibility
app.use('/api/customers', customerRoutes);
app.use('/api/auth', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoints
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'ShopKart Fullstack API', labs: ['01', '02', '03', '04', '05', '06'] });
});
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'ShopKart Fullstack API', labs: ['01', '02', '03', '04', '05', '06'] });
});

// Production SPA Static Serving & Deep Links (Non-API routes fallback to index.html)
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.use((req, res, next) => {
    const isApiRoute =
      req.path.startsWith('/api') ||
      req.path.startsWith('/customers') ||
      req.path.startsWith('/auth') ||
      req.path.startsWith('/products') ||
      req.path.startsWith('/wishlist') ||
      req.path.startsWith('/cart') ||
      req.path.startsWith('/orders') ||
      req.path.startsWith('/health');

    if (req.method === 'GET' && !isApiRoute) {
      return res.sendFile(path.join(frontendDistPath, 'index.html'));
    }
    next();
  });
}

// 404 Handler for unhandled routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Database Connection & Server Initialization
const startServer = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { dbName: 'shopkart' });
      console.log(' Connected to MongoDB (database: shopkart)');
    } catch (error) {
      console.warn(' MongoDB connection pending or blocked (running in offline fallback mode):', error.message);
    }
  } else {
    console.log(' MONGO_URI is not defined in .env (running in seamless offline fallback mode)');
  }

  app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
  });
};

startServer();
