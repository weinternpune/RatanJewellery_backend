import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const placeOrder: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getMyOrders: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getOrderById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const cancelOrder: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getAllOrders: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateOrderStatus: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteOrder: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=orderController.d.ts.map