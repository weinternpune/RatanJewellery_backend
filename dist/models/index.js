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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Supplier = exports.Session = exports.Inventory = exports.GoldRate = exports.Category = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CategorySchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String }, image: { type: String },
    parentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category' },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
}, { timestamps: true });
exports.Category = (mongoose_1.default.models.Category || mongoose_1.default.model('Category', CategorySchema));
const GoldRateSchema = new mongoose_1.Schema({
    purity: { type: String, required: true },
    ratePerGram: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    source: { type: String, default: 'MANUAL' },
}, { timestamps: true });
GoldRateSchema.index({ purity: 1, date: -1 });
exports.GoldRate = (mongoose_1.default.models.GoldRate || mongoose_1.default.model('GoldRate', GoldRateSchema));
const InventorySchema = new mongoose_1.Schema({
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
    currentStock: { type: Number, default: 0 },
    reservedStock: { type: Number, default: 0 },
    lowStockAlert: { type: Number, default: 2 },
    location: { type: String },
    supplierId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Supplier' },
    lastRestocked: { type: Date },
}, { timestamps: true });
exports.Inventory = (mongoose_1.default.models.Inventory || mongoose_1.default.model('Inventory', InventorySchema));
const SessionSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
}, { timestamps: true });
SessionSchema.index({ token: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.Session = (mongoose_1.default.models.Session || mongoose_1.default.model('Session', SessionSchema));
const SupplierSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    address: { type: Object },
    gstin: { type: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
exports.Supplier = (mongoose_1.default.models.Supplier || mongoose_1.default.model('Supplier', SupplierSchema));
//# sourceMappingURL=index.js.map