"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const errorHandler_1 = require("./errorHandler");
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            throw new errorHandler_1.AppError("Authentication required", 401);
        }
        const jwtSecret = process.env.JWT_SECRET || "8kX92@mnP#qL7zV$Rt!2BxPq2026";
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const dbUser = await User_1.User.findById(decoded.userId).select("_id email role name isActive");
        if (!dbUser || !dbUser.isActive) {
            throw new errorHandler_1.AppError("User not found or inactive", 401);
        }
        req.user = {
            id: dbUser._id.toString(),
            email: dbUser.email,
            role: dbUser.role,
            name: dbUser.name,
        };
        next();
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next(new errorHandler_1.AppError("Token expired", 401));
        }
        if (err instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return next(new errorHandler_1.AppError("Invalid token", 401));
        }
        next(err);
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user)
            return next(new errorHandler_1.AppError('Authentication required', 401));
        if (!roles.includes(req.user.role))
            return next(new errorHandler_1.AppError('Insufficient permissions', 403));
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map