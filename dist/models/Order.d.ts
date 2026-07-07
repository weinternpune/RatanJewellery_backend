import mongoose, { Document } from 'mongoose';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export interface IOrderItem {
    productId: string;
    name: string;
    sku: string;
    image: string;
    purity: string;
    weight: number;
    price: number;
    quantity: number;
}
export interface IOrder extends Document {
    _id: mongoose.Types.ObjectId;
    orderNumber: string;
    userId: mongoose.Types.ObjectId;
    items: IOrderItem[];
    address: {
        name: string;
        phone: string;
        line1: string;
        line2?: string;
        city: string;
        state: string;
        pincode: string;
    };
    paymentMethod: string;
    subtotal: number;
    gst: number;
    deliveryCharge: number;
    discount: number;
    grandTotal: number;
    status: OrderStatus;
    couponCode?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Order: mongoose.Model<IOrder>;
//# sourceMappingURL=Order.d.ts.map