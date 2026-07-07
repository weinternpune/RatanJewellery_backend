"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductBySlug = exports.getProducts = void 0;
const mongoose_1 = require("mongoose");
const Product_1 = require("../models/Product");
const index_1 = require("../models/index");
const Invoice_1 = require("../models/Invoice");
const errorHandler_1 = require("../middleware/errorHandler");
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// ─── helper: add `id` string field so frontend product.id works everywhere ─────
const withId = (p) => ({ ...p, id: p._id?.toString() ?? p.id });
const getProducts = async (req, res, next) => {
    try {
        const { page = "1", limit = "100", // frontend fetches all and filters client-side
        category, metal, purity, search, featured, trending, sortBy = "createdAt", sortOrder = "desc", } = req.query;
        const pageNum = parseInt(page);
        const limitNum = Math.min(200, parseInt(limit));
        const filter = {};
        // ── category: accepts comma-separated names OR slugs OR ObjectIds ──────────
        if (category) {
            const categoryValues = category
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean);
            const categoryIds = categoryValues.filter((v) => mongoose_1.Types.ObjectId.isValid(v));
            const categorySlugs = categoryValues.map((v) => v.toLowerCase());
            const matchedCategories = await index_1.Category.find({
                isActive: true,
                $or: [
                    { slug: { $in: categorySlugs } },
                    {
                        name: {
                            $in: categoryValues.map((v) => new RegExp(`^${escapeRegExp(v)}$`, "i")),
                        },
                    },
                ],
            })
                .select("_id")
                .lean();
            filter.categoryId = {
                $in: [...categoryIds, ...matchedCategories.map((c) => c._id)],
            };
        }
        // ── metal / purity: case-insensitive comma-separated ──────────────────────
        if (metal) {
            filter.metal = {
                $in: metal
                    .split(",")
                    .map((v) => new RegExp(`^${escapeRegExp(v.trim())}$`, "i")),
            };
        }
        if (purity) {
            filter.purity = {
                $in: purity
                    .split(",")
                    .map((v) => new RegExp(`^${escapeRegExp(v.trim())}$`, "i")),
            };
        }
        if (featured === "true")
            filter.isFeatured = true;
        if (trending === "true")
            filter.isTrending = true;
        if (search) {
            const q = escapeRegExp(search.trim());
            filter.$or = [
                { name: { $regex: q, $options: "i" } },
                { sku: { $regex: q, $options: "i" } },
                { keywords: { $regex: q, $options: "i" } },
            ];
        }
        const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
        // ── gold rate ─────────────────────────────────────────────────────────────
        const latestGoldRate = await index_1.GoldRate.findOne().sort({ createdAt: -1 });
        const goldRate = latestGoldRate?.ratePerGram || 6500;
        // ── query ─────────────────────────────────────────────────────────────────
        const [products, total] = await Promise.all([
            Product_1.Product.find(filter)
                .populate("categoryId", "name slug")
                .sort(sort)
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .lean(),
            Product_1.Product.countDocuments(filter),
        ]);
        // ── inventory map ─────────────────────────────────────────────────────────
        const inventories = await index_1.Inventory.find({
            productId: { $in: products.map((p) => p._id) },
        }).lean();
        const invMap = Object.fromEntries(inventories.map((i) => [i.productId.toString(), i]));
        // ── review map ────────────────────────────────────────────────────────────
        const reviews = await Invoice_1.Review.find({
            productId: { $in: products.map((p) => p._id) },
            isApproved: true,
        }).lean();
        const reviewMap = {};
        reviews.forEach((r) => {
            const k = r.productId.toString();
            if (!reviewMap[k])
                reviewMap[k] = [];
            reviewMap[k].push(r);
        });
        // ── enrich + normalise ────────────────────────────────────────────────────
        const enriched = products.map((p) => {
            const inv = invMap[p._id.toString()];
            const revs = reviewMap[p._id.toString()] || [];
            const currentPrice = Math.round(p.netWeight * goldRate + p.makingCharges + p.stoneCharges);
            // category: frontend accepts both string and { name } object
            const category = p.categoryId?.name ??
                (typeof p.category === "string"
                    ? p.category
                    : (p.category?.name ?? ""));
            return withId({
                ...p,
                currentPrice,
                goldRate,
                category,
                image: p.image || p.images?.[0] || "",
                avgRating: revs.length
                    ? +(revs.reduce((a, r) => a + r.rating, 0) / revs.length).toFixed(1)
                    : (p.avgRating ?? 0),
                reviewCount: revs.length || p.reviewCount || 0,
                inStock: inv
                    ? (inv.currentStock || 0) - (inv.reservedStock || 0) > 0
                    : (p.inStock ?? true),
            });
        });
        // ── response — shape the frontend expects: { products: [...] } ────────────
        res.json({ products: enriched });
    }
    catch (err) {
        next(err);
    }
};
exports.getProducts = getProducts;
const getProductBySlug = async (req, res, next) => {
    try {
        const raw = await Product_1.Product.findOne({ slug: req.params.slug })
            .populate("categoryId")
            .lean();
        if (!raw)
            throw new errorHandler_1.AppError("Product not found", 404);
        const latestGoldRate = await index_1.GoldRate.findOne().sort({ createdAt: -1 });
        const goldRate = latestGoldRate?.ratePerGram || 6500;
        const currentPrice = Math.round(raw.netWeight * goldRate + raw.makingCharges + raw.stoneCharges);
        const [inventory, reviews, relatedRaw] = await Promise.all([
            index_1.Inventory.findOne({ productId: raw._id }).lean(),
            Invoice_1.Review.find({ productId: raw._id, isApproved: true }).limit(20).lean(),
            Product_1.Product.find({
                categoryId: raw.categoryId,
                _id: { $ne: raw._id },
                isActive: true,
            })
                .limit(8)
                .lean(),
        ]);
        const revs = reviews;
        const avgRating = revs.length
            ? +(revs.reduce((a, r) => a + r.rating, 0) / revs.length).toFixed(1)
            : (raw.avgRating ?? 0);
        const category = raw.categoryId?.name ??
            (typeof raw.category === "string"
                ? raw.category
                : (raw.category?.name ?? ""));
        const related = relatedRaw.map(withId);
        // ── response — shape the frontend expects: { product: {...} } ─────────────
        res.json({
            product: withId({
                ...raw,
                currentPrice,
                goldRate,
                category,
                image: raw.image || raw.images?.[0] || "",
                avgRating,
                reviewCount: revs.length || raw.reviewCount || 0,
                inStock: inventory
                    ? ((inventory.currentStock || 0) -
                        (inventory.reservedStock || 0) > 0)
                    : (raw.inStock ?? true),
                inventory,
                reviews,
                related,
            }),
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getProductBySlug = getProductBySlug;
// ── createProduct, updateProduct, deleteProduct — unchanged ───────────────────
const createProduct = async (req, res, next) => {
    try {
        const data = req.body;
        if (!data.sku) {
            const count = await Product_1.Product.countDocuments();
            data.sku = `RJ${String(count + 1).padStart(5, "0")}`;
        }
        data.slug =
            data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "") +
                "-" +
                data.sku.toLowerCase();
        const product = await Product_1.Product.create(data);
        await index_1.Inventory.create({
            productId: product._id,
            currentStock: data.initialStock || 0,
        });
        res
            .status(201)
            .json({ success: true, message: "Product created", data: product });
    }
    catch (err) {
        next(err);
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res, next) => {
    try {
        const product = await Product_1.Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!product)
            throw new errorHandler_1.AppError("Product not found", 404);
        res.json({ success: true, message: "Product updated", data: product });
    }
    catch (err) {
        next(err);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res, next) => {
    try {
        await Product_1.Product.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ success: true, message: "Product deactivated" });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteProduct = deleteProduct;
//# sourceMappingURL=productController.js.map