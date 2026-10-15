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

async function runTests() {
  console.log('=== STARTING LAB 04 POSTMAN TEST PLAN ===\n');

  // Test 1: Unauthenticated request to /wishlist
  console.log('1. Testing Unauthenticated GET /api/wishlist...');
  const unauthRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/wishlist',
    method: 'GET',
  });
  console.log(`Status: ${unauthRes.status} (Expected: 401)`);
  console.log('Response:', unauthRes.data);

  // Test 2: Login to get cookie
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

  const productId = '66d123abc456000000000001';

  // Test 3: Add to Wishlist
  console.log(`\n3. Testing POST /api/wishlist/${productId} (Add product)...`);
  const addRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/wishlist/${productId}`,
    method: 'POST',
    headers: { Cookie: cookie },
  });
  console.log(`Status: ${addRes.status} (Expected: 201)`);
  console.log('Response:', addRes.data);

  // Test 4: Duplicate prevention (409 Conflict)
  console.log(`\n4. Testing Duplicate POST /api/wishlist/${productId}...`);
  const dupRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/wishlist/${productId}`,
    method: 'POST',
    headers: { Cookie: cookie },
  });
  console.log(`Status: ${dupRes.status} (Expected: 409 Conflict)`);
  console.log('Response:', dupRes.data);

  // Test 5: Get Wishlist (Populated)
  console.log('\n5. Testing GET /api/wishlist...');
  const getRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/wishlist',
    method: 'GET',
    headers: { Cookie: cookie },
  });
  console.log(`Status: ${getRes.status} (Expected: 200)`);
  console.log('Count:', getRes.data.count);
  console.log('Items:', getRes.data.wishlist.map(p => ({ id: p._id, name: p.name, price: p.price })));

  // Test 6: Remove from Wishlist
  console.log(`\n6. Testing DELETE /api/wishlist/${productId}...`);
  const delRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/wishlist/${productId}`,
    method: 'DELETE',
    headers: { Cookie: cookie },
  });
  console.log(`Status: ${delRes.status} (Expected: 200)`);
  console.log('Response:', delRes.data);

  // Test 7: Remove non-existent item (404 Not Found)
  console.log(`\n7. Testing Duplicate DELETE /api/wishlist/${productId}...`);
  const delAgainRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/wishlist/${productId}`,
    method: 'DELETE',
    headers: { Cookie: cookie },
  });
  console.log(`Status: ${delAgainRes.status} (Expected: 404 Not Found)`);
  console.log('Response:', delAgainRes.data);

  // Test 8: Bonus Challenge - Toggle Wishlist
  console.log(`\n8. Testing Bonus PATCH /api/wishlist/${productId}/toggle...`);
  const toggle1 = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/wishlist/${productId}/toggle`,
    method: 'PATCH',
    headers: { Cookie: cookie },
  });
  console.log('Toggle 1 (Saved):', toggle1.data);

  const toggle2 = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/wishlist/${productId}/toggle`,
    method: 'PATCH',
    headers: { Cookie: cookie },
  });
  console.log('Toggle 2 (Removed):', toggle2.data);

  console.log('\n=== ALL LAB 04 TESTS COMPLETED SUCCESSFULLY ===');
}

runTests().catch(console.error);
