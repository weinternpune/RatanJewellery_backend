"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.resetStaffPassword = exports.getUserById = exports.createStaffUser = exports.getAllUsers = exports.getDashboardStats = exports.clearAllBillingData = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Invoice_1 = require("../models/Invoice");
const Order_1 = require("../models/Order");
const Customer_1 = require("../models/Customer");
const errorHandler_1 = require("../middleware/errorHandler");
const User_1 = require("../models/User");
const clearAllBillingData = async (req, res, next) => {
    try {
        // Count documents before deletion
        const [invoiceCount, orderCount, customerCount] = await Promise.all([
            Invoice_1.Invoice.countDocuments(),
            Order_1.Order.countDocuments(),
            Customer_1.Customer.countDocuments(),
        ]);
        // Clear all billing data
        await Promise.all([
            Invoice_1.Invoice.deleteMany({}),
            Order_1.Order.deleteMany({}),
            Customer_1.Customer.deleteMany({}),
        ]);
        res.json({
            success: true,
            message: "All billing data cleared successfully",
            data: {
                cleared: {
                    invoices: invoiceCount,
                    orders: orderCount,
                    customers: customerCount,
                },
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.clearAllBillingData = clearAllBillingData;
const getDashboardStats = async (req, res, next) => {
    try {
        const [invoiceStats, orderStats, customerCount] = await Promise.all([
            Invoice_1.Invoice.aggregate([
                {
                    $group: {
                        _id: null,
                        totalInvoices: { $sum: 1 },
                        totalAmount: { $sum: "$totalAmount" },
                        totalCgst: { $sum: "$cgst" },
                        totalSgst: { $sum: "$sgst" },
                    },
                },
            ]),
            Order_1.Order.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                        totalAmount: { $sum: "$totalAmount" },
                    },
                },
            ]),
            Customer_1.Customer.countDocuments(),
        ]);
        const stats = invoiceStats[0] || {
            totalInvoices: 0,
            totalAmount: 0,
            totalCgst: 0,
            totalSgst: 0,
        };
        const ordersByStatus = orderStats.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});
        res.json({
            success: true,
            data: {
                invoices: {
                    total: stats.totalInvoices,
                    totalAmount: stats.totalAmount,
                    totalGst: stats.totalCgst + stats.totalSgst,
                },
                orders: ordersByStatus,
                customers: customerCount,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getDashboardStats = getDashboardStats;
//all users
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User_1.User.find({ role: { $ne: "CUSTOMER" } }, "name email role isActive").sort({ createdAt: -1 });
        res.json({
            success: true,
            data: users,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getAllUsers = getAllUsers;
const STAFF_ROLES = [
    "SALES_STAFF",
    "INVENTORY_MANAGER",
    "STORE_MANAGER",
    "ADMIN",
    "SUPER_ADMIN",
];
// Dedicated admin-only path for creating staff accounts.
// Deliberately separate from the public /auth/register endpoint so that
// staff creation always persists the chosen role and never collides with
// public customer signups that happen to use the same email.
const createStaffUser = async (req, res, next) => {
    try {
        const { name, email, phone, password, role } = req.body;
        if (!name || !email || !password || !role) {
            throw new errorHandler_1.AppError("Name, email, password and role are required", 400);
        }
        if (password.length < 8) {
            throw new errorHandler_1.AppError("Password must be at least 8 characters", 400);
        }
        const normalizedRole = String(role).toUpperCase();
        if (!STAFF_ROLES.includes(normalizedRole)) {
            throw new errorHandler_1.AppError(`Invalid role. Must be one of: ${STAFF_ROLES.join(", ")}`, 400);
        }
        // Only an existing Super Admin may create another Super Admin.
        if (normalizedRole === "SUPER_ADMIN" && req.user?.role !== "SUPER_ADMIN") {
            throw new errorHandler_1.AppError("Only a Super Admin can create another Super Admin", 403);
        }
        const normalizedEmail = String(email).toLowerCase().trim();
        const existing = await User_1.User.findOne({
            $or: [{ email: normalizedEmail }, ...(phone ? [{ phone }] : [])],
        });
        if (existing) {
            const matchedByEmail = existing.email === normalizedEmail;
            // Auto-heal: if this is a CUSTOMER-role account that has never placed
            // a real order, it's almost certainly a leftover from someone
            // accidentally going through the public registration flow while
            // trying to create a staff account — a bug that existed before this
            // endpoint did. Rather than reject and force a manual DB cleanup
            // every time, upgrade it in place to the requested staff role.
            if (existing.role === "CUSTOMER") {
                const orderCount = await Order_1.Order.countDocuments({ userId: existing._id });
                if (orderCount === 0) {
                    if (normalizedRole === "SUPER_ADMIN" && req.user?.role !== "SUPER_ADMIN") {
                        throw new errorHandler_1.AppError("Only a Super Admin can create another Super Admin", 403);
                    }
                    const passwordHash = await bcryptjs_1.default.hash(password, 12);
                    existing.name = name;
                    existing.passwordHash = passwordHash;
                    existing.role = normalizedRole;
                    existing.isVerified = true;
                    existing.isActive = true;
                    if (phone)
                        existing.phone = phone;
                    await existing.save();
                    // The original public-registration flow auto-creates a matching
                    // Customer document; it no longer makes sense once this account
                    // is a staff account, so remove it.
                    await Customer_1.Customer.deleteOne({ userId: existing._id });
                    return res.status(200).json({
                        success: true,
                        message: "An unused customer account with this email was found and converted to a staff account.",
                        data: {
                            id: existing._id,
                            name: existing.name,
                            email: existing.email,
                            phone: existing.phone,
                            role: existing.role,
                            isActive: existing.isActive,
                        },
                    });
                }
            }
            throw new errorHandler_1.AppError(matchedByEmail
                ? "An account with this email already exists"
                : "An account with this phone number already exists", 409);
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const user = await User_1.User.create({
            name,
            email: normalizedEmail,
            phone: phone || undefined,
            passwordHash,
            role: normalizedRole,
            isVerified: true, // admin-issued credentials don't need email verification
            isActive: true,
        });
        res.status(201).json({
            success: true,
            message: "Staff account created successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isActive: user.isActive,
            },
        });
    }
    catch (err) {
        // Guard against a duplicate-key race (two requests at once with the
        // same email) that slips past the findOne pre-check above.
        if (err?.code === 11000) {
            return next(new errorHandler_1.AppError("An account with this email already exists", 409));
        }
        next(err);
    }
};
exports.createStaffUser = createStaffUser;
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User_1.User.findById(id).select("name email phone role isActive isVerified createdAt updatedAt lastLogin avatar");
        if (!user) {
            throw new errorHandler_1.AppError("Staff member not found", 404);
        }
        res.json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isActive: user.isActive,
                isVerified: user.isVerified,
                avatar: user.avatar,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                lastLogin: user.lastLogin,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getUserById = getUserById;
// Generates a fresh temporary password for an existing staff account and
// returns it once, in this response only. There is no way to retrieve a
// previously-set password — it's bcrypt-hashed the instant it's saved and
// cannot be reversed by this server, this database, or anyone with access
// to either. This is the only safe path to recover access to an account
// whose original password was lost or never recorded.
function generateTempPassword() {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I/O to avoid visual ambiguity
    const lower = "abcdefghijkmnpqrstuvwxyz";
    const digits = "23456789";
    const symbols = "!@#$%&*";
    const all = upper + lower + digits + symbols;
    const pick = (chars) => chars[Math.floor(Math.random() * chars.length)];
    const required = [pick(upper), pick(lower), pick(digits), pick(symbols)];
    const rest = Array.from({ length: 8 }, () => pick(all));
    return [...required, ...rest].sort(() => Math.random() - 0.5).join("");
}
const resetStaffPassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User_1.User.findById(id);
        if (!user) {
            throw new errorHandler_1.AppError("Staff member not found", 404);
        }
        if (user.role === "CUSTOMER") {
            throw new errorHandler_1.AppError("This endpoint is for staff accounts only", 400);
        }
        // A Super Admin may reset their own password this way, but not another
        // Super Admin's, to prevent one admin from silently locking out another.
        if (user.role === "SUPER_ADMIN" && String(user._id) !== req.user?.id) {
            throw new errorHandler_1.AppError("Cannot reset another Super Admin's password", 403);
        }
        const tempPassword = generateTempPassword();
        user.passwordHash = await bcryptjs_1.default.hash(tempPassword, 12);
        await user.save();
        res.json({
            success: true,
            message: "Temporary password generated. It will not be shown again after you close this window.",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                tempPassword,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.resetStaffPassword = resetStaffPassword;
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User_1.User.findById(id);
        if (!user) {
            throw new errorHandler_1.AppError("User not found", 404);
        }
        // Prevent Super Admin from deleting their own account
        const requesterId = req.user?._id?.toString() || req.user?.id?.toString();
        if (user.role === "SUPER_ADMIN" && requesterId === id) {
            throw new errorHandler_1.AppError("You cannot delete your own Super Admin account", 403);
        }
        await User_1.User.findByIdAndDelete(id);
        res.json({
            success: true,
            message: "Account deleted successfully",
        });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=adminController.js.map