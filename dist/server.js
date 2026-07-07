"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const passport_1 = __importDefault(require("passport"));
const passport_2 = require("./config/passport");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const db_1 = require("./lib/db");
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const requestLogger_1 = require("./middleware/requestLogger");
const auth_1 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
const categories_1 = __importDefault(require("./routes/categories"));
const inventory_1 = __importDefault(require("./routes/inventory"));
const orders_1 = __importDefault(require("./routes/orders"));
const invoices_1 = __importDefault(require("./routes/invoices"));
const customers_1 = __importDefault(require("./routes/customers"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const goldRates_1 = __importDefault(require("./routes/goldRates"));
const settings_1 = __importDefault(require("./routes/settings"));
const coupons_1 = __importDefault(require("./routes/coupons"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const wishlist_1 = __importDefault(require("./routes/wishlist"));
const whatsapp_1 = __importDefault(require("./routes/whatsapp"));
const suppliers_1 = __importDefault(require("./routes/suppliers"));
const upload_1 = __importDefault(require("./routes/upload"));
const customJewellery_1 = __importDefault(require("./routes/customJewellery"));
const admin_1 = __importDefault(require("./routes/admin"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
(0, db_1.connectDB)();
(0, passport_2.configurePassport)();
app.use(passport_1.default.initialize());
app.use((0, helmet_1.default)({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
const allowedOrigin = process.env.FRONTEND_URL;
app.use((0, cors_1.default)({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
}));
app.use('/api/', (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false }));
app.use('/api/auth/', (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: process.env.NODE_ENV === 'development' ? 1000 : 20 }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger_1.requestLogger);
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'Ratan Jewellers API', db: 'MongoDB' }));
app.use('/api/auth', auth_1.default);
app.use('/api/products', products_1.default);
app.use('/api/categories', categories_1.default);
app.use('/api/inventory', inventory_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/invoices', invoices_1.default);
app.use('/api/customers', customers_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/gold-rates', goldRates_1.default);
app.use('/api/settings', settings_1.default);
app.use('/api/coupons', coupons_1.default);
app.use('/api/reviews', reviews_1.default);
app.use('/api/wishlist', wishlist_1.default);
app.use('/api/whatsapp', whatsapp_1.default);
app.use('/api/suppliers', suppliers_1.default);
app.use('/api/upload', upload_1.default);
app.use('/api/custom-jewellery', customJewellery_1.default);
app.use('/api/admin', admin_1.default);
app.use('*', (_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    logger_1.logger.info(`🚀 Ratan Jewellers API running on port ${PORT}`);
    logger_1.logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
    logger_1.logger.info(`🍃 Database: MongoDB`);
});
exports.default = app;
//# sourceMappingURL=server.js.map