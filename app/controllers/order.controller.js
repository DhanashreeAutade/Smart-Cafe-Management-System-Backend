const orderService = require('../services/order.service.js');

// CREATE ORDER
exports.createOrder = async (req, res) => {
    try {
        const { items, totalAmount, notes, table } = req.body;
        const userId = req.user.id;

        const order = await orderService.createOrder(
            userId,
            items,
            totalAmount,
            notes,
            table
        );

        // Emit real-time event to all connected clients
        req.io.emit('newOrder', {
            _id: String(order._id),
            orderNumber: order.orderNumber,
            userId: order.userId,
            items: order.items,
            totalAmount: order.totalAmount,
            status: order.status,
            notes: order.notes,
            table: order.table,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        });

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// GET ALL ORDERS
exports.getAllOrders = async (req, res) => {
    try {
        const { status, userId } = req.query;

        let queryUserId = null;
        if (userId === 'me') {
            queryUserId = req.user.id;
        } else if (userId) {
            queryUserId = userId;
        }

        const orders = await orderService.getAllOrders(status, queryUserId);

        res.json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// GET ORDER BY ID
exports.getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await orderService.getOrderById(orderId);

        res.json({
            success: true,
            order
        });
    } catch (err) {
        res.status(404).json({
            success: false,
            error: err.message
        });
    }
};

// GET ORDER BY ORDER NUMBER
exports.getOrderByOrderNumber = async (req, res) => {
    try {
        const { orderNumber } = req.query;

        if (!orderNumber) {
            return res.status(400).json({
                success: false,
                error: 'Order number is required'
            });
        }

        const order = await orderService.getOrderByOrderNumber(orderNumber);

        res.json({
            success: true,
            order
        });
    } catch (err) {
        res.status(404).json({
            success: false,
            error: err.message
        });
    }
};

// UPDATE ORDER STATUS
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({
                success: false,
                error: 'Order ID and status are required'
            });
        }

        const order = await orderService.updateOrderStatus(orderId, status);

        // Emit real-time update event
        req.io.emit('orderStatusUpdated', {
            _id: String(order._id),
            orderNumber: order.orderNumber,
            status: order.status,
            updatedAt: order.updatedAt
        });

        res.json({
            success: true,
            message: 'Order status updated',
            order
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// UPDATE PAYMENT STATUS
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { orderId, paymentStatus } = req.body;

        if (!orderId || !paymentStatus) {
            return res.status(400).json({
                success: false,
                error: 'Order ID and payment status are required'
            });
        }

        const order = await orderService.updatePaymentStatus(orderId, paymentStatus);

        // Emit real-time update event
        req.io.emit('paymentStatusUpdated', {
            _id: order._id,
            orderNumber: order.orderNumber,
            paymentStatus: order.paymentStatus,
            updatedAt: order.updatedAt
        });

        res.json({
            success: true,
            message: 'Payment status updated',
            order
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// DELETE ORDER
exports.deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        const result = await orderService.deleteOrder(orderId);

        // Emit real-time delete event
        req.io.emit('orderDeleted', { orderId });

        res.json({
            success: true,
            message: result.message
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// GET ORDER STATISTICS
exports.getOrderStats = async (req, res) => {
    try {
        const stats = await orderService.getOrderStats();

        res.json({
            success: true,
            stats
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// GET TODAY'S ORDERS
exports.getTodaysOrders = async (req, res) => {
    try {
        const { status } = req.query;

        const orders = await orderService.getTodaysOrders(status);

        res.json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// GET TODAY'S DASHBOARD STATISTICS
exports.getTodaysDashboardStats = async (req, res) => {
    try {
        const stats = await orderService.getTodaysStats();

        res.json({
            success: true,
            stats
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};
