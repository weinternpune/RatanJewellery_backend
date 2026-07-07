"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsController_1 = require("../controllers/analyticsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'STORE_MANAGER'));
router.get('/sales', analyticsController_1.getSalesDashboard);
router.get('/inventory', analyticsController_1.getInventoryAnalytics);
router.get('/customers', analyticsController_1.getCustomerAnalytics);
exports.default = router;
//# sourceMappingURL=analytics.js.map