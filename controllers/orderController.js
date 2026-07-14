const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { stkPush, queryStatus } = require('../utils/mpesa');

const createOrder = async (req, res) => {
  try {
    const { shippingAddress, phone, paymentMethod, items, totalAmount } = req.body;

    let orderItems = items;
    let calculatedTotal = totalAmount;

    if (!orderItems || orderItems.length === 0) {
      const cart = await Cart.findOne({ user: req.user._id }).populate('items.food');
      if (!cart || cart.items.length === 0) {
        res.status(400);
        throw new Error('Cart is empty');
      }
      orderItems = cart.items.map((item) => ({
        food: item.food._id,
        name: item.food.name,
        price: item.food.price,
        quantity: item.quantity,
      }));
      calculatedTotal = cart.items.reduce((acc, item) => acc + item.food.price * item.quantity, 0);
    }

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount: calculatedTotal,
      shippingAddress,
      phone,
      paymentMethod: paymentMethod || 'mpesa',
      status: 'placed',
      isPaid: false,
    });

    const createdOrder = await order.save();
    
    // Clear the user's cart after order placement
    await Cart.findOneAndDelete({ user: req.user._id });

    // If payment method is M-Pesa, initiate STK Push
    if (paymentMethod === 'mpesa') {
      try {
        const mpesaResponse = await stkPush(phone, calculatedTotal, createdOrder._id);
        createdOrder.mpesaCheckoutRequestID = mpesaResponse.CheckoutRequestID;
        await createdOrder.save();
        
        res.status(201).json({
          order: createdOrder,
          mpesaResponse,
          message: 'M-Pesa payment initiated. Please check your phone.',
        });
      } catch (mpesaError) {
        console.error('M-Pesa initiation failed:', mpesaError.message);
        res.status(201).json({
          order: createdOrder,
          message: 'Order created but M-Pesa payment initiation failed. Please try again.',
          error: mpesaError.message,
        });
      }
    } else {
      res.status(201).json(createdOrder);
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
};

const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
};

const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (order) {
    order.status = status;
    if (status === 'delivered') {
      order.deliveredAt = Date.now();
    }
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
};

const updateOrderToPaid = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id || 'PAYMENT_ID',
      status: 'completed',
      update_time: new Date().toISOString(),
      email_address: req.user.email,
    };
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
};

const getPaymentStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    
    if (!order.mpesaCheckoutRequestID) {
      res.status(400);
      throw new Error('No M-Pesa transaction found for this order');
    }
    
    const status = await queryStatus(order.mpesaCheckoutRequestID);
    res.json(status);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

module.exports = { 
  createOrder, 
  getOrderById, 
  getMyOrders, 
  updateOrderStatus, 
  updateOrderToPaid,
  getPaymentStatus
};
