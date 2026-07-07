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
exports.Product = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ProductSchema = new mongoose_1.Schema({
    sku: { type: String, required: true, unique: true, uppercase: true },
    barcode: { type: String, unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    categoryId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category', required: true },
    metal: { type: String, required: true },
    purity: { type: String, required: true },
    grossWeight: { type: Number, required: true, min: 0 },
    netWeight: { type: Number, required: true, min: 0 },
    stoneWeight: { type: Number, default: 0 },
    makingCharges: { type: Number, default: 0 },
    stoneCharges: { type: Number, default: 0 },
    hsnCode: { type: String, default: '7113' },
    warrantyMonths: { type: Number, default: 12 },
    careInstructions: { type: String },
    bisHallmark: { type: String },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    tags: [{ type: String }],
}, { timestamps: true });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ metal: 1, purity: 1 });
ProductSchema.index({ name: 'text', description: 'text' });
exports.Product = (mongoose_1.default.models.Product || mongoose_1.default.model('Product', ProductSchema));
//# sourceMappingURL=Product.js.map