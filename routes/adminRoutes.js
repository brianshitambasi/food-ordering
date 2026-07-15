const express = require('express');
const { 
  getAllOrders, 
  getAllUsers, 
  getAllFoodsAdmin,
  deleteUser,
  deleteOrder
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.get('/orders', protect, admin, getAllOrders);
router.get('/users', protect, admin, getAllUsers);
router.get('/foods', protect, admin, getAllFoodsAdmin);
router.delete('/users/:id', protect, admin, deleteUser);
router.delete('/orders/:id', protect, admin, deleteOrder);

module.exports = router;
