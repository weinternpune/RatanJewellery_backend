"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const auth = auth_1.authenticate;
// ── Customer auth ───────────────────────────────────────────────────────────
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
router.post('/refresh', authController_1.refreshToken);
router.post('/logout', auth, authController_1.logout);
router.get('/me', auth, authController_1.getMe);
// ── Phone/SMS OTP ───────────────────────────────────────────────────────────
router.post('/otp/send', authController_1.sendOTPHandler);
router.post('/otp/verify', authController_1.verifyOTPHandler);
router.post('/reset-password', authController_1.resetPassword);
// ── Email OTP ───────────────────────────────────────────────────────────────
router.post('/send-otp', authController_1.sendEmailOTP);
router.post('/verify-otp', authController_1.verifyEmailOTP);
// ── Forgot Password ─────────────────────────────────────────────────────────
router.post('/check-account', authController_1.checkAccountExists);
router.post('/forgot-password/send-otp', authController_1.sendPasswordResetOTP);
router.post('/forgot-password/reset', authController_1.resetPasswordWithOTP);
// ── Admin Login ─────────────────────────────────────────────────────────────
// router.post('/admin/login', adminLogin as RequestHandler);
// TEMPORARY — remove after debugging
router.get('/create-test-user', (async (req, res) => {
    try {
        const bcrypt = require('bcryptjs');
        const { User } = require('../models/User');
        const testEmail = 'uttamkumar86830@gmail.com';
        const testPassword = 'SuperAdmin@2025#RJ';
        // Check if user already exists
        const existing = await User.findOne({ email: testEmail });
        if (existing) {
            return res.json({ success: true, message: 'User already exists! You can login now.', email: testEmail, password: testPassword });
        }
        // Create new user
        const hash = await bcrypt.hash(testPassword, 12);
        const user = await User.create({
            name: 'Uttam Kumar',
            email: testEmail,
            phone: '+917507510948',
            passwordHash: hash,
            role: 'SUPER_ADMIN',
            isActive: true,
            isVerified: true
        });
        res.json({
            success: true,
            message: 'Test user created successfully!',
            user: { id: user._id, email: user.email, role: user.role },
            credentials: { email: testEmail, password: testPassword }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}));
// ── Google OAuth ────────────────────────────────────────────────────────────
const googleGuard = (req, res, next) => {
    const id = process.env.GOOGLE_CLIENT_ID;
    const secret = process.env.GOOGLE_CLIENT_SECRET;
    if (!id || id === 'your_google_client_id' || !secret) {
        return res.status(503).json({
            success: false,
            message: 'Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.',
        });
    }
    next();
};
router.get('/google', googleGuard, passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', googleGuard, passport_1.default.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_failed`,
}), authController_1.googleCallback);
exports.default = router;
//# sourceMappingURL=auth.js.map