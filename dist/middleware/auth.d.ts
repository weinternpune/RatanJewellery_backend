import { Request, RequestHandler } from 'express';
import { UserRole } from '../models/User';
declare module 'express-serve-static-core' {
    interface Request {
        user?: {
            id: string;
            email: string;
            role: UserRole;
            name: string;
        };
    }
}
export type AuthRequest = Request;
export declare const authenticate: RequestHandler;
export declare const authorize: (...roles: UserRole[]) => RequestHandler;
//# sourceMappingURL=auth.d.ts.map