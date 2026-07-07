"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWhatsAppMessage = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../utils/logger");
const sendWhatsAppMessage = async (payload) => {
    const { phone, pdfUrl, customerName, invoiceNumber, totalAmount, } = payload;
    const sendWithRetry = async (attempt) => {
        try {
            const formattedPhone = phone.startsWith('+')
                ? phone.substring(1)
                : `91${phone.replace(/\D/g, '')}`;
            const response = await axios_1.default.post(`https://graph.facebook.com/v18.0/${process.env.META_PHONE_NUMBER_ID}/messages`, {
                messaging_product: 'whatsapp',
                to: formattedPhone,
                type: 'template',
                template: {
                    name: 'invoice_notification',
                    language: {
                        code: 'en_IN',
                    },
                    components: [
                        {
                            type: 'header',
                            parameters: [
                                {
                                    type: 'document',
                                    document: {
                                        link: pdfUrl,
                                        filename: `Invoice_${invoiceNumber}.pdf`,
                                    },
                                },
                            ],
                        },
                        {
                            type: 'body',
                            parameters: [
                                {
                                    type: 'text',
                                    text: customerName,
                                },
                                {
                                    type: 'text',
                                    text: invoiceNumber,
                                },
                                {
                                    type: 'text',
                                    text: `₹${totalAmount.toLocaleString('en-IN')}`,
                                },
                            ],
                        },
                    ],
                },
            }, {
                headers: {
                    Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            });
            logger_1.logger.info(`WhatsApp sent successfully to ${phone} for invoice ${invoiceNumber}`);
            logger_1.logger.info(response.data);
        }
        catch (error) {
            logger_1.logger.error(`WhatsApp send attempt ${attempt} failed`);
            logger_1.logger.error(error.message);
            if (attempt < 3) {
                await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
                await sendWithRetry(attempt + 1);
            }
            else {
                logger_1.logger.error(`WhatsApp failed permanently for ${phone}`);
                await sendSMSFallback(phone, invoiceNumber, totalAmount);
            }
        }
    };
    await sendWithRetry(1);
};
exports.sendWhatsAppMessage = sendWhatsAppMessage;
const sendSMSFallback = async (phone, invoiceNumber, totalAmount) => {
    logger_1.logger.info(`SMS fallback triggered for ${phone}`);
    logger_1.logger.info({
        invoiceNumber,
        totalAmount,
    });
};
//# sourceMappingURL=whatsappService.js.map