"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customerController_1 = require("../controllers/customerController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const staffRoles = ["SALES_STAFF", "INVENTORY_MANAGER", "STORE_MANAGER", "ADMIN", "SUPER_ADMIN"];
router.get("/", (0, auth_1.authorize)(...staffRoles), customerController_1.getCustomers);
router.get("/:id", (0, auth_1.authorize)(...staffRoles), customerController_1.getCustomerById);
// edit and delete 
router.put("/:id", (0, auth_1.authorize)(...staffRoles), customerController_1.updateCustomer);
router.delete("/:id", (0, auth_1.authorize)("ADMIN", "SUPER_ADMIN", "STORE_MANAGER"), customerController_1.deleteCustomer);
exports.default = router;
//# sourceMappingURL=customers.js.map