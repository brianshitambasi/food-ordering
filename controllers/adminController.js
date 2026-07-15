const Order = require('../models/Order');
const User = require('../models/User');
const Food = require('../models/Food');

const getAllOrders = async (req, res) => {
  const orders = await Order.find({}).populate('user', 'name email');
  res.json(orders);
};

const getAllUsers = async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
};

const getAllFoodsAdmin = async (req, res) => {
  const foods = await Food.find({});
  res.json(foods);
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin user' });
    }
    
    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    await Order.findByIdAndDelete(id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getAllOrders, getAllUsers, getAllFoodsAdmin, deleteUser, deleteOrder };
