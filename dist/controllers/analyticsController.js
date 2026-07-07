"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerAnalytics = exports.getInventoryAnalytics = exports.getSalesDashboard = void 0;
const Invoice_1 = require("../models/Invoice");
const Customer_1 = require("../models/Customer");
const Product_1 = require("../models/Product");
const index_1 = require("../models/index");
const getSalesDashboard = async (req, res, next) => {
    try {
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const [todayAgg, monthAgg, yearAgg, lastMonthAgg, totalCustomers, recentInvoices] = await Promise.all([
            Invoice_1.Invoice.aggregate([{ $match: { createdAt: { $gte: startOfDay } } }, { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }]),
            Invoice_1.Invoice.aggregate([{ $match: { createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }]),
            Invoice_1.Invoice.aggregate([{ $match: { createdAt: { $gte: startOfYear } } }, { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }]),
            Invoice_1.Invoice.aggregate([{ $match: { createdAt: { $gte: lastMonth, $lte: endLastMonth } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
            Customer_1.Customer.countDocuments(),
            Invoice_1.Invoice.find().sort({ createdAt: -1 }).limit(10).lean(),
        ]);
        const monthRev = monthAgg[0]?.total || 0, lastMonthRev = lastMonthAgg[0]?.total || 1;
        const monthGrowth = ((monthRev - lastMonthRev) / lastMonthRev) * 100;
        const monthlyRevenue = await Invoice_1.Invoice.aggregate([
            { $match: { createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }, { $project: { month: '$_id', revenue: 1, count: 1, _id: 0 } },
        ]);
        const lowStockItems = await index_1.Inventory.countDocuments({ $expr: { $lte: ['$currentStock', '$lowStockAlert'] } });
        res.json({ success: true, data: { kpis: { todayRevenue: todayAgg[0]?.total || 0, todayOrders: todayAgg[0]?.count || 0, monthRevenue: monthRev, monthOrders: monthAgg[0]?.count || 0, yearRevenue: yearAgg[0]?.total || 0, yearOrders: yearAgg[0]?.count || 0, monthGrowth: Math.round(monthGrowth * 100) / 100, totalCustomers, lowStockItems }, monthlyRevenue, recentOrders: recentInvoices } });
    }
    catch (err) {
        next(err);
    }
};
exports.getSalesDashboard = getSalesDashboard;
const getInventoryAnalytics = async (req, res, next) => {
    try {
        const [total, lowStock, outOfStock] = await Promise.all([
            Product_1.Product.countDocuments({ isActive: true }),
            index_1.Inventory.countDocuments({ $expr: { $and: [{ $gt: ['$currentStock', 0] }, { $lte: ['$currentStock', '$lowStockAlert'] }] } }),
            index_1.Inventory.countDocuments({ currentStock: 0 }),
        ]);
        res.json({ success: true, data: { total, lowStock, outOfStock, healthy: total - lowStock - outOfStock } });
    }
    catch (err) {
        next(err);
    }
};
exports.getInventoryAnalytics = getInventoryAnalytics;
const getCustomerAnalytics = async (req, res, next) => {
    try {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const [total, newThisMonth, topCustomers] = await Promise.all([
            Customer_1.Customer.countDocuments(),
            Customer_1.Customer.countDocuments({ createdAt: { $gte: startOfMonth } }),
            Customer_1.Customer.find().sort({ totalPurchases: -1 }).limit(10).populate('userId', 'name email'),
        ]);
        res.json({ success: true, data: { total, newThisMonth, topCustomers } });
    }
    catch (err) {
        next(err);
    }
};
exports.getCustomerAnalytics = getCustomerAnalytics;
//# sourceMappingURL=analyticsController.js.map