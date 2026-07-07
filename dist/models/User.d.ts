import mongoose, { Document } from 'mongoose';
export type UserRole = 'CUSTOMER' | 'SALES_STAFF' | 'INVENTORY_MANAGER' | 'STORE_MANAGER' | 'ADMIN' | 'SUPER_ADMIN';
export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    phone?: string;
    passwordHash?: string;
    name: string;
    role: UserRole;
    isActive: boolean;
    isVerified: boolean;
    avatar?: string;
    googleId?: string;
    lastLogin?: Date;
    emailOTP?: string;
    emailOTPExpiry?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: mongoose.Model<IUser>;
//# sourceMappingURL=User.d.ts.map