const Food = require('../models/Food');

// @desc    Get all foods
// @route   GET /api/foods
// @access  Public
const getFoods = async (req, res) => {
  const keyword = req.query.keyword
    ? {
        name: { $regex: req.query.keyword, $options: 'i' },
      }
    : {};

  const foods = await Food.find({ ...keyword, isAvailable: true });
  res.json(foods);
};

// @desc    Get single food by ID
// @route   GET /api/foods/:id
// @access  Public
const getFoodById = async (req, res) => {
  const food = await Food.findById(req.params.id);
  if (food) {
    res.json(food);
  } else {
    res.status(404);
    throw new Error('Food not found');
  }
};

// @desc    Create a food (admin only)
// @route   POST /api/foods
// @access  Private/Admin
const createFood = async (req, res) => {
  const { name, description, price, category, image } = req.body;
  const food = new Food({
    name,
    description,
    price,
    category,
    image,
  });
  const createdFood = await food.save();
  res.status(201).json(createdFood);
};

// @desc    Update food (admin only)
// @route   PUT /api/foods/:id
// @access  Private/Admin
const updateFood = async (req, res) => {
  const food = await Food.findById(req.params.id);
  if (food) {
    food.name = req.body.name || food.name;
    food.description = req.body.description || food.description;
    food.price = req.body.price || food.price;
    food.category = req.body.category || food.category;
    food.image = req.body.image || food.image;
    food.isAvailable = req.body.isAvailable !== undefined ? req.body.isAvailable : food.isAvailable;
    const updatedFood = await food.save();
    res.json(updatedFood);
  } else {
    res.status(404);
    throw new Error('Food not found');
  }
};

// @desc    Delete food (admin only)
// @route   DELETE /api/foods/:id
// @access  Private/Admin
const deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }
    // Use deleteOne() instead of remove() (deprecated)
    await Food.deleteOne({ _id: req.params.id });
    res.json({ message: 'Food removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFoods, getFoodById, createFood, updateFood, deleteFood };
