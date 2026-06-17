const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');

// Apply authentication middleware to all routes
router.use(authMiddleware.authenticateToken);

// CREATE ORDER
router.post('/create', orderController.createOrder);

// GET ALL ORDERS (with optional filters)
router.get('/all', orderController.getAllOrders);

// GET TODAY'S ORDERS (with optional status filter)
router.get('/today/list', orderController.getTodaysOrders);

// GET TODAY'S DASHBOARD STATISTICS
router.get('/today/stats', orderController.getTodaysDashboardStats);

// GET ORDER STATISTICS (all time)
router.get('/stats/summary', orderController.getOrderStats);

// GET ORDER BY ID
router.get('/:orderId', orderController.getOrderById);

// GET ORDER BY ORDER NUMBER
router.get('/search/number', orderController.getOrderByOrderNumber);

// UPDATE ORDER STATUS
router.put('/status', orderController.updateOrderStatus);

// UPDATE PAYMENT STATUS
router.put('/payment-status', orderController.updatePaymentStatus);

// DELETE ORDER
router.delete('/:orderId', orderController.deleteOrder);

module.exports = router;
