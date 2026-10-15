const http = require('http');
const crypto = require('crypto');

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

async function runOrderTests() {
  console.log('========================================================');
  console.log('  STARTING LAB 06 CHECKOUT & ORDERS POSTMAN TEST PLAN  ');
  console.log('========================================================\n');

  // 1. Unauthenticated request to /orders
  console.log('1. Testing Unauthenticated GET /api/orders...');
  const unauthRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/orders',
    method: 'GET',
  });
  assert(unauthRes.status === 401, `Unauthenticated request returned 401 (got ${unauthRes.status})`);

  // 2. Login to get customer session
  console.log('\n2. Logging in customer john@gmail.com...');
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/customers/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    JSON.stringify({ email: 'john@gmail.com', password: 'password123' })
  );
  assert(loginRes.status === 200, 'Customer logged in successfully');
  const cookie = loginRes.headers['set-cookie']
    ? loginRes.headers['set-cookie'][0].split(';')[0]
    : '';

  // 3. Test Empty Cart Checkout (Test 1 in Lab 06: Expected 400)
  console.log('\n3. Testing checkout with empty cart...');
  const emptyCartRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders/create-payment-order',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
    },
    JSON.stringify({
      shippingAddress: {
        fullName: 'John Doe',
        phone: '9876543210',
        addressLine1: '22 MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
      },
    })
  );
  assert(emptyCartRes.status === 400, `Empty cart checkout rejected with 400 Bad Request (got ${emptyCartRes.status})`);

  // 4. Add items to cart (RGB Mechanical Keyboard, stock: 12, price: 2999)
  const productId = '66d123abc456000000000002';
  console.log(`\n4. Adding product ${productId} to cart...`);
  await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/cart/${productId}`,
    method: 'POST',
    headers: { Cookie: cookie },
  });

  // 5. Create Payment Order (POST /orders/create-payment-order)
  console.log('\n5. Creating Razorpay payment order (server-side total & paise conversion)...');
  const createOrderRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders/create-payment-order',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
    },
    JSON.stringify({
      shippingAddress: {
        fullName: 'John Doe',
        phone: '9876543210',
        addressLine1: '22 MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
      },
      totalAmount: 1, // Intentional fake frontend total to test server ignores it
    })
  );
  assert(createOrderRes.status === 201, `Payment order created with 201 Created (got ${createOrderRes.status})`);
  assert(Boolean(createOrderRes.data.shopKartOrderId), 'Returned valid ShopKart order ID');
  assert(Boolean(createOrderRes.data.razorpayOrderId), 'Returned valid Razorpay order ID');
  assert(createOrderRes.data.amount === 299900, `Server correctly computed total in paise (299900 paise, got ${createOrderRes.data.amount})`);
  assert(createOrderRes.data.currency === 'INR', 'Currency is INR');

  const shopKartOrderId = createOrderRes.data.shopKartOrderId;
  const razorpayOrderId = createOrderRes.data.razorpayOrderId;

  // 6. Test Cart before payment verification (Test 3 in Lab 06: Cart should still contain items)
  console.log('\n6. Checking cart before payment verification (must remain populated)...');
  const cartBeforeVerify = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/cart',
    method: 'GET',
    headers: { Cookie: cookie },
  });
  assert(cartBeforeVerify.data.cart.length > 0, 'Cart remains intact before payment verification');

  // 7. Test Invalid Payment Signature (Test B in Lab 06: Expected 400, no cart clearing)
  console.log('\n7. Testing invalid payment signature rejection...');
  const badSigRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders/verify-payment',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
    },
    JSON.stringify({
      shopKartOrderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: 'pay_fake123',
      razorpay_signature: 'invalid_tampered_signature',
    })
  );
  assert(badSigRes.status === 400, `Invalid signature rejected with 400 (got ${badSigRes.status})`);

  // Cart should still remain uncleared after failed payment signature
  const cartAfterFailedSig = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/cart',
    method: 'GET',
    headers: { Cookie: cookie },
  });
  assert(cartAfterFailedSig.data.cart.length > 0, 'Cart remains preserved after invalid payment signature');

  // 8. Test Valid Payment Signature (HMAC SHA256 Verification)
  console.log('\n8. Testing verified payment with cryptographic HMAC SHA256 signature...');
  const secret = process.env.RAZORPAY_KEY_SECRET || 'secret_shopkart123';
  const paymentId = `pay_${Date.now()}`;
  const validSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpayOrderId}|${paymentId}`)
    .digest('hex');

  const verifyRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders/verify-payment',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
    },
    JSON.stringify({
      shopKartOrderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
    })
  );
  assert(verifyRes.status === 200, `Payment verified with 200 OK (got ${verifyRes.status})`);
  assert(verifyRes.data.order.paymentStatus === 'PAID', 'Order paymentStatus marked as PAID');
  assert(verifyRes.data.order.status === 'PLACED', 'Order status marked as PLACED');

  // 9. Test Cart cleared after verified payment (Test 5 in Lab 06: Cart must be empty)
  console.log('\n9. Verifying user cart is cleared after successful payment...');
  const cartAfterSuccess = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/cart',
    method: 'GET',
    headers: { Cookie: cookie },
  });
  assert(cartAfterSuccess.data.cart.length === 0, 'Cart is cleared after verified payment');

  // 10. Test Get My Orders (GET /orders)
  console.log('\n10. Testing GET /api/orders (My Orders)...');
  const ordersRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/orders',
    method: 'GET',
    headers: { Cookie: cookie },
  });
  assert(ordersRes.status === 200, `GET /orders returned 200 OK (got ${ordersRes.status})`);
  assert(ordersRes.data.orders.length > 0, `Returned ${ordersRes.data.orders.length} orders`);
  const myOrder = ordersRes.data.orders.find((o) => o._id === shopKartOrderId);
  assert(Boolean(myOrder), 'Created order appears in My Orders list');
  assert(myOrder.items[0].price === 2999, 'Order items preserve historical price snapshot');

  // 11. Test Get Single Order (GET /orders/:id)
  console.log(`\n11. Testing GET /api/orders/${shopKartOrderId}...`);
  const singleOrderRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/orders/${shopKartOrderId}`,
    method: 'GET',
    headers: { Cookie: cookie },
  });
  assert(singleOrderRes.status === 200, `Single order retrieved with 200 OK (got ${singleOrderRes.status})`);
  assert(singleOrderRes.data.order._id === shopKartOrderId, 'Returned matching order document');

  // 12. Test Bonus Status Progression (PATCH /orders/:id/status)
  console.log(`\n12. Testing bonus order status progression PATCH /api/orders/${shopKartOrderId}/status...`);
  const statusRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/orders/${shopKartOrderId}/status`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
    },
    JSON.stringify({ status: 'SHIPPED' })
  );
  assert(statusRes.status === 200, `Order status updated to SHIPPED (got ${statusRes.status})`);
  assert(statusRes.data.order.status === 'SHIPPED', 'Updated status confirmed');

  console.log('\n========================================================');
  console.log('  ALL LAB 06 CHECKOUT & ORDERS TESTS COMPLETED! 🎉     ');
  console.log('========================================================\n');
}

runOrderTests().catch(console.error);
