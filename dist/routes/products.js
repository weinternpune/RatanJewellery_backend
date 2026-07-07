"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', productController_1.getProducts);
router.get('/:slug', productController_1.getProductBySlug);
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'STORE_MANAGER'), productController_1.createProduct);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN', 'STORE_MANAGER'), productController_1.updateProduct);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'SUPER_ADMIN'), productController_1.deleteProduct);
exports.default = router;
//# sourceMappingURL=products.js.map