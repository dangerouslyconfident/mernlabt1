const express = require('express');
const router = express.Router();
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
} = require('../controllers/wishlist.controller');
const { protect } = require('../middlewares/auth.middleware');

// All Wishlist endpoints require customer authentication
router.use(protect);

// GET /wishlist - Get currently authenticated customer's populated wishlist
router.get('/', getWishlist);

// POST /wishlist/:productId - Add a product reference to the wishlist
router.post('/:productId', addToWishlist);

// DELETE /wishlist/:productId - Remove a product reference from the wishlist
router.delete('/:productId', removeFromWishlist);

// PATCH /wishlist/:productId/toggle - Bonus challenge: Toggle product in wishlist
router.patch('/:productId/toggle', toggleWishlist);

module.exports = router;
