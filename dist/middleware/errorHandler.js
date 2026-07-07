"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const logger_1 = require("../utils/logger");
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, _next) => {
    logger_1.logger.error(`${req.method} ${req.path} - ${err.message}`, err);
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }
    // Prisma errors
    if (err.message.includes('Unique constraint')) {
        return res.status(409).json({
            success: false,
            message: 'A record with this information already exists.',
        });
    }
    if (err.message.includes('Record to update not found')) {
        return res.status(404).json({
            success: false,
            message: 'Record not found.',
        });
    }
    // Default
    return res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map