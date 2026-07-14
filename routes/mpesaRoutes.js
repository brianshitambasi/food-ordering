const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

// M-Pesa Callback URL
router.post('/callback', async (req, res) => {
  console.log('M-Pesa Callback received:', JSON.stringify(req.body, null, 2));
  
  try {
    const { Body } = req.body;
    
    if (Body.stkCallback.ResultCode === 0) {
      // Payment successful
      const { MerchantRequestID, CheckoutRequestID, ResultDesc } = Body.stkCallback;
      
      // Find order with this checkout request ID
      const order = await Order.findOne({ mpesaCheckoutRequestID: CheckoutRequestID });
      
      if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: CheckoutRequestID,
          status: 'completed',
          update_time: new Date().toISOString(),
          email_address: order.user.email,
          merchantRequestID: MerchantRequestID,
        };
        await order.save();
        console.log(`Order ${order._id} marked as paid successfully`);
        
        // Clear cart
        await Cart.findOneAndDelete({ user: order.user });
      }
    } else {
      // Payment failed
      console.log('Payment failed:', Body.stkCallback.ResultDesc);
    }
    
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    console.error('Callback error:', error.message);
    res.json({ ResultCode: 1, ResultDesc: 'Failed' });
  }
});

module.exports = router;
