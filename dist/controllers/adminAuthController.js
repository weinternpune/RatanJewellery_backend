"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLogin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const errorHandler_1 = require("../middleware/errorHandler");
const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'STORE_MANAGER', 'SALES_STAFF', 'INVENTORY_MANAGER'];
const adminLogin = async (req, res, next) => {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password)
            throw new errorHandler_1.AppError('Email and password required', 400);
        const user = await User_1.User.findOne({
            $or: [{ email: identifier.toLowerCase().trim() }, { phone: identifier.trim() }],
        });
        if (!user || !user.passwordHash)
            throw new errorHandler_1.AppError('Invalid credentials', 401);
        if (!ADMIN_ROLES.includes(user.role))
            throw new errorHandler_1.AppError('Access denied. Not an admin account.', 403);
        if (!user.isActive)
            throw new errorHandler_1.AppError('Account deactivated', 401);
        if (!await bcryptjs_1.default.compare(password, user.passwordHash))
            throw new errorHandler_1.AppError('Invalid credentials', 401);
        const jwtSecret = process.env.JWT_SECRET || '8kX92@mnP#qL7zV$Rt!2BxPq2026';
        const jwtRefresh = process.env.JWT_REFRESH_SECRET || '9uY#72Lm@vQx!P4sKd2026Refresh';
        const accessToken = jsonwebtoken_1.default.sign({ userId: user._id }, jwtSecret, { expiresIn: '8h' });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user._id }, jwtRefresh, { expiresIn: '7d' });
        await User_1.User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
        res.json({
            success: true,
            data: {
                user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
                accessToken,
                refreshToken,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.adminLogin = adminLogin;
//# sourceMappingURL=adminAuthController.js.map