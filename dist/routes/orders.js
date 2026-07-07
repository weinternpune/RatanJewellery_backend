"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const orderController_1 = require("../controllers/orderController");
const router = (0, express_1.Router)();
const auth = auth_1.authenticate;
// Customer routes
router.post('/', auth, orderController_1.placeOrder);
router.get('/my-orders', auth, orderController_1.getMyOrders);
router.get('/:id', auth, orderController_1.getOrderById);
router.patch('/:id/cancel', auth, orderController_1.cancelOrder);
// Admin routes
router.get('/', auth, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'STORE_MANAGER', 'SALES_STAFF'), orderController_1.getAllOrders);
router.put('/:id/status', auth, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'STORE_MANAGER'), orderController_1.updateOrderStatus);
router.delete('/:id', auth, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'STORE_MANAGER'), orderController_1.deleteOrder);
exports.default = router;
//# sourceMappingURL=orders.js.map