"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../utils/logger");
let isConnected = false;
const connectDB = async () => {
    if (isConnected)
        return;
    const uri = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/ratan_jewellers';
    try {
        mongoose_1.default.set('strictQuery', false);
        await mongoose_1.default.connect(uri);
        isConnected = true;
        logger_1.logger.info(`✅ MongoDB connected: ${mongoose_1.default.connection.host}`);
    }
    catch (error) {
        logger_1.logger.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
mongoose_1.default.connection.on('disconnected', () => { logger_1.logger.warn('MongoDB disconnected'); isConnected = false; });
mongoose_1.default.connection.on('error', (err) => { logger_1.logger.error('MongoDB error:', err); });
exports.default = exports.connectDB;
//# sourceMappingURL=db.js.map