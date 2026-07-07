"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGSTSummary = exports.resendWhatsApp = exports.deleteInvoice = exports.updateInvoice = exports.getInvoiceById = exports.getInvoices = exports.createInvoice = void 0;
const Invoice_1 = require("../models/Invoice");
const errorHandler_1 = require("../middleware/errorHandler");
const pdfService_1 = require("../services/pdfService");
const whatsappService_1 = require("../services/whatsappService");
const emailService_1 = require("../services/emailService");
const generateInvoiceNumber = async () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const prefix = `RJ-${year}${month}-`;
    const lastInvoice = await Invoice_1.Invoice
        .findOne({
        invoiceNumber: { $regex: `^${prefix}` }
    })
        .sort({ invoiceNumber: -1 });
    let nextNumber = 1;
    if (lastInvoice) {
        const parts = lastInvoice.invoiceNumber.split('-');
        nextNumber = parseInt(parts[2], 10) + 1;
    }
    return `${prefix}${String(nextNumber).padStart(4, '0')}`;
};
const createInvoice = async (req, res, next) => {
    try {
        const { customerId, customerName, customerPhone, customerEmail, customerAddress, customerGstin, items, paymentMode, discountAmount = 0, oldGoldExchange = 0, notes } = req.body;
        const invoiceNumber = await generateInvoiceNumber();
        let subtotal = 0, totalCgst = 0, totalSgst = 0;
        const processedItems = items.map((item) => {
            const goldValue = item.netWeight * item.goldRate;
            const unitPrice = goldValue + item.makingCharges + item.stoneCharges;
            const base = unitPrice * item.quantity;
            const cgstAmount = base * (item.cgstRate || 1.5) / 100;
            const sgstAmount = base * (item.sgstRate || 1.5) / 100;
            subtotal += base;
            totalCgst += cgstAmount;
            totalSgst += sgstAmount;
            return { ...item, unitPrice, cgstAmount, sgstAmount, totalAmount: base + cgstAmount + sgstAmount };
        });
        const totalAmount = subtotal + totalCgst + totalSgst - discountAmount - oldGoldExchange;
        const invoice = await Invoice_1.Invoice.create({ invoiceNumber, userId: req.user.id, customerId: customerId || undefined, customerName, customerPhone, customerEmail, customerAddress, customerGstin, paymentMode, subtotal, discountAmount, cgst: totalCgst, sgst: totalSgst, totalAmount, oldGoldExchange, notes, items: processedItems });
        (0, pdfService_1.generateInvoicePDF)(invoice).then(async (pdfUrl) => {
            await Invoice_1.Invoice.findByIdAndUpdate(invoice._id, { pdfUrl });
            if (customerPhone)
                await (0, whatsappService_1.sendWhatsAppMessage)({ invoiceId: invoice._id.toString(), phone: customerPhone, pdfUrl, customerName, invoiceNumber, totalAmount });
            if (customerEmail)
                await (0, emailService_1.sendEmail)({ to: customerEmail, subject: `Invoice ${invoiceNumber} - Ratan Jewellers`, template: 'invoice', data: { customerName, invoiceNumber, totalAmount, pdfUrl } });
        }).catch(console.error);
        res.status(201).json({ success: true, message: 'Invoice created', data: invoice });
    }
    catch (err) {
        next(err);
    }
};
exports.createInvoice = createInvoice;
const getInvoices = async (req, res, next) => {
    try {
        const { page = '1', limit = '20', search, startDate, endDate } = req.query;
        const pageNum = parseInt(page), limitNum = parseInt(limit);
        const filter = {};
        if (search)
            filter.$or = [{ invoiceNumber: { $regex: search, $options: 'i' } }, { customerName: { $regex: search, $options: 'i' } }, { customerPhone: { $regex: search } }];
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(startDate);
            if (endDate)
                filter.createdAt.$lte = new Date(endDate);
        }
        const [invoices, total] = await Promise.all([Invoice_1.Invoice.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum), Invoice_1.Invoice.countDocuments(filter)]);
        res.json({ success: true, data: { invoices, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } } });
    }
    catch (err) {
        next(err);
    }
};
exports.getInvoices = getInvoices;
const getInvoiceById = async (req, res, next) => {
    try {
        // First try to find by invoiceNumber, then by ObjectId
        let invoice = await Invoice_1.Invoice.findOne({ invoiceNumber: req.params.id });
        if (!invoice) {
            invoice = await Invoice_1.Invoice.findById(req.params.id);
        }
        if (!invoice)
            throw new errorHandler_1.AppError('Invoice not found', 404);
        res.json({ success: true, data: invoice });
    }
    catch (err) {
        next(err);
    }
};
exports.getInvoiceById = getInvoiceById;
const updateInvoice = async (req, res, next) => {
    try {
        // First try to find by invoiceNumber, then by ObjectId
        let invoice = await Invoice_1.Invoice.findOne({ invoiceNumber: req.params.id });
        if (!invoice) {
            invoice = await Invoice_1.Invoice.findById(req.params.id);
        }
        if (!invoice)
            throw new errorHandler_1.AppError('Invoice not found', 404);
        const updateData = { ...req.body, isEdited: true };
        if (invoice.isEdited) {
            updateData.editHistory = [...(invoice.editHistory || []), { editedAt: new Date(), editedBy: req.user.id, changes: req.body }];
        }
        else {
            updateData.editHistory = [{ editedAt: new Date(), editedBy: req.user.id, changes: req.body }];
        }
        const updatedInvoice = await Invoice_1.Invoice.findByIdAndUpdate(invoice._id, updateData, { new: true });
        res.json({ success: true, message: 'Invoice updated', data: updatedInvoice });
    }
    catch (err) {
        next(err);
    }
};
exports.updateInvoice = updateInvoice;
const deleteInvoice = async (req, res, next) => {
    try {
        console.log('Delete request for ID:', req.params.id);
        // First try to find by invoiceNumber, then by ObjectId
        let invoice = await Invoice_1.Invoice.findOne({ invoiceNumber: req.params.id });
        console.log('Found by invoiceNumber:', invoice ? 'Yes' : 'No');
        if (!invoice) {
            console.log('Trying to find by ObjectId...');
            // Only try ObjectId if it looks like a valid ObjectId (24 hex characters)
            if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
                invoice = await Invoice_1.Invoice.findById(req.params.id);
                console.log('Found by ObjectId:', invoice ? 'Yes' : 'No');
            }
        }
        if (!invoice) {
            console.log('Invoice not found with ID:', req.params.id);
            throw new errorHandler_1.AppError('Invoice not found', 404);
        }
        console.log('Deleting invoice with MongoDB _id:', invoice._id);
        // Delete using the actual _id (ensure it's properly converted)
        const result = await Invoice_1.Invoice.findByIdAndDelete(invoice._id);
        console.log('Delete result:', result ? 'Success' : 'Failed');
        res.json({ success: true, message: 'Invoice deleted successfully' });
    }
    catch (err) {
        console.error('Delete invoice error:', err);
        next(err);
    }
};
exports.deleteInvoice = deleteInvoice;
const resendWhatsApp = async (req, res, next) => {
    try {
        // First try to find by invoiceNumber, then by ObjectId
        let invoice = await Invoice_1.Invoice.findOne({ invoiceNumber: req.params.id });
        if (!invoice) {
            invoice = await Invoice_1.Invoice.findById(req.params.id);
        }
        if (!invoice)
            throw new errorHandler_1.AppError('Invoice not found', 404);
        if (!invoice.pdfUrl)
            throw new errorHandler_1.AppError('PDF not yet generated', 400);
        await (0, whatsappService_1.sendWhatsAppMessage)({ invoiceId: invoice._id.toString(), phone: invoice.customerPhone, pdfUrl: invoice.pdfUrl, customerName: invoice.customerName, invoiceNumber: invoice.invoiceNumber, totalAmount: invoice.totalAmount });
        res.json({ success: true, message: 'WhatsApp message queued' });
    }
    catch (err) {
        next(err);
    }
};
exports.resendWhatsApp = resendWhatsApp;
const getGSTSummary = async (req, res, next) => {
    try {
        const { month, year } = req.query;
        const startDate = new Date(`${year}-${String(month).padStart(2, '0')}-01`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        const result = await Invoice_1.Invoice.aggregate([{ $match: { createdAt: { $gte: startDate, $lt: endDate } } }, { $group: { _id: null, totalSales: { $sum: '$subtotal' }, totalCgst: { $sum: '$cgst' }, totalSgst: { $sum: '$sgst' }, totalIgst: { $sum: '$igst' }, count: { $sum: 1 } } }]);
        const s = result[0] || { totalSales: 0, totalCgst: 0, totalSgst: 0, totalIgst: 0, count: 0 };
        res.json({ success: true, data: { ...s, totalTax: s.totalCgst + s.totalSgst + s.totalIgst } });
    }
    catch (err) {
        next(err);
    }
};
exports.getGSTSummary = getGSTSummary;
//# sourceMappingURL=invoiceController.js.map