import { Request, Response, NextFunction } from "express";
export declare const getCustomers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getCustomerById: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const updateCustomer: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const deleteCustomer: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=customerController.d.ts.map