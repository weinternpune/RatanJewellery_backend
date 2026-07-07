import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const login: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const sendOTPHandler: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const verifyOTPHandler: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const resetPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const googleCallback: (req: Request, res: Response) => Promise<void>;
export declare const refreshToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const logout: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getMe: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const sendEmailOTP: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const verifyEmailOTP: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const checkAccountExists: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const sendPasswordResetOTP: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const resetPasswordWithOTP: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map