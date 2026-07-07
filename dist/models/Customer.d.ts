import mongoose, { Document } from 'mongoose';
export interface ICustomer extends Document {
    userId: mongoose.Types.ObjectId;
    gstin?: string;
    dateOfBirth?: Date;
    anniversary?: Date;
    address?: object;
    loyaltyPoints: number;
    totalPurchases: number;
    referralCode: string;
    referredBy?: string;
    segment: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Customer: mongoose.Model<ICustomer>;
//# sourceMappingURL=Customer.d.ts.map