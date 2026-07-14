const express = require('express');
const { getAllOrders, getAllUsers, getAllFoodsAdmin } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.get('/orders', protect, admin, getAllOrders);
router.get('/users', protect, admin, getAllUsers);
router.get('/foods', protect, admin, getAllFoodsAdmin);

module.exports = router;
