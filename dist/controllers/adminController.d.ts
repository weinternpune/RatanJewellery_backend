import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const clearAllBillingData: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getDashboardStats: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getAllUsers: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createStaffUser: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const getUserById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const resetStaffPassword: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteUser: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=adminController.d.ts.map