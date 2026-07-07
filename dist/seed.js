"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("./lib/db");
const User_1 = require("./models/User");
const Customer_1 = require("./models/Customer");
const index_1 = require("./models/index");
async function seed() {
    await (0, db_1.connectDB)();
    console.log('🌱 Seeding MongoDB...');
    const existing = await User_1.User.findOne({ email: 'admin@ratanjewellers.com' });
    if (!existing) {
        const hash = await bcryptjs_1.default.hash('Admin@1234!', 12);
        const user = await User_1.User.create({ email: 'admin@ratanjewellers.com', name: 'Super Admin', role: 'SUPER_ADMIN', isVerified: true, passwordHash: hash });
        await Customer_1.Customer.create({ userId: user._id, referralCode: 'ADMIN001' });
        console.log('✅ Admin created: admin@ratanjewellers.com / Admin@1234!');
    }
    else {
        console.log('ℹ️  Admin already exists');
    }
    const purities = { '24K': 1, '22K': 0.916, '18K': 0.75, '14K': 0.585 };
    for (const [purity, mult] of Object.entries(purities)) {
        await index_1.GoldRate.findOneAndUpdate({ purity }, { purity, ratePerGram: Math.round(6500 * mult), date: new Date(), source: 'SEED' }, { upsert: true });
    }
    console.log('✅ Gold rates seeded');
    const cats = ['Necklaces', 'Rings', 'Bangles', 'Earrings', 'Chains', 'Pendants', 'Bracelets', 'Mangalsutras', 'Anklets', 'Bridal Sets'];
    for (const name of cats) {
        await index_1.Category.findOneAndUpdate({ slug: name.toLowerCase().replace(/ /g, '-') }, { name, slug: name.toLowerCase().replace(/ /g, '-'), isActive: true }, { upsert: true });
    }
    console.log('✅ Categories seeded\n🎉 Done!');
    process.exit(0);
}
seed().catch(e => { console.error(e); process.exit(1); });
//# sourceMappingURL=seed.js.map