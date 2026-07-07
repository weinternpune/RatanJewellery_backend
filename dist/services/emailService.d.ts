interface EmailOptions {
    to: string;
    subject: string;
    template: string;
    data: Record<string, any>;
}
export declare const sendEmail: (options: EmailOptions) => Promise<void>;
export {};
//# sourceMappingURL=emailService.d.ts.map