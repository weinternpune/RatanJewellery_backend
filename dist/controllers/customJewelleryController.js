"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequests = exports.createRequest = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const errorHandler_1 = require("../middleware/errorHandler");
const Schema = mongoose_1.default.Schema;
// Inline model (no separate file needed for simple use)
const CJSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    category: { type: String, required: true },
    metal: { type: String },
    budget: { type: String },
    description: { type: String, required: true },
    status: { type: String, default: 'new' },
    requestId: { type: String },
}, { timestamps: true });
const CJRequest = (mongoose_1.default.models.CustomJewellery || mongoose_1.default.model('CustomJewellery', CJSchema));
const createRequest = async (req, res, next) => {
    try {
        const { name, email, phone, category, description } = req.body;
        if (!name || !email || !phone || !category || !description)
            throw new errorHandler_1.AppError('All required fields must be filled', 400);
        const requestId = 'CJR-' + Date.now();
        const record = await CJRequest.create({ ...req.body, requestId });
        res.status(201).json({ success: true, message: 'Request submitted successfully', data: record });
    }
    catch (err) {
        next(err);
    }
};
exports.createRequest = createRequest;
const getRequests = async (req, res, next) => {
    try {
        const requests = await CJRequest.find().sort({ createdAt: -1 }).lean();
        res.json({ success: true, data: requests });
    }
    catch (err) {
        next(err);
    }
};
exports.getRequests = getRequests;
//# sourceMappingURL=customJewelleryController.js.map