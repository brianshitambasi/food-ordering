const Cart = require('../models/Cart');
const Food = require('../models/Food');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.food');
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }
  res.json(cart);
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  const { foodId, quantity } = req.body;
  const food = await Food.findById(foodId);
  if (!food || !food.isAvailable) {
    res.status(404);
    throw new Error('Food not available');
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.food.toString() === foodId
  );
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ food: foodId, quantity });
  }

  await cart.save();
  await cart.populate('items.food');
  res.status(201).json(cart);
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:foodId
// @access  Private
const updateCartItem = async (req, res) => {
  const { foodId } = req.params;
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const item = cart.items.find((item) => item.food.toString() === foodId);
  if (!item) {
    res.status(404);
    throw new Error('Item not in cart');
  }

  if (quantity <= 0) {
    cart.items = cart.items.filter((item) => item.food.toString() !== foodId);
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  await cart.populate('items.food');
  res.json(cart);
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:foodId
// @access  Private
const removeFromCart = async (req, res) => {
  const { foodId } = req.params;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter((item) => item.food.toString() !== foodId);
  await cart.save();
  await cart.populate('items.food');
  res.json(cart);
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  res.json({ message: 'Cart cleared' });
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
