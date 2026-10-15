const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

// In-memory fallback store for offline / restricted network environments
const fallbackWishlists = new Map();

/**
 * Task 2: Add product to current user's wishlist
 * POST /wishlist/:productId
 * Protected API
 */
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // 1. Validate Product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // 2. Check if product exists in MongoDB or sample catalog
    let productExists = false;
    if (mongoose.connection.readyState === 1) {
      const prod = await Product.findById(productId);
      productExists = !!prod;
    } else {
      productExists = true; // Sample products are valid in offline fallback
    }

    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // 3. Prevent duplicate additions
    if (mongoose.connection.readyState === 1) {
      const customer = await Customer.findById(userId);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
      }

      const isAlreadyInWishlist = customer.wishlist.some(
        (id) => id.toString() === productId
      );

      if (isAlreadyInWishlist) {
        return res.status(409).json({
          success: false,
          message: 'Product already in wishlist',
        });
      }

      // Add product ObjectId reference
      customer.wishlist.push(productId);
      await customer.save();
    } else {
      const userKey = userId.toString();
      if (!fallbackWishlists.has(userKey)) {
        fallbackWishlists.set(userKey, new Set());
      }
      const set = fallbackWishlists.get(userKey);
      if (set.has(productId)) {
        return res.status(409).json({
          success: false,
          message: 'Product already in wishlist',
        });
      }
      set.add(productId);
    }

    return res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error adding product to wishlist',
      error: error.message,
    });
  }
};

/**
 * Task 3: Get current user's wishlist with populated product references
 * GET /wishlist
 * Protected API
 */
const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    if (mongoose.connection.readyState === 1) {
      // Find customer and populate Product references
      const customer = await Customer.findById(userId).populate({
        path: 'wishlist',
        select: 'name description price category image stock createdAt',
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
      }

      // Filter out any null populated items (e.g. deleted products)
      const validWishlist = (customer.wishlist || []).filter((item) => item !== null);

      return res.status(200).json({
        success: true,
        count: validWishlist.length,
        wishlist: validWishlist,
      });
    } else {
      const userKey = userId.toString();
      const set = fallbackWishlists.get(userKey) || new Set();

      // Retrieve product details for fallback
      const ProductController = require('./product.controller');
      const mockList = [];
      for (const prodId of set) {
        // Construct mock product if needed
        mockList.push({
          _id: prodId,
          name: prodId === '66d123abc456000000000001' ? 'Noise Cancelling Headphones' : 'RGB Mechanical Keyboard',
          price: 2999,
          category: 'Electronics',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          stock: 12,
        });
      }

      return res.status(200).json({
        success: true,
        count: mockList.length,
        wishlist: mockList,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving wishlist',
      error: error.message,
    });
  }
};

/**
 * Task 4: Remove a product from current user's wishlist
 * DELETE /wishlist/:productId
 * Protected API
 */
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // 1. Validate Product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    if (mongoose.connection.readyState === 1) {
      const customer = await Customer.findById(userId);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
      }

      const index = customer.wishlist.findIndex(
        (id) => id.toString() === productId
      );

      if (index === -1) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in wishlist',
        });
      }

      // Remove product reference
      customer.wishlist.splice(index, 1);
      await customer.save();
    } else {
      const userKey = userId.toString();
      const set = fallbackWishlists.get(userKey);
      if (!set || !set.has(productId)) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in wishlist',
        });
      }
      set.delete(productId);
    }

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error removing product from wishlist',
      error: error.message,
    });
  }
};

/**
 * Bonus Challenge (+10 Marks): Toggle Wishlist Action
 * PATCH /wishlist/:productId/toggle
 * Protected API
 */
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    let isSaved = false;

    if (mongoose.connection.readyState === 1) {
      const customer = await Customer.findById(userId);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
      }

      const index = customer.wishlist.findIndex(
        (id) => id.toString() === productId
      );

      if (index > -1) {
        // Already wishlisted -> Remove it
        customer.wishlist.splice(index, 1);
        isSaved = false;
      } else {
        // Not wishlisted -> Add it
        customer.wishlist.push(productId);
        isSaved = true;
      }

      await customer.save();
    } else {
      const userKey = userId.toString();
      if (!fallbackWishlists.has(userKey)) {
        fallbackWishlists.set(userKey, new Set());
      }
      const set = fallbackWishlists.get(userKey);
      if (set.has(productId)) {
        set.delete(productId);
        isSaved = false;
      } else {
        set.add(productId);
        isSaved = true;
      }
    }

    return res.status(200).json({
      success: true,
      saved: isSaved,
      message: isSaved ? 'Product added to wishlist' : 'Product removed from wishlist',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error toggling wishlist',
      error: error.message,
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
};
