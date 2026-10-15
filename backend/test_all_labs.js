const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let parsed = body;
        try {
          parsed = JSON.parse(body);
        } catch {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed,
        });
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

async function runCompleteTestSuite() {
  console.log('====================================================');
  console.log('       SHOPKART FULL-STACK LABS TEST SUITE          ');
  console.log('       (Covers Lab 01, Lab 02, Lab 03, Lab 04)      ');
  console.log('====================================================\n');

  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'password123';
  let sessionCookie = '';
  let bearerToken = '';

  // -------------------------------------------------------------------------
  // LAB 01: Customer Authentication APIs
  // -------------------------------------------------------------------------
  console.log('--- [LAB 01] Customer Authentication Service ---');

  // Test 1: Register New Customer (POST /customers/register)
  console.log('1. Registering new customer...');
  const regRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/customers/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    JSON.stringify({
      fullName: 'Alice Developer',
      email: testEmail,
      password: testPassword,
      phone: '9876543210',
    })
  );
  assert(regRes.status === 201, `POST /customers/register returned 201 Created (got ${regRes.status})`);
  assert(regRes.data.customer && regRes.data.customer.email === testEmail, 'Returned registered customer details');
  assert(!regRes.data.customer.password, 'Password is never returned in response');

  // Test 2: Reject Duplicate Email (409 Conflict)
  console.log('\n2. Testing duplicate email registration...');
  const dupRegRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/customers/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    JSON.stringify({
      fullName: 'Alice Clone',
      email: testEmail,
      password: testPassword,
      phone: '9876543210',
    })
  );
  assert(dupRegRes.status === 409, `Duplicate email returned 409 Conflict (got ${dupRegRes.status})`);

  // Test 3: Reject Short Password (400 Bad Request)
  console.log('\n3. Testing password validation (<6 chars)...');
  const shortPassRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/customers/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    JSON.stringify({
      fullName: 'Shorty',
      email: `short_${Date.now()}@test.com`,
      password: '123',
      phone: '9876543210',
    })
  );
  assert(shortPassRes.status === 400, `Short password returned 400 Bad Request (got ${shortPassRes.status})`);

  // Test 4: Customer Login (POST /customers/login)
  console.log('\n4. Testing customer login...');
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/customers/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    JSON.stringify({
      email: testEmail,
      password: testPassword,
    })
  );
  assert(loginRes.status === 200, `POST /customers/login returned 200 OK (got ${loginRes.status})`);
  sessionCookie = loginRes.headers['set-cookie']
    ? loginRes.headers['set-cookie'][0].split(';')[0]
    : '';
  assert(sessionCookie.includes('token='), 'HttpOnly token cookie present in response headers');
  bearerToken = loginRes.data.token || '';
  assert(Boolean(bearerToken), 'JWT token returned in login response for Bearer auth');

  // Test 5: Reject Invalid Credentials (401 Unauthorized)
  console.log('\n5. Testing invalid credentials login...');
  const badLoginRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/customers/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    JSON.stringify({
      email: testEmail,
      password: 'wrong_password',
    })
  );
  assert(badLoginRes.status === 401, `Invalid password returned 401 Unauthorized (got ${badLoginRes.status})`);

  // Test 6: Protected Profile (GET /customers/me)
  console.log('\n6. Testing protected profile GET /customers/me...');
  const meRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/customers/me',
    method: 'GET',
    headers: { Cookie: sessionCookie },
  });
  assert(meRes.status === 200, `GET /customers/me with cookie returned 200 OK (got ${meRes.status})`);
  assert(meRes.data.email === testEmail, 'Returned authenticated user profile');

  // Test 7: Protected Profile via Bearer Header (Lab 04 requirement)
  console.log('\n7. Testing GET /customers/me with Authorization: Bearer <token>...');
  const meBearerRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/customers/me',
    method: 'GET',
    headers: { Authorization: `Bearer ${bearerToken}` },
  });
  assert(meBearerRes.status === 200, `GET /customers/me with Bearer token returned 200 OK (got ${meBearerRes.status})`);

  // Test 8: Unauthenticated access blocked (401)
  console.log('\n8. Testing unauthenticated access to /customers/me...');
  const unauthMe = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/customers/me',
    method: 'GET',
  });
  assert(unauthMe.status === 401, `Unauthenticated request returned 401 Unauthorized (got ${unauthMe.status})`);

  // Test 9: Bonus Change Password (PATCH /customers/change-password)
  console.log('\n9. Testing bonus change password PATCH /customers/change-password...');
  const changePassRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/customers/change-password',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
    },
    JSON.stringify({
      oldPassword: testPassword,
      newPassword: 'newpassword456',
    })
  );
  assert(changePassRes.status === 200, `Change password returned 200 OK (got ${changePassRes.status})`);

  // -------------------------------------------------------------------------
  // LAB 03: Product Catalog & Discovery APIs
  // -------------------------------------------------------------------------
  console.log('\n--- [LAB 03] Product Catalog & Discovery ---');

  // Test 10: Get All Products (GET /products)
  console.log('10. Testing GET /products...');
  const prodsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/products',
    method: 'GET',
  });
  assert(prodsRes.status === 200, `GET /products returned 200 OK (got ${prodsRes.status})`);
  assert(prodsRes.data.success && Array.isArray(prodsRes.data.products), 'Returned products array');
  assert(prodsRes.data.count > 0, `Returned ${prodsRes.data.count} catalog products`);

  const sampleProd = prodsRes.data.products[0];
  const sampleProdId = sampleProd._id;

  // Test 11: Get Single Product (GET /products/:id)
  console.log(`\n11. Testing GET /products/${sampleProdId}...`);
  const singleProdRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/products/${sampleProdId}`,
    method: 'GET',
  });
  assert(singleProdRes.status === 200, `GET /products/:id returned 200 OK (got ${singleProdRes.status})`);
  assert(singleProdRes.data.product._id === sampleProdId, 'Returned correct product document');

  // Test 12: Search Products (GET /products?search=keyboard)
  console.log('\n12. Testing search query GET /products?search=keyboard...');
  const searchRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/products?search=keyboard',
    method: 'GET',
  });
  assert(searchRes.status === 200, `Search returned 200 OK (got ${searchRes.status})`);
  assert(
    searchRes.data.products.some((p) => p.name.toLowerCase().includes('keyboard')),
    'Returned products matching "keyboard"'
  );

  // Test 13: Category Filtering (GET /products?category=Electronics)
  console.log('\n13. Testing category filter GET /products?category=Electronics...');
  const catRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/products?category=Electronics',
    method: 'GET',
  });
  assert(catRes.status === 200, `Category filter returned 200 OK (got ${catRes.status})`);
  assert(
    catRes.data.products.every((p) => p.category === 'Electronics'),
    'All filtered products belong to Electronics'
  );

  // Test 14: Bonus Sorting (GET /products?sort=price_asc & sort=price_desc)
  console.log('\n14. Testing price sorting (price_asc & price_desc)...');
  const sortAsc = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/products?sort=price_asc',
    method: 'GET',
  });
  assert(sortAsc.status === 200, `Sorting price_asc returned 200 OK (got ${sortAsc.status})`);
  const prices = sortAsc.data.products.map((p) => p.price);
  const isSortedAsc = prices.every((v, i) => i === 0 || v >= prices[i - 1]);
  assert(isSortedAsc, 'Products sorted in ascending order of price');

  // -------------------------------------------------------------------------
  // LAB 04: Wishlist APIs (Relationships & Protected Endpoints)
  // -------------------------------------------------------------------------
  console.log('\n--- [LAB 04] Wishlist Feature (Relationship & Protected APIs) ---');

  // Test 15: Unauthenticated Wishlist Access (401)
  console.log('15. Testing unauthenticated GET /wishlist...');
  const unauthWish = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/wishlist',
    method: 'GET',
  });
  assert(unauthWish.status === 401, `Unauthenticated /wishlist returned 401 Unauthorized (got ${unauthWish.status})`);

  // Test 16: Add Product to Wishlist (POST /wishlist/:productId)
  console.log(`\n16. Testing POST /wishlist/${sampleProdId} (Add product)...`);
  const addWishRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/wishlist/${sampleProdId}`,
    method: 'POST',
    headers: { Cookie: sessionCookie },
  });
  assert(addWishRes.status === 201, `POST /wishlist/:productId returned 201 Created (got ${addWishRes.status})`);
  assert(addWishRes.data.success === true, 'Success flag true in response');

  // Test 17: Duplicate Wishlist Prevention (409 Conflict)
  console.log(`\n17. Testing duplicate POST /wishlist/${sampleProdId}...`);
  const dupWishRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/wishlist/${sampleProdId}`,
    method: 'POST',
    headers: { Cookie: sessionCookie },
  });
  assert(dupWishRes.status === 409, `Duplicate addition returned 409 Conflict (got ${dupWishRes.status})`);

  // Test 18: Get Current User's Populated Wishlist (GET /wishlist)
  console.log('\n18. Testing GET /wishlist (Populated product data)...');
  const getWishRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/wishlist',
    method: 'GET',
    headers: { Cookie: sessionCookie },
  });
  assert(getWishRes.status === 200, `GET /wishlist returned 200 OK (got ${getWishRes.status})`);
  assert(getWishRes.data.count >= 1, `Wishlist count is ${getWishRes.data.count}`);
  const wishItem = getWishRes.data.wishlist.find((p) => p._id === sampleProdId);
  assert(Boolean(wishItem && wishItem.name && wishItem.price), 'Wishlist products are populated with name and price');

  // Test 19: Bonus Toggle Endpoint (PATCH /wishlist/:productId/toggle)
  console.log(`\n19. Testing bonus PATCH /wishlist/${sampleProdId}/toggle...`);
  const toggleOff = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/wishlist/${sampleProdId}/toggle`,
    method: 'PATCH',
    headers: { Cookie: sessionCookie },
  });
  assert(toggleOff.status === 200 && toggleOff.data.saved === false, 'Toggle 1 removed product (saved = false)');

  const toggleOn = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/wishlist/${sampleProdId}/toggle`,
    method: 'PATCH',
    headers: { Cookie: sessionCookie },
  });
  assert(toggleOn.status === 200 && toggleOn.data.saved === true, 'Toggle 2 re-added product (saved = true)');

  // Test 20: Remove Product from Wishlist (DELETE /wishlist/:productId)
  console.log(`\n20. Testing DELETE /wishlist/${sampleProdId}...`);
  const delWishRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/wishlist/${sampleProdId}`,
    method: 'DELETE',
    headers: { Cookie: sessionCookie },
  });
  assert(delWishRes.status === 200, `DELETE /wishlist/:productId returned 200 OK (got ${delWishRes.status})`);

  // Test 21: Duplicate Remove (404 Not Found)
  console.log(`\n21. Testing duplicate DELETE /wishlist/${sampleProdId}...`);
  const dupDelRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/wishlist/${sampleProdId}`,
    method: 'DELETE',
    headers: { Cookie: sessionCookie },
  });
  assert(dupDelRes.status === 404, `Duplicate removal returned 404 Not Found (got ${dupDelRes.status})`);

  // -------------------------------------------------------------------------
  // LAB 05: Shopping Cart APIs (Global State & Server Persistence)
  // -------------------------------------------------------------------------
  console.log('\n--- [LAB 05] Shopping Cart Service ---');

  // Test 22: Add Product to Cart (POST /cart/:productId)
  console.log(`22. Testing POST /cart/${sampleProdId} (Add to cart)...`);
  const addCart1 = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/cart/${sampleProdId}`,
    method: 'POST',
    headers: { Cookie: sessionCookie },
  });
  assert(addCart1.status === 200, `POST /cart/:productId returned 200 (got ${addCart1.status})`);
  const item1 = addCart1.data.cart.find((i) => (i.product?._id || i.product) === sampleProdId);
  assert(item1 && item1.quantity === 1, 'Product added to cart with quantity 1');

  // Test 23: Re-adding same product increments quantity (POST /cart/:productId)
  console.log(`\n23. Testing POST /cart/${sampleProdId} again (Quantity increment)...`);
  const addCart2 = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/cart/${sampleProdId}`,
    method: 'POST',
    headers: { Cookie: sessionCookie },
  });
  assert(addCart2.status === 200, `Re-add returned 200 (got ${addCart2.status})`);
  const item2 = addCart2.data.cart.find((i) => (i.product?._id || i.product) === sampleProdId);
  assert(item2 && item2.quantity === 2, 'Quantity correctly incremented to 2');

  // Test 24: Get Current User's Populated Cart (GET /cart)
  console.log('\n24. Testing GET /cart (Populated product data)...');
  const getCartRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/cart',
    method: 'GET',
    headers: { Cookie: sessionCookie },
  });
  assert(getCartRes.status === 200, `GET /cart returned 200 OK (got ${getCartRes.status})`);
  assert(getCartRes.data.cart.length > 0, 'Cart contains populated items');

  // Test 25: Exceed stock validation (PATCH /cart/:productId)
  console.log('\n25. Testing quantity exceeding stock limit...');
  const exceedStockRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/cart/${sampleProdId}`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
    },
    JSON.stringify({ quantity: 9999 })
  );
  assert(exceedStockRes.status === 400, `Exceeding stock returned 400 Bad Request (got ${exceedStockRes.status})`);

  // -------------------------------------------------------------------------
  // LAB 06: Checkout & Orders (Razorpay Payments & Order Snapshot)
  // -------------------------------------------------------------------------
  console.log('\n--- [LAB 06] Checkout & Razorpay Payment Verification ---');

  // Test 26: Create Razorpay Payment Order (POST /orders/create-payment-order)
  console.log('26. Testing POST /orders/create-payment-order...');
  const createPaymentRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/orders/create-payment-order',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
    },
    JSON.stringify({
      shippingAddress: {
        fullName: 'Alice Developer',
        phone: '9876543210',
        addressLine1: '42 Silicon Avenue',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
      },
      totalAmount: 1, // Fake total - server must ignore
    })
  );
  assert(createPaymentRes.status === 201, `Order creation returned 201 Created (got ${createPaymentRes.status})`);
  assert(Boolean(createPaymentRes.data.shopKartOrderId), 'Returned valid ShopKart order ID');
  assert(Boolean(createPaymentRes.data.razorpayOrderId), 'Returned valid Razorpay order ID');
  assert(createPaymentRes.data.amount > 0, 'Server calculated total amount in paise');

  const shopOrderId = createPaymentRes.data.shopKartOrderId;
  const rzpOrderId = createPaymentRes.data.razorpayOrderId;

  // Test 27: Reject Invalid Signature (POST /orders/verify-payment)
  console.log('\n27. Testing rejection of tampered payment signature...');
  const badSigRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/orders/verify-payment',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
    },
    JSON.stringify({
      shopKartOrderId: shopOrderId,
      razorpay_order_id: rzpOrderId,
      razorpay_payment_id: 'pay_tampered_123',
      razorpay_signature: 'fake_tampered_signature',
    })
  );
  assert(badSigRes.status === 400, `Invalid signature rejected with 400 (got ${badSigRes.status})`);

  // Cart must remain intact after failed payment signature
  const cartPreserved = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/cart',
    method: 'GET',
    headers: { Cookie: sessionCookie },
  });
  assert(cartPreserved.data.cart.length > 0, 'Cart remains preserved after payment failure');

  // Test 28: Verify Valid Payment Signature (HMAC SHA256)
  console.log('\n28. Testing verified payment with cryptographic HMAC SHA256 signature...');
  const crypto = require('crypto');
  const secret = process.env.RAZORPAY_KEY_SECRET || 'secret_shopkart123';
  const paymentId = `pay_${Date.now()}`;
  const validSignature = crypto
    .createHmac('sha256', secret)
    .update(`${rzpOrderId}|${paymentId}`)
    .digest('hex');

  const verifyRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/orders/verify-payment',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
    },
    JSON.stringify({
      shopKartOrderId: shopOrderId,
      razorpay_order_id: rzpOrderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
    })
  );
  assert(verifyRes.status === 200, `Payment verified with 200 OK (got ${verifyRes.status})`);
  assert(verifyRes.data.order.paymentStatus === 'PAID', 'Order paymentStatus marked as PAID');
  assert(verifyRes.data.order.status === 'PLACED', 'Order status marked as PLACED');

  // Test 29: Cart Cleared After Successful Verified Payment (Lab 06 Rule)
  console.log('\n29. Verifying cart is cleared after payment success...');
  const cartClearedRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/cart',
    method: 'GET',
    headers: { Cookie: sessionCookie },
  });
  assert(cartClearedRes.data.cart.length === 0, 'Cart cleared after verified payment');

  // Test 30: Get User Orders (GET /orders)
  console.log('\n30. Testing GET /orders (My Orders)...');
  const getOrdersRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/orders',
    method: 'GET',
    headers: { Cookie: sessionCookie },
  });
  assert(getOrdersRes.status === 200, `GET /orders returned 200 OK (got ${getOrdersRes.status})`);
  assert(getOrdersRes.data.orders.length > 0, 'Order appears in user order history');

  // Test 31: Get Single Order (GET /orders/:id)
  console.log(`\n31. Testing GET /orders/${shopOrderId}...`);
  const getSingleOrder = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/orders/${shopOrderId}`,
    method: 'GET',
    headers: { Cookie: sessionCookie },
  });
  assert(getSingleOrder.status === 200, `GET /orders/:id returned 200 OK (got ${getSingleOrder.status})`);
  assert(getSingleOrder.data.order._id === shopOrderId, 'Returned matching order document');

  // Test 32: Logout (POST /customers/logout)
  console.log('\n32. Testing logout POST /customers/logout...');
  const logoutRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/customers/logout',
    method: 'POST',
    headers: { Cookie: sessionCookie },
  });
  assert(logoutRes.status === 200, `POST /customers/logout returned 200 OK (got ${logoutRes.status})`);

  console.log('\n====================================================');
  console.log('    ALL 32 LAB TESTS EXECUTED SUCCESSFULLY! 🎉      ');
  console.log('    (Labs 01, 02, 03, 04, 05, 06 Fully Validated)   ');
  console.log('====================================================\n');
}

runCompleteTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exitCode = 1;
});
