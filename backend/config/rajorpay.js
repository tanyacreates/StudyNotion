const Rajorpay = require('razorpay');
require('dotenv').config();

// The Razorpay constructor throws synchronously if key_id/key_secret are missing.
// At module load that would crash the whole (serverless) function. Only instantiate
// when real keys are present; otherwise export a null instance. The payments
// controller already falls back to dev-mode direct enrollment when Razorpay isn't
// configured, so a null instance is safe.
const hasKeys =
    process.env.RAZORPAY_KEY &&
    process.env.RAZORPAY_KEY !== 'rzp_test_placeholder' &&
    process.env.RAZORPAY_SECRET &&
    process.env.RAZORPAY_SECRET !== 'placeholder_secret';

exports.instance = hasKeys
    ? new Rajorpay({
          key_id: process.env.RAZORPAY_KEY,
          key_secret: process.env.RAZORPAY_SECRET,
      })
    : null;
