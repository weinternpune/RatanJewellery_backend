import mongoose, { Document } from 'mongoose';
export interface IProduct extends Document {
    sku: string;
    barcode?: string;
    name: string;
    slug: string;
    description?: string;
    categoryId: mongoose.Types.ObjectId;
    metal: string;
    purity: string;
    grossWeight: number;
    netWeight: number;
    stoneWeight: number;
    makingCharges: number;
    stoneCharges: number;
    hsnCode: string;
    warrantyMonths: number;
    careInstructions?: string;
    bisHallmark?: string;
    images: string[];
    isActive: boolean;
    isFeatured: boolean;
    isTrending: boolean;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const Product: mongoose.Model<IProduct>;
//# sourceMappingURL=Product.d.ts.map