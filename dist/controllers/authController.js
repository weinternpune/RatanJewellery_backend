"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordWithOTP = exports.sendPasswordResetOTP = exports.checkAccountExists = exports.verifyEmailOTP = exports.sendEmailOTP = exports.getMe = exports.logout = exports.refreshToken = exports.googleCallback = exports.resetPassword = exports.verifyOTPHandler = exports.sendOTPHandler = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const User_1 = require("../models/User");
const Customer_1 = require("../models/Customer");
const index_1 = require("../models/index");
const errorHandler_1 = require("../middleware/errorHandler");
const JWT_SECRET = process.env.JWT_SECRET || '8kX92@mnP#qL7zV$Rt!2BxPq2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '9uY#72Lm@vQx!P4sKd2026Refresh';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '15m';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';
const generateTokens = (userId) => ({
    accessToken: jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: (process.env.JWT_EXPIRE || "15m"),
    }),
    refreshToken: jsonwebtoken_1.default.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: (process.env.JWT_REFRESH_EXPIRE || "7d"),
    }),
});
const formatUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isVerified: user.isVerified,
    isActive: user.isActive,
});
const register = async (req, res, next) => {
    try {
        const { email, phone, password, name } = req.body;
        if (!name || !password)
            throw new errorHandler_1.AppError('Name and password are required', 400);
        const orConditions = [];
        if (email)
            orConditions.push({ email });
        if (phone)
            orConditions.push({ phone });
        if (!orConditions.length)
            throw new errorHandler_1.AppError('Email or phone is required', 400);
        const exists = await User_1.User.findOne({ $or: orConditions });
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        let user;
        if (exists) {
            if (exists.isVerified) {
                throw new errorHandler_1.AppError('Account already exists with this email or phone', 409);
            }
            exists.name = name;
            exists.passwordHash = passwordHash;
            if (email)
                exists.email = email;
            if (phone)
                exists.phone = phone;
            user = await exists.save();
            // Ensure a Customer record exists even when re-using a previously
            // unverified User document, so this account always shows up in the
            // admin CRM customer list regardless of which registration attempt
            // actually completed.
            const hasCustomer = await Customer_1.Customer.findOne({ userId: user._id });
            if (!hasCustomer) {
                await Customer_1.Customer.create({ userId: user._id, referralCode: (0, uuid_1.v4)().substring(0, 8).toUpperCase() });
            }
        }
        else {
            user = await User_1.User.create({ email, phone, passwordHash, name, isVerified: false });
            await Customer_1.Customer.create({ userId: user._id, referralCode: (0, uuid_1.v4)().substring(0, 8).toUpperCase() });
        }
        const { accessToken, refreshToken } = generateTokens(user._id.toString());
        await index_1.Session.create({
            userId: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        res
            .status(201)
            .json({
            success: true,
            message: "Registration successful",
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.register = register;
const STAFF_ROLES = ['ADMIN', 'SUPER_ADMIN', 'STORE_MANAGER', 'SALES_STAFF', 'INVENTORY_MANAGER'];
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email: email?.toLowerCase?.()?.trim() || email });
        if (!user || !user.passwordHash)
            throw new errorHandler_1.AppError("Invalid credentials", 401);
        if (!user.isActive)
            throw new errorHandler_1.AppError("Account is deactivated", 401);
        if (!(await bcryptjs_1.default.compare(password, user.passwordHash)))
            throw new errorHandler_1.AppError("Invalid credentials", 401);
        // Staff first-time login: email not verified → send OTP
        if (STAFF_ROLES.includes(user.role?.toUpperCase?.()) && !user.isVerified) {
            const { sendOTP: sendStaffOTP } = await Promise.resolve().then(() => __importStar(require("../services/otpService")));
            const result = await sendStaffOTP(user.email, "email", "login");
            if (!result.success)
                throw new errorHandler_1.AppError(result.message, 429);
            return res.status(200).json({
                success: true,
                requiresVerification: true,
                email: user.email,
                message: `A verification code has been sent to ${user.email}. Please verify to continue.`,
            });
        }
        const { accessToken, refreshToken } = generateTokens(user._id.toString());
        await User_1.User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
        await index_1.Session.create({
            userId: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        res.json({
            success: true,
            requiresVerification: false,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
const otpService_1 = require("../services/otpService");
// ─── OTP Handlers ─────────────────────────────────────────────────────────────
const sendOTPHandler = async (req, res, next) => {
    try {
        const { identifier, type = "phone", purpose } = req.body;
        if (!identifier || !purpose)
            throw new errorHandler_1.AppError("Identifier and purpose are required", 400);
        if (!["register", "login", "reset_password"].includes(purpose))
            throw new errorHandler_1.AppError("Invalid purpose", 400);
        if (purpose === "login") {
            const field = type === "phone" ? { phone: identifier } : { email: identifier };
            if (!(await User_1.User.findOne(field)))
                throw new errorHandler_1.AppError("No account found. Please register first.", 404);
        }
        if (purpose === "register") {
            const field = type === "phone" ? { phone: identifier } : { email: identifier };
            if (await User_1.User.findOne(field))
                throw new errorHandler_1.AppError("Account already exists. Please login instead.", 409);
        }
        const result = await (0, otpService_1.sendOTP)(identifier, type, purpose);
        if (!result.success)
            throw new errorHandler_1.AppError(result.message, 429);
        res.json({ success: true, message: result.message });
    }
    catch (err) {
        next(err);
    }
};
exports.sendOTPHandler = sendOTPHandler;
const verifyOTPHandler = async (req, res, next) => {
    try {
        const { identifier, code, purpose, name, type = "phone" } = req.body;
        if (!identifier || !code || !purpose)
            throw new errorHandler_1.AppError("All fields required", 400);
        const result = await (0, otpService_1.verifyOTP)(identifier, code, purpose);
        if (!result.success)
            throw new errorHandler_1.AppError(result.message, 400);
        if (purpose === "register") {
            if (!name)
                throw new errorHandler_1.AppError("Name is required for registration", 400);
            const exists = await User_1.User.findOne(type === "phone" ? { phone: identifier } : { email: identifier });
            if (exists)
                throw new errorHandler_1.AppError("Account already exists", 409);
            const userData = { name, isVerified: true };
            if (type === "phone")
                userData.phone = identifier;
            else
                userData.email = identifier;
            const user = await User_1.User.create(userData);
            await Customer_1.Customer.create({
                userId: user._id,
                referralCode: (0, uuid_1.v4)().substring(0, 8).toUpperCase(),
            });
            const tokens = generateTokens(user._id.toString());
            await index_1.Session.create({
                userId: user._id,
                token: tokens.refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });
            return res
                .status(201)
                .json({
                success: true,
                message: "Registration successful! Welcome to Ratan Jewellers.",
                data: { user: formatUser(user), ...tokens },
            });
        }
        if (purpose === "login") {
            const field = type === "phone" ? { phone: identifier } : { email: identifier };
            const user = await User_1.User.findOne(field);
            if (!user)
                throw new errorHandler_1.AppError("User not found", 404);
            if (!user.isActive)
                throw new errorHandler_1.AppError("Account deactivated", 401);
            const tokens = generateTokens(user._id.toString());
            await User_1.User.findByIdAndUpdate(user._id, {
                lastLogin: new Date(),
                isVerified: true,
            });
            await index_1.Session.create({
                userId: user._id,
                token: tokens.refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });
            return res.json({
                success: true,
                message: `Welcome back, ${user.name}!`,
                data: { user: formatUser(user), ...tokens },
            });
        }
        res.json({
            success: true,
            message: "OTP verified. You may now set a new password.",
        });
    }
    catch (err) {
        next(err);
    }
};
exports.verifyOTPHandler = verifyOTPHandler;
const resetPassword = async (req, res, next) => {
    try {
        const { identifier, code, newPassword } = req.body;
        if (!identifier || !code || !newPassword)
            throw new errorHandler_1.AppError("All fields required", 400);
        if (newPassword.length < 8)
            throw new errorHandler_1.AppError("Password must be at least 8 characters", 400);
        const result = await (0, otpService_1.verifyOTP)(identifier, code, "reset_password");
        if (!result.success)
            throw new errorHandler_1.AppError(result.message, 400);
        const isPhone = /^\+?\d{10,15}$/.test(identifier);
        const user = await User_1.User.findOne(isPhone ? { phone: identifier } : { email: identifier });
        if (!user)
            throw new errorHandler_1.AppError("User not found", 404);
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
        await User_1.User.findByIdAndUpdate(user._id, { passwordHash, isVerified: true });
        await index_1.Session.deleteMany({ userId: user._id });
        res.json({
            success: true,
            message: "Password reset successfully. Please login with your new password.",
        });
    }
    catch (err) {
        next(err);
    }
};
exports.resetPassword = resetPassword;
const googleCallback = async (req, res) => {
    const user = req.user;
    if (!user)
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`);
    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    await index_1.Session.create({
        userId: user._id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await User_1.User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
};
exports.googleCallback = googleCallback;
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken)
            throw new errorHandler_1.AppError("Refresh token required", 400);
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const session = await index_1.Session.findOne({ token: refreshToken });
        if (!session || session.expiresAt < new Date())
            throw new errorHandler_1.AppError("Invalid refresh token", 401);
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);
        await index_1.Session.findOneAndUpdate({ token: refreshToken }, {
            token: newRefreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        res.json({
            success: true,
            data: { accessToken, refreshToken: newRefreshToken },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.refreshToken = refreshToken;
const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken)
            await index_1.Session.deleteMany({ token: refreshToken });
        res.json({ success: true, message: "Logged out successfully" });
    }
    catch (err) {
        next(err);
    }
};
exports.logout = logout;
const getMe = async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.id).select("-passwordHash");
        const customer = await Customer_1.Customer.findOne({ userId: req.user.id });
        res.json({ success: true, data: { ...user?.toObject(), customer } });
    }
    catch (err) {
        next(err);
    }
};
exports.getMe = getMe;
// ─── Email OTP (post-registration email verification) ─────────────────────
// Used by /register → /send-otp → /verify-otp on the storefront.
const sendEmailOTP = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email)
            throw new errorHandler_1.AppError("Email is required", 400);
        const user = await User_1.User.findOne({ email: email.toLowerCase().trim() });
        if (!user)
            throw new errorHandler_1.AppError("No account found for this email", 404);
        const result = await (0, otpService_1.sendOTP)(email.toLowerCase().trim(), "email", "register");
        if (!result.success)
            throw new errorHandler_1.AppError(result.message, 429);
        res.json({ success: true, message: result.message });
    }
    catch (err) {
        next(err);
    }
};
exports.sendEmailOTP = sendEmailOTP;
const verifyEmailOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp)
            throw new errorHandler_1.AppError("Email and OTP are required", 400);
        const result = await (0, otpService_1.verifyOTP)(email.toLowerCase().trim(), otp, "register");
        if (!result.success)
            throw new errorHandler_1.AppError(result.message, 400);
        const user = await User_1.User.findOneAndUpdate({ email: email.toLowerCase().trim() }, { isVerified: true, lastLogin: new Date() }, { new: true });
        if (!user)
            throw new errorHandler_1.AppError("No account found for this email", 404);
        const tokens = generateTokens(user._id.toString());
        await index_1.Session.create({
            userId: user._id,
            token: tokens.refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        res.json({
            success: true,
            message: "Email verified successfully!",
            data: { user: formatUser(user), ...tokens },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.verifyEmailOTP = verifyEmailOTP;
// ─── Forgot Password ────────────────────────────────────────────────────────
const checkAccountExists = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email)
            throw new errorHandler_1.AppError("Email is required", 400);
        const user = await User_1.User.findOne({ email: email.toLowerCase().trim() });
        res.json({ success: true, exists: !!user });
    }
    catch (err) {
        next(err);
    }
};
exports.checkAccountExists = checkAccountExists;
const sendPasswordResetOTP = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email)
            throw new errorHandler_1.AppError("Email is required", 400);
        const user = await User_1.User.findOne({ email: email.toLowerCase().trim() });
        if (!user)
            throw new errorHandler_1.AppError("No account found with this email", 404);
        const result = await (0, otpService_1.sendOTP)(email.toLowerCase().trim(), "email", "reset_password");
        if (!result.success)
            throw new errorHandler_1.AppError(result.message, 429);
        res.json({ success: true, message: result.message });
    }
    catch (err) {
        next(err);
    }
};
exports.sendPasswordResetOTP = sendPasswordResetOTP;
const resetPasswordWithOTP = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword)
            throw new errorHandler_1.AppError("Email, OTP and new password are required", 400);
        if (newPassword.length < 6)
            throw new errorHandler_1.AppError("Password must be at least 6 characters", 400);
        const result = await (0, otpService_1.verifyOTP)(email.toLowerCase().trim(), otp, "reset_password");
        if (!result.success)
            throw new errorHandler_1.AppError(result.message, 400);
        const user = await User_1.User.findOne({ email: email.toLowerCase().trim() });
        if (!user)
            throw new errorHandler_1.AppError("No account found with this email", 404);
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
        await User_1.User.findByIdAndUpdate(user._id, { passwordHash, isVerified: true });
        await index_1.Session.deleteMany({ userId: user._id });
        res.json({
            success: true,
            message: "Password reset successfully. Please sign in with your new password.",
        });
    }
    catch (err) {
        next(err);
    }
};
exports.resetPasswordWithOTP = resetPasswordWithOTP;
//# sourceMappingURL=authController.js.map