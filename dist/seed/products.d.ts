/**
 * backend/src/seed/products.ts
 *
 * Seeds ALL products for Ratan Jewellers:
 *   • 37 catalogue products  (from src/lib/products.ts — real slugs)
 *   • 12 demo products       (product-0…product-5 + 6 trending slugs used
 *                             by ProductDetailPage's MOCK_PRODUCTS hardcoded routes)
 *   Total: 49 documents
 *
 * HOW TO RUN (from the backend/ directory):
 *   npx ts-node -r tsconfig-paths/register src/seed/products.ts
 *
 * Or add to backend/package.json:
 *   "seed:products": "ts-node -r tsconfig-paths/register src/seed/products.ts"
 * then:
 *   npm run seed:products
 *
 * Safe to re-run — uses upsert on slug, so existing documents are updated.
 */
export {};
//# sourceMappingURL=products.d.ts.map