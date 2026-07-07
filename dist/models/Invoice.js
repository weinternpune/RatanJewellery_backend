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
exports.AuditLog = exports.WAMessage = exports.Coupon = exports.Review = exports.Invoice = exports.Order = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// ── Order ─────────────────────────────────────────────────────────
const OrderItemSchema = new mongoose_1.Schema({
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true }, quantity: { type: Number, required: true },
    goldRate: { type: Number, required: true }, grossWeight: { type: Number },
    netWeight: { type: Number }, makingCharges: { type: Number, default: 0 },
    stoneCharges: { type: Number, default: 0 }, unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true }, cgst: { type: Number, default: 0 }, sgst: { type: Number, default: 0 },
}, { _id: false });
const OrderSchema = new mongoose_1.Schema({
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer' },
    status: { type: String, enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'], default: 'PENDING' },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], default: 'PENDING' },
    paymentMode: { type: String },
    subtotal: { type: Number, required: true }, discountAmount: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 }, sgst: { type: Number, default: 0 }, igst: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }, shippingAddress: { type: Object },
    couponCode: { type: String }, notes: { type: String },
    razorpayOrderId: { type: String }, razorpayPaymentId: { type: String },
    trackingNumber: { type: String }, deliveredAt: { type: Date },
    items: [OrderItemSchema],
}, { timestamps: true });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
exports.Order = (mongoose_1.default.models.Order || mongoose_1.default.model('Order', OrderSchema));
// ── Invoice ───────────────────────────────────────────────────────
const InvoiceItemSchema = new mongoose_1.Schema({
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true }, hsnCode: { type: String, default: '7113' },
    purity: { type: String, required: true }, grossWeight: { type: Number }, netWeight: { type: Number },
    goldRate: { type: Number, required: true }, makingCharges: { type: Number, default: 0 },
    stoneCharges: { type: Number, default: 0 }, quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true }, cgstRate: { type: Number, default: 1.5 },
    sgstRate: { type: Number, default: 1.5 }, cgstAmount: { type: Number, required: true },
    sgstAmount: { type: Number, required: true }, totalAmount: { type: Number, required: true },
}, { _id: false });
const InvoiceSchema = new mongoose_1.Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    orderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Order' },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String, required: true }, customerPhone: { type: String, required: true },
    customerEmail: { type: String }, customerAddress: { type: Object }, customerGstin: { type: String },
    paymentMode: { type: String, required: true },
    subtotal: { type: Number, required: true }, discountAmount: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 }, sgst: { type: Number, default: 0 }, igst: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }, oldGoldExchange: { type: Number, default: 0 },
    pdfUrl: { type: String }, notes: { type: String },
    isEdited: { type: Boolean, default: false }, editHistory: [{ type: Object }],
    items: [InvoiceItemSchema],
}, { timestamps: true });
InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ customerPhone: 1 });
InvoiceSchema.index({ createdAt: -1 });
exports.Invoice = (mongoose_1.default.models.Invoice || mongoose_1.default.model('Invoice', InvoiceSchema));
// ── Review ────────────────────────────────────────────────────────
const ReviewSchema = new mongoose_1.Schema({
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer', required: true },
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String }, content: { type: String }, images: [{ type: String }],
    isVerified: { type: Boolean, default: false }, isApproved: { type: Boolean, default: false },
}, { timestamps: true });
ReviewSchema.index({ productId: 1 });
exports.Review = (mongoose_1.default.models.Review || mongoose_1.default.model('Review', ReviewSchema));
// ── Coupon ────────────────────────────────────────────────────────
const CouponSchema = new mongoose_1.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    type: { type: String, required: true }, value: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 }, maxUsage: { type: Number },
    usedCount: { type: Number, default: 0 }, isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
}, { timestamps: true });
exports.Coupon = mongoose_1.default.models.Coupon || mongoose_1.default.model('Coupon', CouponSchema);
// ── WAMessage ────────────────────────────────────────────────────
const WAMessageSchema = new mongoose_1.Schema({
    invoiceId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Invoice' },
    phone: { type: String, required: true }, templateName: { type: String },
    message: { type: String }, pdfUrl: { type: String },
    status: { type: String, enum: ['PENDING', 'SENT', 'DELIVERED', 'FAILED', 'READ'], default: 'PENDING' },
    retryCount: { type: Number, default: 0 }, errorLog: { type: String },
    sentAt: { type: Date }, deliveredAt: { type: Date },
}, { timestamps: true });
exports.WAMessage = mongoose_1.default.models.WAMessage || mongoose_1.default.model('WAMessage', WAMessageSchema);
// ── AuditLog ──────────────────────────────────────────────────────
const AuditLogSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true }, entity: { type: String, required: true },
    entityId: { type: String }, oldData: { type: Object }, newData: { type: Object },
    ipAddress: { type: String }, userAgent: { type: String },
}, { timestamps: true });
exports.AuditLog = mongoose_1.default.models.AuditLog || mongoose_1.default.model('AuditLog', AuditLogSchema);
//# sourceMappingURL=Invoice.js.map