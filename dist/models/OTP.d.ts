import mongoose, { Document } from 'mongoose';
export interface IOTP extends Document {
    identifier: string;
    type: 'phone' | 'email';
    purpose: 'register' | 'login' | 'reset_password';
    code: string;
    expiresAt: Date;
    verified: boolean;
    attempts: number;
}
export declare const OTP: mongoose.Model<IOTP>;
//# sourceMappingURL=OTP.d.ts.map