"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.updateOrderStatus = exports.getAllOrders = exports.cancelOrder = exports.getOrderById = exports.getMyOrders = exports.placeOrder = void 0;
const Order_1 = require("../models/Order");
const errorHandler_1 = require("../middleware/errorHandler");
const generateOrderNumber = async () => {
    const year = new Date().getFullYear(), month = String(new Date().getMonth() + 1).padStart(2, '0');
    const count = await Order_1.Order.countDocuments({ createdAt: { $gte: new Date(`${year}-${month}-01`) } });
    return `RJ-${year}${month}-${String(count + 1).padStart(4, '0')}`;
};
// ── Place Order ───────────────────────────────────────────────────────────────
const placeOrder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { items, address, paymentMethod, subtotal, gst, deliveryCharge, discount, grandTotal, couponCode } = req.body;
        if (!items?.length)
            throw new errorHandler_1.AppError('Order must have at least one item', 400);
        if (!address?.name)
            throw new errorHandler_1.AppError('Delivery address is required', 400);
        if (!paymentMethod)
            throw new errorHandler_1.AppError('Payment method is required', 400);
        const order = await Order_1.Order.create({
            userId,
            items,
            address,
            paymentMethod,
            subtotal: subtotal || 0,
            gst: gst || 0,
            deliveryCharge: deliveryCharge || 0,
            discount: discount || 0,
            grandTotal: grandTotal || 0,
            couponCode,
            status: 'CONFIRMED',
        });
        res.status(201).json({
            success: true,
            message: 'Order placed successfully!',
            data: order,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.placeOrder = placeOrder;
// ── Get My Orders ─────────────────────────────────────────────────────────────
const getMyOrders = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            Order_1.Order.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Order_1.Order.countDocuments({ userId }),
        ]);
        res.json({
            success: true,
            data: orders,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getMyOrders = getMyOrders;
// ── Get Single Order ──────────────────────────────────────────────────────────
const getOrderById = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        // Support lookup by orderNumber or _id
        const query = id.startsWith('RJ-')
            ? { orderNumber: id, userId }
            : { _id: id, userId };
        const order = await Order_1.Order.findOne(query).lean();
        if (!order)
            throw new errorHandler_1.AppError('Order not found', 404);
        res.json({ success: true, data: order });
    }
    catch (err) {
        next(err);
    }
};
exports.getOrderById = getOrderById;
// ── Cancel Order ──────────────────────────────────────────────────────────────
const cancelOrder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const order = await Order_1.Order.findOne({ _id: id, userId });
        if (!order)
            throw new errorHandler_1.AppError('Order not found', 404);
        if (['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.status)) {
            throw new errorHandler_1.AppError(`Cannot cancel an order that is ${order.status.toLowerCase()}`, 400);
        }
        order.status = 'CANCELLED';
        await order.save();
        res.json({ success: true, message: 'Order cancelled successfully', data: order });
    }
    catch (err) {
        next(err);
    }
};
exports.cancelOrder = cancelOrder;
// ── Admin Functions ───────────────────────────────────────────────────────────
const getAllOrders = async (req, res, next) => {
    try {
        const { page = '1', limit = '20', search, status } = req.query;
        const pageNum = parseInt(page), limitNum = parseInt(limit);
        const filter = {};
        if (search)
            filter.$or = [{ orderNumber: { $regex: search, $options: 'i' } }];
        if (status)
            filter.status = status;
        const [orders, total] = await Promise.all([Order_1.Order.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum), Order_1.Order.countDocuments(filter)]);
        res.json({ success: true, data: { orders, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } } });
    }
    catch (err) {
        next(err);
    }
};
exports.getAllOrders = getAllOrders;
const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await Order_1.Order.findByIdAndUpdate(id, { status }, { new: true });
        if (!order)
            throw new errorHandler_1.AppError('Order not found', 404);
        res.json({ success: true, message: 'Order status updated', data: order });
    }
    catch (err) {
        next(err);
    }
};
exports.updateOrderStatus = updateOrderStatus;
const deleteOrder = async (req, res, next) => {
    try {
        const order = await Order_1.Order.findById(req.params.id);
        if (!order)
            throw new errorHandler_1.AppError('Order not found', 404);
        await Order_1.Order.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Order deleted successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteOrder = deleteOrder;
//# sourceMappingURL=orderController.js.map