"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoiceController_1 = require("../controllers/invoiceController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', invoiceController_1.getInvoices);
router.post('/', (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'STORE_MANAGER', 'SALES_STAFF'), invoiceController_1.createInvoice);
router.get('/gst-summary', (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'STORE_MANAGER'), invoiceController_1.getGSTSummary);
router.get('/:id', invoiceController_1.getInvoiceById);
router.put('/:id', (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'STORE_MANAGER'), invoiceController_1.updateInvoice);
router.delete('/:id', (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'STORE_MANAGER'), invoiceController_1.deleteInvoice);
router.post('/:id/resend-whatsapp', invoiceController_1.resendWhatsApp);
exports.default = router;
//# sourceMappingURL=invoices.js.map