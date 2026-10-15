/**
 * Centralized API Service Layer for ShopKart (Lab 01, Lab 02, Lab 03)
 * Centralizes all customer authentication and product catalogue network requests.
 * Uses native fetch with credentials: 'include' for HttpOnly cookie persistence.
 * All API routes are namespaced under /api to avoid collisions with SPA frontend routes.
 */

const API_BASE = '/api';

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

/* =========================================================================
   CUSTOMER AUTHENTICATION SERVICES (Lab 01 & Lab 02)
   ========================================================================= */

/**
 * Register a new customer account
 * @param {Object} formData - { fullName, email, password, phone }
 */
export async function registerCustomer(formData) {
  const res = await fetch(`${API_BASE}/customers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(formData),
  });
  return handleResponse(res);
}

/**
 * Login customer and receive secure HttpOnly cookie
 * @param {Object} credentials - { email, password }
 */
export async function loginCustomer(credentials) {
  const res = await fetch(`${API_BASE}/customers/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  return handleResponse(res);
}

/**
 * Verify authentication state and fetch logged-in customer profile
 */
export async function getMe() {
  const res = await fetch(`${API_BASE}/customers/me`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

/**
 * Logout customer and clear session cookie
 */
export async function logoutCustomer() {
  const res = await fetch(`${API_BASE}/customers/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

/* =========================================================================
   PRODUCT CATALOG SERVICES (Lab 03)
   ========================================================================= */

/**
 * Fetch products with dynamic search, category filtering, and sorting
 * @param {Object} params - { search, category, sort }
 */
export async function fetchProducts({ search = '', category = '', sort = '' } = {}) {
  const query = new URLSearchParams();
  if (search && search.trim()) query.append('search', search.trim());
  if (category && category.trim() && category.toLowerCase() !== 'all') {
    query.append('category', category.trim());
  }
  if (sort && sort.trim()) query.append('sort', sort.trim());

  const queryString = query.toString();
  const url = queryString ? `${API_BASE}/products?${queryString}` : `${API_BASE}/products`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse(res);
}

/**
 * Fetch a single product by its MongoDB _id
 * @param {string} id - Product ObjectId
 */
export async function fetchProductById(id) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse(res);
}

/**
 * Create a new product (Catalog management)
 * @param {Object} productData - { name, description, price, category, image, stock }
 */
export async function createProduct(productData) {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  return handleResponse(res);
}

/* =========================================================================
   WISHLIST SERVICES (Lab 04)
   ========================================================================= */

/**
 * Add a product to current user's wishlist
 * @param {string} productId - Product ObjectId
 */
export async function addToWishlist(productId) {
  const res = await fetch(`${API_BASE}/wishlist/${productId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

/**
 * Get current user's populated wishlist
 */
export async function getWishlist() {
  const res = await fetch(`${API_BASE}/wishlist`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

/**
 * Remove a product from current user's wishlist
 * @param {string} productId - Product ObjectId
 */
export async function removeFromWishlist(productId) {
  const res = await fetch(`${API_BASE}/wishlist/${productId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

/**
 * Bonus: Toggle product in current user's wishlist
 * @param {string} productId - Product ObjectId
 */
export async function toggleWishlist(productId) {
  const res = await fetch(`${API_BASE}/wishlist/${productId}/toggle`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

/* =========================================================================
   SHOPPING CART SERVICES (Lab 05)
   ========================================================================= */

/**
 * Add a product to current user's cart (or increment quantity)
 * @param {string} productId - Product ObjectId
 */
export async function addToCart(productId) {
  const res = await fetch(`${API_BASE}/cart/${productId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

/**
 * Get current user's populated shopping cart
 */
export async function getCart() {
  const res = await fetch(`${API_BASE}/cart`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

/**
 * Update quantity of a product in the cart
 * @param {string} productId - Product ObjectId
 * @param {number} quantity - New quantity (>= 1)
 */
export async function updateCartQuantity(productId, quantity) {
  const res = await fetch(`${API_BASE}/cart/${productId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ quantity }),
  });
  return handleResponse(res);
}

/**
 * Remove a product entirely from current user's cart
 * @param {string} productId - Product ObjectId
 */
export async function removeFromCart(productId) {
  const res = await fetch(`${API_BASE}/cart/${productId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

/* =========================================================================
   CHECKOUT & ORDER SERVICES (Lab 06)
   ========================================================================= */

/**
 * Validate cart, stock, calculate server total and create Razorpay payment order
 * @param {Object} shippingAddress - { fullName, phone, addressLine1, city, state, pincode }
 */
export async function createPaymentOrder(shippingAddress) {
  const res = await fetch(`${API_BASE}/orders/create-payment-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ shippingAddress }),
  });
  return handleResponse(res);
}

/**
 * Verify cryptographic HMAC signature and confirm order
 * @param {Object} paymentData - { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
export async function verifyPayment(paymentData) {
  const res = await fetch(`${API_BASE}/orders/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(paymentData),
  });
  return handleResponse(res);
}

/**
 * Get current user's order history
 */
export async function fetchOrders() {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

/**
 * Get single order details
 * @param {string} id - Order ObjectId
 */
export async function fetchOrderById(id) {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return handleResponse(res);
}

