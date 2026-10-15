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

async function runCartTests() {
  console.log('=== STARTING LAB 05 SHOPPING CART POSTMAN TEST PLAN ===\n');

  // Test 1: Unauthenticated request to /cart
  console.log('1. Testing Unauthenticated GET /api/cart...');
  const unauthRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/cart',
    method: 'GET',
  });
  console.log(`Status: ${unauthRes.status} (Expected: 401)`);
  console.log('Response:', unauthRes.data);

  // Test 2: Login to get session cookie
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
  console.log(`Status: ${loginRes.status}`);
  const cookie = loginRes.headers['set-cookie']
    ? loginRes.headers['set-cookie'][0].split(';')[0]
    : '';
  console.log('Obtained Cookie:', cookie ? 'Present (HttpOnly)' : 'Missing');

  const productId = '66d123abc456000000000002'; // RGB Mechanical Keyboard (stock: 12)

  // Test 3: Add new item to cart
  console.log(`\n3. Testing POST /api/cart/${productId} (Add new item, expected qty 1)...`);
  const add1 = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/cart/${productId}`,
    method: 'POST',
    headers: { Cookie: cookie },
  });
  console.log(`Status: ${add1.status} (Expected: 200)`);
  const item1 = add1.data.cart?.find(i => (i.product?._id || i.product) === productId);
  console.log('Cart Item Quantity:', item1?.quantity, '(Expected: 1)');

  // Test 4: Add same item again (increment quantity)
  console.log(`\n4. Testing POST /api/cart/${productId} again (Increment quantity, expected qty 2)...`);
  const add2 = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/cart/${productId}`,
    method: 'POST',
    headers: { Cookie: cookie },
  });
  console.log(`Status: ${add2.status} (Expected: 200)`);
  const item2 = add2.data.cart?.find(i => (i.product?._id || i.product) === productId);
  console.log('Cart Item Quantity:', item2?.quantity, '(Expected: 2)');

  // Test 5: Get Cart
  console.log('\n5. Testing GET /api/cart...');
  const getRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/cart',
    method: 'GET',
    headers: { Cookie: cookie },
  });
  console.log(`Status: ${getRes.status} (Expected: 200)`);
  console.log('Cart Items Count:', getRes.data.count);
  console.log('Items in Cart:', getRes.data.cart?.map(i => ({
    productName: i.product?.name,
    price: i.product?.price,
    quantity: i.quantity,
    lineTotal: (i.product?.price || 0) * i.quantity,
  })));

  // Test 6: Update quantity
  console.log(`\n6. Testing PATCH /api/cart/${productId} with quantity 3...`);
  const updateRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/cart/${productId}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
    },
    JSON.stringify({ quantity: 3 })
  );
  console.log(`Status: ${updateRes.status} (Expected: 200)`);
  const item3 = updateRes.data.cart?.find(i => (i.product?._id || i.product) === productId);
  console.log('Updated Quantity:', item3?.quantity, '(Expected: 3)');

  // Test 7: Exceed stock limit (Stock is 12, requesting 50)
  console.log(`\n7. Testing PATCH /api/cart/${productId} exceeding stock (quantity: 50)...`);
  const exceedRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/cart/${productId}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
    },
    JSON.stringify({ quantity: 50 })
  );
  console.log(`Status: ${exceedRes.status} (Expected: 400 Bad Request)`);
  console.log('Response:', exceedRes.data);

  // Test 8: Remove item from cart
  console.log(`\n8. Testing DELETE /api/cart/${productId}...`);
  const delRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/cart/${productId}`,
    method: 'DELETE',
    headers: { Cookie: cookie },
  });
  console.log(`Status: ${delRes.status} (Expected: 200)`);
  console.log('Cart Items Remaining:', delRes.data.cart?.length, '(Expected: 0)');

  // Test 9: Remove non-existent item (404 Not Found)
  console.log(`\n9. Testing DELETE /api/cart/${productId} again...`);
  const delAgain = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/cart/${productId}`,
    method: 'DELETE',
    headers: { Cookie: cookie },
  });
  console.log(`Status: ${delAgain.status} (Expected: 404 Not Found)`);
  console.log('Response:', delAgain.data);

  console.log('\n=== ALL LAB 05 SHOPPING CART TESTS COMPLETED SUCCESSFULLY ===');
}

runCartTests().catch(console.error);
