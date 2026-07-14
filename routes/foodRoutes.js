const express = require('express');
const { getFoods, getFoodById, createFood, updateFood, deleteFood } = require('../controllers/foodController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(getFoods).post(protect, admin, createFood);
router.route('/:id').get(getFoodById).put(protect, admin, updateFood).delete(protect, admin, deleteFood);

module.exports = router;
