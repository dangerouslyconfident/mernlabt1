# 🛍️ ShopKart — Apple Liquid Glass MERN E-Commerce Platform

> **Complete Full-Stack Implementation for Engineering Labs 01 – 06**  
> Built with MongoDB, Express.js, React 18 (Vite + Tailwind CSS), Node.js, and Razorpay Test Mode.  
> Designed with an **Apple Liquid Glass** dark aesthetic, floating translucent navigation, and desktop/mobile responsiveness.

---

## 📑 Table of Contents
1. [Labs Overview & Scope](#-labs-overview--scope)
2. [Apple Liquid Glass UI / Apple UX Design](#-apple-liquid-glass-ui--apple-ux-design)
3. [Architecture & Project Structure](#-architecture--project-structure)
4. [Complete REST API Contract](#-complete-rest-api-contract)
5. [Database Models & Architectural Decisions](#-database-models--architectural-decisions)
6. [Razorpay Payment Lifecycle & Security](#-razorpay-payment-lifecycle--security)
7. [Getting Started & Setup Instructions](#-getting-started--setup-instructions)
8. [Automated Test Suite & Verification (32/32 Passing)](#-automated-test-suite--verification)
9. [Comprehensive Viva & Oral Exam Guide (Labs 01–06)](#-comprehensive-viva--oral-exam-guide)

---

## 📋 Labs Overview & Scope

| Lab | Theme | Key Technical Implementations |
|---|---|---|
| **Lab 01** | **Customer Auth Service** | Customer Model, bcrypt password hashing (salt rounds = 10), JWT issued in both HttpOnly cookie & Bearer token header, Register, Login, Protected Profile (`GET /customers/me`), Logout, Change Password. |
| **Lab 02** | **Frontend Auth Flow** | Controlled React form components, client validation, dynamic error banners, JWT session persistence, protected routes, clean logout, automatic redirection to `/login` or `/home`. |
| **Lab 03** | **Product Catalog & Discovery** | Product Model, REST APIs (`GET /products`, `GET /products/:id`), dynamic regex search (`?search=`), category filtering (`?category=`), multi-field sorting (`?sort=price_asc\|price_desc\|rating`), single product detail page. |
| **Lab 04** | **Wishlist & MongoDB Relationships** | MongoDB ObjectId referencing (`ref: 'Product'`), Mongoose `.populate()`, duplicate conflict guard (`409 Conflict`), Protected Wishlist APIs, dynamic Wishlist cards, undo actions, loading/empty/error states, navbar badge. |
| **Lab 05** | **Shopping Cart Service** | Cart schema with subdocument items `[{ product, quantity }]`, inventory stock verification, atomic quantity increment/decrement, remove item, server-calculated subtotals and grand totals. |
| **Lab 06** | **Checkout & Orders (Razorpay Integration)** | Shipping address validation, server-side pricing in paise (`amount * 100`), Razorpay order generation, cryptographic HMAC SHA256 signature verification, cart clearing strictly on payment success, order snapshots (immutable price/name/image), order history (`/orders`), order receipt (`/order-success/:id`). |

---

## 💎 Apple Liquid Glass UI / Apple UX Design

ShopKart features a modern dark aesthetic inspired by Apple's design system:

* **Obsidian Canvas Palette:** Deep pitch-dark base (`#09090b` / `#050507`) with high-contrast typography and subtle secondary muted text (`#a1a1aa`).
* **Liquid Glass Translucency:** Built with CSS backdrop filters (`backdrop-blur-xl`), 1px specular border highlights (`rgba(255, 255, 255, 0.08)` to `0.15`), and radial background glow effects.
* **Apple Pill Controls:** Rounded pill buttons (`rounded-full`) with spring hover physics, glowing inner bevels, and smooth micro-interactions.
* **Floating Glass Navigation:** Persistent top navigation bar floating above content with an active backdrop blur, badge counters for Cart and Wishlist, and quick customer profile access.
* **Zero Layout Shift (CLS):** Skeleton placeholders and dedicated loading/empty/error states across catalog, cart, and orders ensure fluid, uninterrupted rendering.

---

## 🏗️ Architecture & Project Structure

The project follows a clean MVC architecture on the backend and a modular, hook-driven component architecture on the frontend.

```text
mernlab/
├── backend/
│   ├── config/
│   │   └── razorpay.js               # Razorpay SDK initialization & mock fallback
│   ├── controllers/
│   │   ├── auth.controller.js        # Auth controller alias
│   │   ├── customer.controller.js    # Register, Login, Me, Logout, Change Password
│   │   ├── product.controller.js     # Catalog CRUD, Search, Filter, Sort
│   │   ├── wishlist.controller.js    # Wishlist Add (409 guard), Populate, Remove, Toggle
│   │   ├── cart.controller.js        # Cart Add, Update Qty, Stock Check, Remove, Sync
│   │   └── order.controller.js       # Razorpay Order, HMAC Verification, Snapshots, History
│   ├── middlewares/
│   │   └── auth.middleware.js        # Dual-mode auth (HttpOnly Cookie + Bearer Header)
│   ├── models/
│   │   ├── customer.model.js        # Customer schema (with wishlist refs)
│   │   ├── user.model.js            # User alias
│   │   ├── product.model.js         # Product schema (name, price, stock, category, rating)
│   │   └── order.model.js           # Order schema (snapshots, shipping, payment status, status)
│   ├── routes/
│   │   ├── auth.routes.js           # Auth route alias
│   │   ├── customer.routes.js       # /customers endpoints
│   │   ├── product.routes.js        # /products endpoints
│   │   ├── wishlist.routes.js       # /wishlist endpoints
│   │   ├── cart.routes.js           # /cart endpoints
│   │   └── order.routes.js          # /orders endpoints
│   ├── utils/
│   │   └── generateToken.js         # JWT signing & secure cookie options
│   ├── test_all_labs.js             # Master test suite running all 32 tests (Labs 01-06)
│   ├── test_orders.js               # Lab 06 dedicated test suite (12 tests)
│   ├── test_cart.js                 # Lab 05 dedicated test suite
│   ├── test_wishlist.js             # Lab 04 dedicated test suite
│   ├── index.js                     # Express server & dual route mount (/ & /api/)
│   └── .env.example                 # Example environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Floating Apple Glass Navbar with live counters
│   │   │   ├── ProductCard.jsx      # Catalog item card with quick cart & wishlist actions
│   │   │   ├── CartItem.jsx         # Cart item with quantity stepper & remove action
│   │   │   ├── WishlistCard.jsx     # Wishlist card with move-to-cart option
│   │   │   ├── SearchBar.jsx        # Search input with live debounced discovery
│   │   │   ├── ui/                  # Reusable GlassButton, GlassCard, InputField, UndoToast
│   │   │   └── auth/                # ProtectedRoute and AuthShell layouts
│   │   ├── context/
│   │   │   ├── CartContext.jsx      # Global cart state, optimistic updates & totals
│   │   │   └── WishlistContext.jsx  # Global wishlist sync & live badge count
│   │   ├── pages/
│   │   │   ├── Landing.jsx          # Apple-inspired landing hero & feature highlights
│   │   │   ├── Home.jsx             # Customer dashboard & quick account overview
│   │   │   ├── Login.jsx            # Translucent glass login form
│   │   │   ├── Register.jsx         # Translucent glass registration form
│   │   │   ├── Products.jsx         # Catalog discovery with filter & sort controls
│   │   │   ├── ProductDetails.jsx   # Detailed product view with stock counter & specs
│   │   │   ├── Wishlist.jsx         # Saved items view with batch move to cart
│   │   │   ├── Cart.jsx             # Shopping cart view with itemized summary & checkout CTA
│   │   │   ├── Checkout.jsx         # Shipping address form, order review, Razorpay trigger
│   │   │   ├── OrderSuccess.jsx     # Post-payment confirmation receipt with snapshots
│   │   │   └── Orders.jsx           # Customer order history & real-time delivery status
│   │   ├── services/
│   │   │   └── api.js               # Universal API client (`credentials: 'include'`)
│   │   ├── styles/
│   │   │   └── theme.css            # Apple Liquid Glass design tokens & keyframes
│   │   ├── App.jsx                  # React Router configuration
│   │   └── main.jsx
│   ├── vite.config.js               # Vite config with /api and direct endpoint proxy
│   └── package.json
│
├── package.json                     # Monorepo script orchestrator
└── README.md
```

---

## 🔌 Complete REST API Contract

All endpoints are available both directly (e.g. `POST /customers/register`) and namespaced under `/api` (e.g. `POST /api/customers/register`).

### 1. Customer Authentication (Lab 01 & 02)
| Method | Endpoint | Auth | Description | Status Codes |
|---|---|:---:|---|:---:|
| `POST` | `/customers/register` | ❌ | Register customer (`fullName`, `email`, `password`, `phone`) | `201`, `400`, `409` |
| `POST` | `/customers/login` | ❌ | Authenticate customer, set HttpOnly cookie & return JWT token | `200`, `400`, `401` |
| `GET` | `/customers/me` | ✅ | Get profile of logged-in customer (verifies cookie or Bearer) | `200`, `401` |
| `POST` | `/customers/logout` | ✅ | Clear HttpOnly authentication cookie | `200`, `401` |
| `PATCH`| `/customers/change-password` | ✅ | Verify old password & update to new hashed password | `200`, `400`, `401` |

### 2. Product Catalog (Lab 03)
| Method | Endpoint | Auth | Description | Status Codes |
|---|---|:---:|---|:---:|
| `GET` | `/products` | ❌ | List all products (query: `?search=`, `?category=`, `?sort=`) | `200` |
| `GET` | `/products/:id` | ❌ | Get single product by MongoDB ObjectId | `200`, `400`, `404` |
| `POST` | `/products` | ❌ | Seed / Create product (`name`, `price`, `stock`, `category`) | `201`, `400` |

### 3. Wishlist Service (Lab 04)
| Method | Endpoint | Auth | Description | Status Codes |
|---|---|:---:|---|:---:|
| `POST` | `/wishlist/:productId` | ✅ | Add product ObjectId reference (prevents duplicate: `409 Conflict`) | `201`, `400`, `404`, `409` |
| `GET` | `/wishlist` | ✅ | Return populated wishlist products | `200`, `401` |
| `DELETE`| `/wishlist/:productId` | ✅ | Remove product reference from user's wishlist | `200`, `400`, `404` |
| `PATCH` | `/wishlist/:productId/toggle` | ✅ | Toggle saved status for a product | `200`, `400`, `404` |

### 4. Shopping Cart Service (Lab 05)
| Method | Endpoint | Auth | Description | Status Codes |
|---|---|:---:|---|:---:|
| `POST` | `/cart/:productId` | ✅ | Add item to cart with quantity (increments if exists; checks stock) | `200`, `400`, `404` |
| `GET` | `/cart` | ✅ | Get user's cart populated with current product data & item total | `200`, `401` |
| `PUT` | `/cart/:productId` | ✅ | Update quantity for an item (validates against available stock) | `200`, `400`, `404` |
| `DELETE`| `/cart/:productId` | ✅ | Remove an item from the cart | `200`, `400`, `404` |
| `DELETE`| `/cart` | ✅ | Clear all items from cart | `200`, `401` |

### 5. Checkout & Orders with Razorpay (Lab 06)
| Method | Endpoint | Auth | Description | Status Codes |
|---|---|:---:|---|:---:|
| `POST` | `/orders/create-payment-order` | ✅ | Validate address & stock, compute total on server, create Razorpay order & pending ShopKart order | `201`, `400`, `401` |
| `POST` | `/orders/verify-payment` | ✅ | Cryptographically verify HMAC SHA256 signature, mark order `PAID` & `PLACED`, clear user's cart | `200`, `400`, `401`, `404` |
| `GET` | `/orders` | ✅ | Get authenticated customer's order history sorted newest first | `200`, `401` |
| `GET` | `/orders/:id` | ✅ | Get single order details with address, snapshot items & delivery status | `200`, `401`, `403`, `404` |
| `PATCH`| `/orders/:id/status` | ✅ | Bonus: Update status (`CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`) | `200`, `400`, `404` |

---

## 🗃️ Database Models & Architectural Decisions

### 1. Referencing vs. Embedding (Labs 04 & 05)
* **Wishlist & Cart:** Use **Referencing** via `mongoose.Schema.Types.ObjectId` pointing to the `Product` collection.
  * **Benefit:** When a product's price or description changes, the user's cart and wishlist always display live catalog data during browsing.

### 2. Snapshot Pattern (Lab 06 Order Model)
* In contrast to the cart, the **Order Model** uses the **Snapshot Pattern**:

```javascript
// models/order.model.js
const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },       // Historical price at purchase time
  quantity: { type: Number, required: true },
  image: { type: String }
});
```

* **Why snapshot price and details in orders?**
  * If a product was bought for ₹1,299 and the vendor later changes the price to ₹1,999 or deletes the product, the customer's invoice and order history must legally and practically remain fixed at ₹1,299.

### 3. Server-Side Price Calculation
* The client **never** sends the total payable amount to the backend.
* The server reads the customer's cart, queries each product's current price directly from the database, sums the total, and multiplies by `100` to convert to **paise** for Razorpay:

$$\text{amountInPaise} = \left(\sum_{i} \text{item}_i.\text{price} \times \text{item}_i.\text{quantity}\right) \times 100$$

---

## 🛡️ Razorpay Payment Lifecycle & Security

```text
┌──────────────┐             ┌────────────────┐             ┌────────────────┐
│ React Client │             │ Express Server │             │  Razorpay API  │
└──────┬───────┘             └───────┬────────┘             └───────┬────────┘
       │                             │                              │
       │ 1. POST /orders/create-     │                              │
       │    payment-order (address)  │                              │
       │────────────────────────────>│                              │
       │                             │ 2. Fetch cart & calc total   │
       │                             │ 3. Create Razorpay order     │
       │                             │─────────────────────────────>│
       │                             │                              │
       │                             │ 4. Return razorpay order_id  │
       │                             │<─────────────────────────────│
       │                             │ 5. Save order (PENDING_PAY)  │
       │ 6. Return orderId & amount  │                              │
       │<────────────────────────────│                              │
       │                             │                              │
       │ 7. Open Razorpay Checkout   │                              │
       │    Modal in browser         │                              │
       │                             │                              │
       │ 8. User enters payment info │                              │
       │ 9. Razorpay returns token:  │                              │
       │    razorpay_order_id        │                              │
       │    razorpay_payment_id      │                              │
       │    razorpay_signature       │                              │
       │                             │                              │
       │ 10. POST /orders/verify-    │                              │
       │     payment (tokens)        │                              │
       │────────────────────────────>│                              │
       │                             │ 11. Compute HMAC SHA256:     │
       │                             │     HMAC(order_id|pay_id)    │
       │                             │ 12. Signature == Expected?   │
       │                             │     YES:                     │
       │                             │      - paymentStatus = PAID  │
       │                             │      - status = PLACED       │
       │                             │      - CLEAR USER'S CART     │
       │ 13. Return verified order   │                              │
       │<────────────────────────────│                              │
       │                             │                              │
       │ 14. Navigate to             │                              │
       │     /order-success/:id      │                              │
```

### Cryptographic HMAC SHA256 Signature Verification
To prevent fraudulent payment confirmation, the server recalculates the signature using Node.js built-in `crypto` module:

```javascript
const crypto = require('crypto');

const body = razorpay_order_id + '|' + razorpay_payment_id;
const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(body.toString())
  .digest('hex');

if (expectedSignature !== razorpay_signature) {
  return res.status(400).json({ success: false, message: 'Invalid payment signature. Verification failed.' });
}
```

---

## 🚀 Getting Started & Setup Instructions

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** (v9.0.0 or higher)
* *(Optional)* Local MongoDB running on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI.
  > **Note:** The application includes an automatic in-memory fallback. If MongoDB is not running locally, the server runs seamlessly in-memory so you can test all features immediately without any database setup!

### 1. Clone & Configure
```bash
git clone https://github.com/dangerouslyconfident/mernlab.git
cd mernlab
```

### 2. Environment Variables
Create a `backend/.env` file (or copy from `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/shopkart
JWT_SECRET=shopkart_ultra_secure_jwt_dev_secret_2026
RAZORPAY_KEY_ID=rzp_test_YourKeyIdHere
RAZORPAY_KEY_SECRET=YourKeySecretHere
NODE_ENV=development
```

### 3. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 4. Run the Application
In your terminal, you can start both services:

**Start Backend (Terminal 1):**
```bash
cd backend
npm start
# Server starts on http://localhost:5000
```

**Start Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
# Vite client starts on http://localhost:5173
```

Visit **`http://localhost:5173`** in your browser to experience the Apple Liquid Glass ShopKart interface.

---

## 🧪 Automated Test Suite & Verification

The project includes automated integration test scripts that validate all 6 labs end-to-end.

To run the complete test suite:
```bash
node backend/test_all_labs.js
```

### Test Execution Output (32/32 Passing Tests):

```text
====================================================
       SHOPKART FULL-STACK LABS TEST SUITE          
       (Covers Lab 01, Lab 02, Lab 03, Lab 04)      
====================================================

--- [LAB 01] Customer Authentication Service ---
1. Registering new customer...
✅ PASSED: POST /customers/register returned 201 Created
✅ PASSED: Returned registered customer details
✅ PASSED: Password is never returned in response

2. Testing duplicate email registration...
✅ PASSED: Duplicate email returned 409 Conflict

3. Testing password validation (<6 chars)...
✅ PASSED: Short password returned 400 Bad Request

4. Testing customer login...
✅ PASSED: POST /customers/login returned 200 OK
✅ PASSED: HttpOnly token cookie present in response headers
✅ PASSED: JWT token returned in login response for Bearer auth

5. Testing invalid credentials login...
✅ PASSED: Invalid password returned 401 Unauthorized

6. Testing protected profile GET /customers/me...
✅ PASSED: GET /customers/me with cookie returned 200 OK
✅ PASSED: Returned authenticated user profile

7. Testing GET /customers/me with Authorization: Bearer <token>...
✅ PASSED: GET /customers/me with Bearer token returned 200 OK

8. Testing unauthenticated access to /customers/me...
✅ PASSED: Unauthenticated request returned 401 Unauthorized

9. Testing bonus change password PATCH /customers/change-password...
✅ PASSED: Change password returned 200 OK

--- [LAB 03] Product Catalog & Discovery ---
10. Testing GET /products...
✅ PASSED: GET /products returned 200 OK
✅ PASSED: Returned products array
✅ PASSED: Returned 8 catalog products

11. Testing GET /products/66d123abc456000000000008...
✅ PASSED: GET /products/:id returned 200 OK
✅ PASSED: Returned correct product document

12. Testing search query GET /products?search=keyboard...
✅ PASSED: Search returned 200 OK
✅ PASSED: Returned products matching "keyboard"

13. Testing category filter GET /products?category=Electronics...
✅ PASSED: Category filter returned 200 OK
✅ PASSED: All filtered products belong to Electronics

14. Testing price sorting (price_asc & price_desc)...
✅ PASSED: Sorting price_asc returned 200 OK
✅ PASSED: Products sorted in ascending order of price

--- [LAB 04] Wishlist Feature (Relationship & Protected APIs) ---
15. Testing unauthenticated GET /wishlist...
✅ PASSED: Unauthenticated /wishlist returned 401 Unauthorized

16. Testing POST /wishlist/66d123abc456000000000008 (Add product)...
✅ PASSED: POST /wishlist/:productId returned 201 Created
✅ PASSED: Success flag true in response

17. Testing duplicate POST /wishlist/66d123abc456000000000008...
✅ PASSED: Duplicate addition returned 409 Conflict

18. Testing GET /wishlist (Populated product data)...
✅ PASSED: GET /wishlist returned 200 OK
✅ PASSED: Wishlist count is 1
✅ PASSED: Wishlist products are populated with name and price

19. Testing bonus PATCH /wishlist/66d123abc456000000000008/toggle...
✅ PASSED: Toggle 1 removed product (saved = false)
✅ PASSED: Toggle 2 re-added product (saved = true)

20. Testing DELETE /wishlist/66d123abc456000000000008...
✅ PASSED: DELETE /wishlist/:productId returned 200 OK

21. Testing duplicate DELETE /wishlist/66d123abc456000000000008...
✅ PASSED: Duplicate removal returned 404 Not Found

--- [LAB 05] Shopping Cart Service ---
22. Testing POST /cart/66d123abc456000000000008 (Add to cart)...
✅ PASSED: POST /cart/:productId returned 200
✅ PASSED: Product added to cart with quantity 1

23. Testing POST /cart/66d123abc456000000000008 again (Quantity increment)...
✅ PASSED: Re-add returned 200
✅ PASSED: Quantity correctly incremented to 2

24. Testing GET /cart (Populated product data)...
✅ PASSED: GET /cart returned 200 OK
✅ PASSED: Cart contains populated items

25. Testing quantity exceeding stock limit...
✅ PASSED: Exceeding stock returned 400 Bad Request

--- [LAB 06] Checkout & Razorpay Payment Verification ---
26. Testing POST /orders/create-payment-order...
✅ PASSED: Order creation returned 201 Created
✅ PASSED: Returned valid ShopKart order ID
✅ PASSED: Returned valid Razorpay order ID
✅ PASSED: Server calculated total amount in paise

27. Testing rejection of tampered payment signature...
✅ PASSED: Invalid signature rejected with 400
✅ PASSED: Cart remains preserved after payment failure

28. Testing verified payment with cryptographic HMAC SHA256 signature...
✅ PASSED: Payment verified with 200 OK
✅ PASSED: Order paymentStatus marked as PAID
✅ PASSED: Order status marked as PLACED

29. Verifying cart is cleared after payment success...
✅ PASSED: Cart cleared after verified payment

30. Testing GET /orders (My Orders)...
✅ PASSED: GET /orders returned 200 OK
✅ PASSED: Order appears in user order history

31. Testing GET /orders/6ad11a451f919c5b8c8070d3...
✅ PASSED: GET /orders/:id returned 200 OK
✅ PASSED: Returned matching order document

32. Testing logout POST /customers/logout...
✅ PASSED: POST /customers/logout returned 200 OK

====================================================
    ALL 32 LAB TESTS EXECUTED SUCCESSFULLY! 🎉      
    (Labs 01, 02, 03, 04, 05, 06 Fully Validated)   
====================================================
```

---

## 🎤 Comprehensive Viva & Oral Exam Guide

### 1. Authentication & Security (Labs 01 & 02)
* **Q: Why store the JWT in an `HttpOnly` cookie rather than `localStorage`?**  
  *A:* Cookies marked `HttpOnly` cannot be read by JavaScript executing in the browser (`document.cookie`), which completely prevents token theft through Cross-Site Scripting (XSS) attacks.
* **Q: What is the purpose of `bcrypt.hash(password, 10)`?**  
  *A:* It hashes the plaintext password with 10 rounds of salt. Salt protects against rainbow table attacks, and bcrypt's slow key derivation function protects against brute-force password cracking.
* **Q: Why shouldn't customer passwords ever be sent back in API responses?**  
  *A:* Exposing password hashes leaks sensitive user data, increases risk if API traffic is logged, and violates security compliance standards. The controller explicitly sanitizes customer documents before serialization.

### 2. Catalog & Discovery (Lab 03)
* **Q: How does the search query work without loading all products into memory?**  
  *A:* The query uses MongoDB's regex filter `{ name: { $regex: search, $options: 'i' } }`, which performs case-insensitive substring matching directly in the database engine.
* **Q: Why convert sort queries into `{ [sortField]: sortOrder }` objects?**  
  *A:* It enables dynamic sorting based on query parameters (e.g., `price_asc` maps to `{ price: 1 }`, `price_desc` maps to `{ price: -1 }`) while sanitizing inputs against injection.

### 3. Wishlist vs. Shopping Cart (Labs 04 & 05)
* **Q: What is the architectural difference between a Wishlist and a Shopping Cart?**  
  *A:* A **Wishlist** is a simple set of product references representing aspirational intent; it contains no quantity and duplicate additions return `409 Conflict`. A **Cart** represents purchase intent; it contains product references with quantities, validates against current stock, and adding an existing product increments its quantity rather than rejecting it.
* **Q: What does Mongoose `.populate()` do behind the scenes?**  
  *A:* It inspects the `ref` model declared in the schema, collects all matching ObjectIds, performs a secondary query on the referenced collection (e.g. `products`), and replaces the ObjectIds with the populated product documents before returning the response.

### 4. Checkout, Orders & Payment Gateways (Lab 06)
* **Q: Why do we snapshot item details in the Order document instead of referencing the Product?**  
  *A:* E-commerce orders represent historical legal agreements. If a merchant updates a product name, increases its price, or deletes it from the catalog, previous customer orders must preserve the exact price, title, and image captured at the moment the transaction occurred.
* **Q: Why is payment verification performed on the backend using HMAC SHA256?**  
  *A:* The browser frontend cannot be trusted. A malicious user could forge a success response in JavaScript. Razorpay signs the concatenated `order_id|payment_id` using the secret key known only to Razorpay and our backend. By recomputing the HMAC hash on the server, we verify that Razorpay actually processed the transaction.
* **Q: Why must the cart be cleared only after signature verification succeeds?**  
  *A:* If a customer's payment fails or they cancel the payment modal, their cart items must remain intact so they can retry without adding all products again. Clearing the cart prematurely results in a poor user experience.
* **Q: Why does the server calculate total order amount in paise?**  
  *A:* Razorpay expects amounts in the smallest currency sub-unit (1 Rupee = 100 paise) to avoid floating-point rounding errors in financial transactions. Furthermore, calculating amounts on the server ensures clients cannot tamper with prices.

---

## 📄 License
This project is developed for educational and evaluation purposes as part of the Full-Stack Engineering Curriculum. Released under the [MIT License](LICENSE).
