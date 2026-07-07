export declare function sendOTP(identifier: string, type: 'phone' | 'email', purpose: 'register' | 'login' | 'reset_password'): Promise<{
    success: boolean;
    message: string;
}>;
export declare function verifyOTP(identifier: string, code: string, purpose: 'register' | 'login' | 'reset_password'): Promise<{
    success: boolean;
    message: string;
}>;
//# sourceMappingURL=otpService.d.ts.map