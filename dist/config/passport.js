"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurePassport = configurePassport;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const User_1 = require("../models/User");
const Customer_1 = require("../models/Customer");
const uuid_1 = require("uuid");
function configurePassport() {
    // Always register the Google strategy — it reads env at request time
    passport_1.default.use('google', new passport_google_oauth20_1.Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value;
            const avatar = profile.photos?.[0]?.value;
            let user = await User_1.User.findOne({ googleId: profile.id });
            if (user)
                return done(null, user);
            if (email) {
                user = await User_1.User.findOne({ email });
                if (user) {
                    await User_1.User.findByIdAndUpdate(user._id, { googleId: profile.id, avatar: avatar || user.avatar, isVerified: true });
                    return done(null, user);
                }
            }
            user = await User_1.User.create({
                googleId: profile.id, email,
                name: profile.displayName || 'Google User',
                avatar, isVerified: true, isActive: true,
            });
            await Customer_1.Customer.create({ userId: user._id, referralCode: (0, uuid_1.v4)().substring(0, 8).toUpperCase() });
            return done(null, user);
        }
        catch (err) {
            return done(err, undefined);
        }
    }));
    passport_1.default.serializeUser((user, done) => done(null, user._id));
    passport_1.default.deserializeUser(async (id, done) => {
        try {
            done(null, await User_1.User.findById(id));
        }
        catch (e) {
            done(e, null);
        }
    });
}
//# sourceMappingURL=passport.js.map