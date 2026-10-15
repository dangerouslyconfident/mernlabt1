const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

// In-memory fallback cart store for offline / restricted network environments (hostel Wi-Fi)
const fallbackCarts = new Map(); // userId -> [{ product: {...}, quantity: number }]

// Fallback sample product dictionary
const SAMPLE_PRODUCTS = {
  '66d123abc456000000000001': {
    _id: '66d123abc456000000000001',
    name: 'Noise Cancelling Headphones',
    price: 4999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    stock: 25,
  },
  '66d123abc456000000000002': {
    _id: '66d123abc456000000000002',
    name: 'RGB Mechanical Keyboard',
    price: 2999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    stock: 12,
  },
  '66d123abc456000000000003': {
    _id: '66d123abc456000000000003',
    name: 'Ultra HD 4K Monitor 27"',
    price: 24999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
    stock: 8,
  },
  '66d123abc456000000000004': {
    _id: '66d123abc456000000000004',
    name: 'Minimalist Leather Backpack',
    price: 3499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    stock: 15,
  },
};

/**
 * Task 2: Add product to cart (or increment quantity if already present)
 * POST /cart/:productId
 * Protected
 */
const addToCart = async (req, res) => {
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

    if (mongoose.connection.readyState === 1) {
      // 2. Fetch product and verify stock
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      if (product.stock <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Product is out of stock',
        });
      }

      // 3. Find customer
      const customer = await Customer.findById(userId);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
      }

      // 4. Check if product already in cart
      const existingItem = customer.cart.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        const newQty = existingItem.quantity + 1;
        if (newQty > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Cannot exceed available stock (${product.stock} units available)`,
          });
        }
        existingItem.quantity = newQty;
      } else {
        customer.cart.push({
          product: productId,
          quantity: 1,
        });
      }

      await customer.save();

      // Populate updated cart
      await customer.populate({
        path: 'cart.product',
        select: 'name price image stock category',
      });

      return res.status(200).json({
        success: true,
        message: 'Cart updated',
        cart: customer.cart,
      });
    } else {
      // Offline fallback handling
      const userKey = userId.toString();
      if (!fallbackCarts.has(userKey)) {
        fallbackCarts.set(userKey, []);
      }
      const cartList = fallbackCarts.get(userKey);

      const product = SAMPLE_PRODUCTS[productId] || {
        _id: productId,
        name: 'Selected Product',
        price: 2999,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        stock: 10,
      };

      const existing = cartList.find((item) => item.product._id.toString() === productId);
      if (existing) {
        const newQty = existing.quantity + 1;
        if (newQty > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Cannot exceed available stock (${product.stock} units available)`,
          });
        }
        existing.quantity = newQty;
      } else {
        cartList.push({
          product,
          quantity: 1,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Cart updated',
        cart: cartList,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error adding product to cart',
      error: error.message,
    });
  }
};

/**
 * Task 3: Get current user's populated cart
 * GET /cart
 * Protected
 */
const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    if (mongoose.connection.readyState === 1) {
      const customer = await Customer.findById(userId).populate({
        path: 'cart.product',
        select: 'name price image stock category',
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
      }

      // Clean out any orphaned items if product was deleted
      const validCart = (customer.cart || []).filter((item) => item.product !== null);

      return res.status(200).json({
        success: true,
        count: validCart.length,
        cart: validCart,
      });
    } else {
      const userKey = userId.toString();
      const cartList = fallbackCarts.get(userKey) || [];

      return res.status(200).json({
        success: true,
        count: cartList.length,
        cart: cartList,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving cart',
      error: error.message,
    });
  }
};

/**
 * Task 4: Update product quantity in cart
 * PATCH /cart/:productId
 * Protected
 */
const updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;

    // 1. Validate Product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const numQty = Number(quantity);
    // 2. Validate quantity boundaries
    if (isNaN(numQty) || numQty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a number of at least 1',
      });
    }

    if (mongoose.connection.readyState === 1) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Check stock limit
      if (numQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Requested quantity exceeds available stock (${product.stock} units available)`,
        });
      }

      const customer = await Customer.findById(userId);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
      }

      const item = customer.cart.find(
        (i) => i.product.toString() === productId
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in cart',
        });
      }

      item.quantity = numQty;
      await customer.save();

      await customer.populate({
        path: 'cart.product',
        select: 'name price image stock category',
      });

      return res.status(200).json({
        success: true,
        message: 'Quantity updated',
        cart: customer.cart,
      });
    } else {
      const userKey = userId.toString();
      const cartList = fallbackCarts.get(userKey) || [];
      const item = cartList.find((i) => i.product._id.toString() === productId);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in cart',
        });
      }

      if (numQty > (item.product.stock || 10)) {
        return res.status(400).json({
          success: false,
          message: `Requested quantity exceeds available stock (${item.product.stock || 10} units available)`,
        });
      }

      item.quantity = numQty;

      return res.status(200).json({
        success: true,
        message: 'Quantity updated',
        cart: cartList,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error updating cart quantity',
      error: error.message,
    });
  }
};

/**
 * Task 5: Remove product from cart
 * DELETE /cart/:productId
 * Protected
 */
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

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

      const index = customer.cart.findIndex(
        (i) => i.product.toString() === productId
      );

      if (index === -1) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in cart',
        });
      }

      customer.cart.splice(index, 1);
      await customer.save();

      await customer.populate({
        path: 'cart.product',
        select: 'name price image stock category',
      });

      return res.status(200).json({
        success: true,
        message: 'Product removed from cart',
        cart: customer.cart,
      });
    } else {
      const userKey = userId.toString();
      const cartList = fallbackCarts.get(userKey) || [];
      const index = cartList.findIndex((i) => i.product._id.toString() === productId);

      if (index === -1) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in cart',
        });
      }

      cartList.splice(index, 1);

      return res.status(200).json({
        success: true,
        message: 'Product removed from cart',
        cart: cartList,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error removing product from cart',
      error: error.message,
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart,
  fallbackCarts,
};
