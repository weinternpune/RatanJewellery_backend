import mongoose, { Document } from 'mongoose';
export interface IOrder extends Document {
    orderNumber: string;
    userId: mongoose.Types.ObjectId;
    customerId?: mongoose.Types.ObjectId;
    status: string;
    paymentStatus: string;
    paymentMode?: string;
    subtotal: number;
    discountAmount: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalAmount: number;
    shippingAddress?: object;
    couponCode?: string;
    notes?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    trackingNumber?: string;
    deliveredAt?: Date;
    items: any[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const Order: mongoose.Model<IOrder>;
export interface IInvoice extends Document {
    invoiceNumber: string;
    orderId?: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    customerId?: mongoose.Types.ObjectId;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    customerAddress?: object;
    customerGstin?: string;
    paymentMode: string;
    subtotal: number;
    discountAmount: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalAmount: number;
    oldGoldExchange: number;
    pdfUrl?: string;
    notes?: string;
    isEdited: boolean;
    editHistory: object[];
    items: any[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const Invoice: mongoose.Model<IInvoice>;
export declare const Review: any;
export declare const Coupon: mongoose.Model<any, {}, {}, {}, any, any> | mongoose.Model<{
    isActive: boolean;
    type: string;
    code: string;
    value: number;
    minOrderAmount: number;
    usedCount: number;
    expiresAt?: NativeDate;
    maxUsage?: number;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    isActive: boolean;
    type: string;
    code: string;
    value: number;
    minOrderAmount: number;
    usedCount: number;
    expiresAt?: NativeDate;
    maxUsage?: number;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    isActive: boolean;
    type: string;
    code: string;
    value: number;
    minOrderAmount: number;
    usedCount: number;
    expiresAt?: NativeDate;
    maxUsage?: number;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    isActive: boolean;
    type: string;
    code: string;
    value: number;
    minOrderAmount: number;
    usedCount: number;
    expiresAt?: NativeDate;
    maxUsage?: number;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    isActive: boolean;
    type: string;
    code: string;
    value: number;
    minOrderAmount: number;
    usedCount: number;
    expiresAt?: NativeDate;
    maxUsage?: number;
} & mongoose.DefaultTimestampProps>, {}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & mongoose.FlatRecord<{
    isActive: boolean;
    type: string;
    code: string;
    value: number;
    minOrderAmount: number;
    usedCount: number;
    expiresAt?: NativeDate;
    maxUsage?: number;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export declare const WAMessage: mongoose.Model<any, {}, {}, {}, any, any> | mongoose.Model<{
    phone: string;
    status: "PENDING" | "DELIVERED" | "FAILED" | "SENT" | "READ";
    retryCount: number;
    message?: string;
    deliveredAt?: NativeDate;
    pdfUrl?: string;
    invoiceId?: mongoose.Types.ObjectId;
    templateName?: string;
    errorLog?: string;
    sentAt?: NativeDate;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    phone: string;
    status: "PENDING" | "DELIVERED" | "FAILED" | "SENT" | "READ";
    retryCount: number;
    message?: string;
    deliveredAt?: NativeDate;
    pdfUrl?: string;
    invoiceId?: mongoose.Types.ObjectId;
    templateName?: string;
    errorLog?: string;
    sentAt?: NativeDate;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    phone: string;
    status: "PENDING" | "DELIVERED" | "FAILED" | "SENT" | "READ";
    retryCount: number;
    message?: string;
    deliveredAt?: NativeDate;
    pdfUrl?: string;
    invoiceId?: mongoose.Types.ObjectId;
    templateName?: string;
    errorLog?: string;
    sentAt?: NativeDate;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    phone: string;
    status: "PENDING" | "DELIVERED" | "FAILED" | "SENT" | "READ";
    retryCount: number;
    message?: string;
    deliveredAt?: NativeDate;
    pdfUrl?: string;
    invoiceId?: mongoose.Types.ObjectId;
    templateName?: string;
    errorLog?: string;
    sentAt?: NativeDate;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    phone: string;
    status: "PENDING" | "DELIVERED" | "FAILED" | "SENT" | "READ";
    retryCount: number;
    message?: string;
    deliveredAt?: NativeDate;
    pdfUrl?: string;
    invoiceId?: mongoose.Types.ObjectId;
    templateName?: string;
    errorLog?: string;
    sentAt?: NativeDate;
} & mongoose.DefaultTimestampProps>, {}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & mongoose.FlatRecord<{
    phone: string;
    status: "PENDING" | "DELIVERED" | "FAILED" | "SENT" | "READ";
    retryCount: number;
    message?: string;
    deliveredAt?: NativeDate;
    pdfUrl?: string;
    invoiceId?: mongoose.Types.ObjectId;
    templateName?: string;
    errorLog?: string;
    sentAt?: NativeDate;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export declare const AuditLog: mongoose.Model<any, {}, {}, {}, any, any> | mongoose.Model<{
    action: string;
    entity: string;
    userId?: mongoose.Types.ObjectId;
    entityId?: string;
    oldData?: any;
    newData?: any;
    ipAddress?: string;
    userAgent?: string;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    action: string;
    entity: string;
    userId?: mongoose.Types.ObjectId;
    entityId?: string;
    oldData?: any;
    newData?: any;
    ipAddress?: string;
    userAgent?: string;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    action: string;
    entity: string;
    userId?: mongoose.Types.ObjectId;
    entityId?: string;
    oldData?: any;
    newData?: any;
    ipAddress?: string;
    userAgent?: string;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    action: string;
    entity: string;
    userId?: mongoose.Types.ObjectId;
    entityId?: string;
    oldData?: any;
    newData?: any;
    ipAddress?: string;
    userAgent?: string;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    action: string;
    entity: string;
    userId?: mongoose.Types.ObjectId;
    entityId?: string;
    oldData?: any;
    newData?: any;
    ipAddress?: string;
    userAgent?: string;
} & mongoose.DefaultTimestampProps>, {}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & mongoose.FlatRecord<{
    action: string;
    entity: string;
    userId?: mongoose.Types.ObjectId;
    entityId?: string;
    oldData?: any;
    newData?: any;
    ipAddress?: string;
    userAgent?: string;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=Invoice.d.ts.map