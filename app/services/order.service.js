const Order = require('../models/order.model.js');
const Counter = require('../models/counter.model.js');
const settingsService = require('./settings.service.js');

const VALID_TABLE_ERROR = 'Enter the valid table number';

// GET NEXT ORDER NUMBER WITH ATOMIC UPDATE
const getNextOrderNumber = async () => {
    const counter = await Counter.findOneAndUpdate(
        { name: 'orderCounter' },
        { $inc: { count: 1 } },
        { new: true, upsert: true }
    );

    return `#${counter.count}`;
};

// CREATE ORDER
exports.createOrder = async (userId, items, totalAmount, notes, table) => {
    if (!items || items.length === 0) {
        throw new Error('Order must contain at least one item');
    }

    if (!totalAmount || totalAmount <= 0) {
        throw new Error('Total amount must be greater than 0');
    }

    const { maxTables } = await settingsService.getSettings();
    const tableNum = parseInt(String(table || '').trim(), 10);

    if (!table || isNaN(tableNum) || tableNum < 1 || tableNum > maxTables) {
        throw new Error(VALID_TABLE_ERROR);
    }

    // Get daily order number with atomic update
    const orderNumber = await getNextOrderNumber();
    const orderDate = new Date();

    const order = new Order({
        orderNumber,
        orderDate,
        userId,
        items,
        totalAmount,
        notes: notes || '',
        table: String(tableNum),
        status: 'pending',
        paymentStatus: 'pending'
    });

    await order.save();
    
    // Populate user and product details
    await order.populate('userId', 'name email phone');
    for (let item of order.items) {
        if (item.productId) {
            const product = await require('../models/product.model.js').findById(item.productId);
            if (product && !item.image) {
                item.image = product.image;
            }
        }
    }

    return order;
};

// GET ALL ORDERS (with filters)
exports.getAllOrders = async (status = null, userId = null) => {
    let query = {};

    if (status) {
        query.status = status;
    }

    if (userId) {
        query.userId = userId;
    }

    const orders = await Order.find(query)
        .populate('userId', 'name email phone')
        .populate('items.productId', 'name emoji')
        .sort({ createdAt: -1 });

    return orders;
};

// GET ORDER BY ID
exports.getOrderById = async (orderId) => {
    const order = await Order.findById(orderId)
        .populate('userId', 'name email phone')
        .populate('items.productId', 'name emoji');

    if (!order) {
        throw new Error('Order not found');
    }

    return order;
};

// GET ORDER BY ORDER NUMBER
exports.getOrderByOrderNumber = async (orderNumber) => {
    const order = await Order.findOne({ orderNumber })
        .populate('userId', 'name email phone')
        .populate('items.productId', 'name emoji');

    if (!order) {
        throw new Error('Order not found');
    }

    return order;
};

// UPDATE ORDER STATUS
exports.updateOrderStatus = async (orderId, status) => {
    const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
    }

    const order = await Order.findByIdAndUpdate(
        orderId,
        { status, updatedAt: new Date() },
        { new: true }
    ).populate('userId', 'name email phone');

    if (!order) {
        throw new Error('Order not found');
    }

    return order;
};

// UPDATE PAYMENT STATUS
exports.updatePaymentStatus = async (orderId, paymentStatus) => {
    const validPaymentStatuses = ['pending', 'completed', 'failed'];

    if (!validPaymentStatuses.includes(paymentStatus)) {
        throw new Error('Invalid payment status');
    }

    const order = await Order.findByIdAndUpdate(
        orderId,
        { paymentStatus, updatedAt: new Date() },
        { new: true }
    ).populate('userId', 'name email phone');

    if (!order) {
        throw new Error('Order not found');
    }

    return order;
};

// DELETE ORDER
exports.deleteOrder = async (orderId) => {
    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
        throw new Error('Order not found');
    }

    return { message: 'Order deleted successfully' };
};

// GET ORDER STATISTICS
exports.getOrderStats = async () => {
    const stats = await Order.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$totalAmount' }
            }
        }
    ]);

    return stats;
};

// GET TODAY'S ORDERS
exports.getTodaysOrders = async (status = null) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let query = {
        orderDate: {
            $gte: today,
            $lt: tomorrow
        }
    };

    if (status) {
        query.status = status;
    }

    const orders = await Order.find(query)
        .populate('userId', 'name email phone')
        .populate('items.productId', 'name emoji')
        .sort({ createdAt: -1 });

    return orders;
};

// GET TODAY'S DASHBOARD STATISTICS
exports.getTodaysStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const query = {
        orderDate: {
            $gte: today,
            $lt: tomorrow
        }
    };

    // Get stats grouped by status
    const statusStats = await Order.aggregate([
        {
            $match: query
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$totalAmount' }
            }
        }
    ]);

    // Initialize all status counts
    const stats = {
        totalOrders: 0,
        pendingOrders: 0,
        preparingOrders: 0,
        readyOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0
    };

    // Process status stats
    statusStats.forEach(stat => {
        stats.totalOrders += stat.count;
        stats.totalRevenue += stat.totalAmount;

        switch (stat._id) {
            case 'pending':
                stats.pendingOrders = stat.count;
                break;
            case 'preparing':
                stats.preparingOrders = stat.count;
                break;
            case 'ready':
                stats.readyOrders = stat.count;
                break;
            case 'completed':
                stats.completedOrders = stat.count;
                break;
            case 'cancelled':
                stats.cancelledOrders = stat.count;
                break;
        }
    });

    return stats;
};

exports.getOverallStats = async () => {
    const totalOrders = await Order.countDocuments();

    const totalRevenueAgg = await Order.aggregate([
        {
            $group: {
                _id: null,
                revenue: { $sum: '$totalAmount' }
            }
        }
    ]);

    const latestOrder = await Order.findOne()
        .sort({ createdAt: -1 });

    return {
        totalOrders,
        totalRevenue: totalRevenueAgg[0]?.revenue || 0,
        latestOrder: latestOrder?.orderNumber || '#0'
    };
};