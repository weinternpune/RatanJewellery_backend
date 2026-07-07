"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Only Super Admin, Admin, and Store Manager can access these routes
router.delete('/clear-billing-data', (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'STORE_MANAGER'), adminController_1.clearAllBillingData);
router.get('/dashboard-stats', (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'STORE_MANAGER', 'SALES_STAFF'), adminController_1.getDashboardStats);
router.get("/users", (0, auth_1.authorize)("SUPER_ADMIN", "ADMIN"), adminController_1.getAllUsers);
router.post("/users", (0, auth_1.authorize)("SUPER_ADMIN"), adminController_1.createStaffUser);
router.get("/users/:id", (0, auth_1.authorize)("SUPER_ADMIN", "ADMIN"), adminController_1.getUserById);
router.post("/users/:id/reset-password", (0, auth_1.authorize)("SUPER_ADMIN"), adminController_1.resetStaffPassword);
//delete route
router.delete("/users/:id", (0, auth_1.authorize)("SUPER_ADMIN"), adminController_1.deleteUser);
exports.default = router;
//# sourceMappingURL=admin.js.map