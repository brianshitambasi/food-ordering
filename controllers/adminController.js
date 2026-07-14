const Order = require('../models/Order');
const User = require('../models/User');
const Food = require('../models/Food');

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  const orders = await Order.find({}).populate('user', 'name email');
  res.json(orders);
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
};

// @desc    Get all foods (admin)
// @route   GET /api/admin/foods
// @access  Private/Admin
const getAllFoodsAdmin = async (req, res) => {
  const foods = await Food.find({});
  res.json(foods);
};

module.exports = { getAllOrders, getAllUsers, getAllFoodsAdmin };
