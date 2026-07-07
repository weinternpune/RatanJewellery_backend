import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const createInvoice: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getInvoices: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getInvoiceById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateInvoice: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteInvoice: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const resendWhatsApp: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getGSTSummary: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=invoiceController.d.ts.map