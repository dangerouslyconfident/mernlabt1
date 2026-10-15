const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
} = require('../controllers/product.controller');

// GET /products - List all products with optional ?search=, ?category=, ?sort=
router.get('/', getProducts);

// POST /products - Create a new product
router.post('/', createProduct);

// GET /products/:id - Retrieve single product by MongoDB ID
router.get('/:id', getProductById);

module.exports = router;
