const express = require('express');
const { createOrder, getOrderById, getMyOrders, updateOrderStatus, updateOrderToPaid } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.route('/').post(protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/pay', protect, updateOrderToPaid);
router.get('/:id', protect, getOrderById);

module.exports = router;
