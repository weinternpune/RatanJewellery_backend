interface WAMessagePayload {
    invoiceId: string;
    phone: string;
    pdfUrl: string;
    customerName: string;
    invoiceNumber: string;
    totalAmount: number;
}
export declare const sendWhatsAppMessage: (payload: WAMessagePayload) => Promise<void>;
export {};
//# sourceMappingURL=whatsappService.d.ts.map