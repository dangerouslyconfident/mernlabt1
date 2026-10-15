const express = require('express');
const router = express.Router();
const {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart,
} = require('../controllers/cart.controller');
const { protect } = require('../middlewares/auth.middleware');

// All Cart routes require user authentication
router.use(protect);

// GET /cart - Get current user's populated cart
router.get('/', getCart);

// POST /cart/:productId - Add product to cart (or increment quantity)
router.post('/:productId', addToCart);

// PATCH /cart/:productId - Update product quantity (with stock bounds check)
router.patch('/:productId', updateQuantity);

// DELETE /cart/:productId - Remove product from cart
router.delete('/:productId', removeFromCart);

module.exports = router;
