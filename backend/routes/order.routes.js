const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');

// All Order routes require authenticated session
router.use(protect);

// POST /orders/create-payment-order (Step 7: Validate cart, create ShopKart order & Razorpay order)
router.post('/create-payment-order', createPaymentOrder);

// POST /orders/verify-payment (Step 11: Verify HMAC signature, mark PAID, clear cart)
router.post('/verify-payment', verifyPayment);

// GET /orders (Task 7: Get authenticated user's orders)
router.get('/', getMyOrders);

// GET /orders/:id (Task 8: Get single order by ID)
router.get('/:id', getOrderById);

// PATCH /orders/:id/status (Bonus Challenge: Order status progression)
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
