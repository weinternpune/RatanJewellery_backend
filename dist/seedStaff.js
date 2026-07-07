"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("./models/User");
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ratan_jewellers';
const STAFF = [
    { name: 'Uttam Kumar', email: 'uttamkumar86830@gmail.com', phone: '+917507510948', password: 'SuperAdmin@2025#RJ', role: 'SUPER_ADMIN' },
    { name: 'Priya Mehta', email: 'priya@ratanjewellers.com', phone: '+918765432109', password: 'Admin@2025#RJ', role: 'ADMIN' },
    { name: 'Suresh Patel', email: 'suresh@ratanjewellers.com', phone: '+917654321098', password: 'Manager@2025#RJ', role: 'STORE_MANAGER' },
    { name: 'Anita Das', email: 'anita@ratanjewellers.com', phone: '+916543210987', password: 'Inventory@2025#RJ', role: 'INVENTORY_MANAGER' },
    { name: 'Vikram Singh', email: 'vikram@ratanjewellers.com', phone: '+915432109876', password: 'Sales@2025#RJ', role: 'SALES_STAFF' },
    { name: 'Kavya Reddy', email: 'kavya@ratanjewellers.com', phone: '+914321098765', password: 'Sales2@2025#RJ', role: 'SALES_STAFF' },
];
async function seed() {
    await mongoose_1.default.connect(MONGODB_URI);
    console.log('\nSeeding staff accounts (force password reset)...\n');
    for (const s of STAFF) {
        const hash = await bcryptjs_1.default.hash(s.password, 12);
        // ── Hard overwrite: explicitly set every field, $unset any stale OTP fields ──
        const result = await User_1.User.findOneAndUpdate({ email: s.email.toLowerCase() }, {
            $set: {
                name: s.name,
                email: s.email.toLowerCase(),
                phone: s.phone,
                passwordHash: hash,
                role: s.role,
                isActive: true,
                isVerified: true,
            },
            $unset: { emailOTP: '', emailOTPExpiry: '' },
        }, { upsert: true, new: true, setDefaultsOnInsert: true });
        // ── Immediately verify the hash actually matches ──────────────────────
        const verifyMatch = await bcryptjs_1.default.compare(s.password, result.passwordHash || '');
        console.log(`  ${verifyMatch ? '✓' : '✗ MISMATCH!'} ${s.role.padEnd(20)} ${s.email}`);
        console.log(`      id: ${result._id} | role saved: ${result.role} | verified: ${result.isVerified} | active: ${result.isActive} | password check: ${verifyMatch}`);
    }
    console.log('\nDone! If any line shows "✗ MISMATCH", re-run this script.\n');
    console.log('Login credentials:');
    STAFF.forEach(s => console.log(`  ${s.email.padEnd(38)} ${s.password}`));
    await mongoose_1.default.disconnect();
    process.exit(0);
}
seed().catch(e => {
    console.error('Seed failed:', e.message);
    process.exit(1);
});
//# sourceMappingURL=seedStaff.js.map