const mongoose = require('mongoose');
const Product = require('../models/product.model');

// Pre-seeded fallback catalog (ensures testing works seamlessly even in restricted network environments like hostel Wi-Fi)
const DEFAULT_PRODUCTS = [
  {
    _id: '66d123abc456000000000001',
    name: 'Noise Cancelling Headphones',
    description: 'Wireless over-ear headphones with active noise cancellation and 40h battery life.',
    price: 4999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    stock: 25,
    createdAt: new Date('2026-09-01'),
  },
  {
    _id: '66d123abc456000000000002',
    name: 'RGB Mechanical Keyboard',
    description: 'Customizable RGB mechanical keyboard with tactile blue switches and aluminum frame.',
    price: 2999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    stock: 12,
    createdAt: new Date('2026-09-02'),
  },
  {
    _id: '66d123abc456000000000003',
    name: 'Ultra HD 4K Monitor 27"',
    description: 'IPS color-accurate display with 144Hz refresh rate, USB-C connectivity and HDR400.',
    price: 24999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
    stock: 8,
    createdAt: new Date('2026-09-03'),
  },
  {
    _id: '66d123abc456000000000004',
    name: 'Minimalist Leather Backpack',
    description: 'Water-resistant handcrafted vegan leather backpack with dedicated 16-inch laptop sleeve.',
    price: 3499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    stock: 15,
    createdAt: new Date('2026-09-04'),
  },
  {
    _id: '66d123abc456000000000005',
    name: 'Classic Linen Overshirt',
    description: 'Breathable organic linen shirt designed for casual comfort in warm climates.',
    price: 1899,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
    stock: 30,
    createdAt: new Date('2026-09-05'),
  },
  {
    _id: '66d123abc456000000000006',
    name: 'Smart Ambient Desk Lamp',
    description: 'Color temperature adjustable desk lamp with touch slider and wireless smartphone charging base.',
    price: 2199,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=800&auto=format&fit=crop&q=80',
    stock: 18,
    createdAt: new Date('2026-09-06'),
  },
  {
    _id: '66d123abc456000000000007',
    name: 'Ceramic Pour-Over Coffee Maker',
    description: 'Artisan matte ceramic dripper set with borosilicate glass server and bamboo lid.',
    price: 1499,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    stock: 0,
    createdAt: new Date('2026-09-07'),
  },
  {
    _id: '66d123abc456000000000008',
    name: 'Clean Architecture Handbook',
    description: 'A comprehensive guide to software structure and design patterns for modern engineers.',
    price: 899,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    stock: 45,
    createdAt: new Date('2026-09-08'),
  },
];

let inMemoryProducts = [...DEFAULT_PRODUCTS];

/**
 * Task 2: Create a new product
 * POST /products
 */
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // 1. Mandatory fields validation
    if (!name || !description || price === undefined || !category || !image || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, description, price, category, image, stock) are required',
      });
    }

    const numPrice = Number(price);
    const numStock = Number(stock);

    // 2. Numeric range validations
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid number greater than 0',
      });
    }

    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot be negative',
      });
    }

    // 3. Persist product
    if (mongoose.connection.readyState === 1) {
      const product = await Product.create({
        name: name.trim(),
        description: description.trim(),
        price: numPrice,
        category: category.trim(),
        image: image.trim(),
        stock: numStock,
      });

      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product,
      });
    } else {
      // In-memory fallback if MongoDB connection is pending or blocked
      const fallbackProduct = {
        _id: new mongoose.Types.ObjectId().toString(),
        name: name.trim(),
        description: description.trim(),
        price: numPrice,
        category: category.trim(),
        image: image.trim(),
        stock: numStock,
        createdAt: new Date(),
      };
      inMemoryProducts.unshift(fallbackProduct);

      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product: fallbackProduct,
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create product',
    });
  }
};

/**
 * Task 3 & 5: Get all products with dynamic search, category filtering & sorting
 * GET /products?search=phone&category=Electronics&sort=price_asc
 */
const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    if (mongoose.connection.readyState === 1) {
      const filter = {};

      if (search && search.trim() !== '') {
        filter.name = { $regex: search.trim(), $options: 'i' };
      }

      if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
        filter.category = category.trim();
      }

      let query = Product.find(filter);

      if (sort === 'price_asc') {
        query = query.sort({ price: 1 });
      } else if (sort === 'price_desc') {
        query = query.sort({ price: -1 });
      } else {
        query = query.sort({ createdAt: -1 });
      }

      let products = await query.exec();

      // If DB connected but empty, seed default products once
      if (products.length === 0 && !search && (!category || category.toLowerCase() === 'all')) {
        await Product.insertMany(DEFAULT_PRODUCTS.map(({ _id, ...rest }) => rest)).catch(() => {});
        products = await Product.find(filter).sort({ createdAt: -1 });
      }

      return res.status(200).json({
        success: true,
        count: products.length,
        products,
      });
    } else {
      // Filter in-memory when DB is unreachable (hostel Wi-Fi)
      let list = [...inMemoryProducts];

      if (search && search.trim() !== '') {
        const s = search.trim().toLowerCase();
        list = list.filter((p) => p.name.toLowerCase().includes(s));
      }

      if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
        list = list.filter((p) => p.category.toLowerCase() === category.trim().toLowerCase());
      }

      if (sort === 'price_asc') {
        list.sort((a, b) => a.price - b.price);
      } else if (sort === 'price_desc') {
        list.sort((a, b) => b.price - a.price);
      } else {
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      return res.status(200).json({
        success: true,
        count: list.length,
        products: list,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving products',
      error: error.message,
    });
  }
};

/**
 * Task 4: Get a single product by ID
 * GET /products/:id
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    if (mongoose.connection.readyState === 1) {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }
      return res.status(200).json({
        success: true,
        product,
      });
    } else {
      const product = inMemoryProducts.find((p) => p._id.toString() === id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }
      return res.status(200).json({
        success: true,
        product,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving product',
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
};
