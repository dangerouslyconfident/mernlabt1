const Razorpay = require('razorpay');

const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_shopkart123';
const keySecret = process.env.RAZORPAY_KEY_SECRET || 'secret_shopkart123';

let razorpay = null;
try {
  razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
} catch (err) {
  console.warn('Razorpay SDK notice:', err.message);
}

module.exports = razorpay;
