"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customJewelleryController_1 = require("../controllers/customJewelleryController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const auth = auth_1.authenticate;
router.post('/', customJewelleryController_1.createRequest);
router.get('/', auth, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'STORE_MANAGER'), customJewelleryController_1.getRequests);
exports.default = router;
//# sourceMappingURL=customJewellery.js.map