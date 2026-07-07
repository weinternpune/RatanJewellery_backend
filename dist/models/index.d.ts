import mongoose, { Document } from 'mongoose';
export interface ICategory extends Document {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parentId?: mongoose.Types.ObjectId;
    isActive: boolean;
    sortOrder: number;
}
export declare const Category: mongoose.Model<ICategory>;
export interface IGoldRate extends Document {
    purity: string;
    ratePerGram: number;
    date: Date;
    source: string;
}
export declare const GoldRate: mongoose.Model<IGoldRate>;
export interface IInventory extends Document {
    productId: mongoose.Types.ObjectId;
    currentStock: number;
    reservedStock: number;
    lowStockAlert: number;
    location?: string;
    supplierId?: mongoose.Types.ObjectId;
    lastRestocked?: Date;
}
export declare const Inventory: mongoose.Model<IInventory>;
export interface ISession extends Document {
    userId: mongoose.Types.ObjectId;
    token: string;
    expiresAt: Date;
}
export declare const Session: mongoose.Model<ISession>;
export interface ISupplier extends Document {
    name: string;
    email?: string;
    phone: string;
    address?: object;
    gstin?: string;
    isActive: boolean;
}
export declare const Supplier: mongoose.Model<ISupplier>;
//# sourceMappingURL=index.d.ts.map