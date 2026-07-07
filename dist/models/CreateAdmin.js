"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("./User");
dotenv_1.default.config();
const ADMIN_EMAIL = "prabinakumardas90@gmail.com";
const ADMIN_PASSWORD = "Admin@2025";
async function createAdmin() {
    try {
        const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ratan_jewellers";
        await mongoose_1.default.connect(uri);
        console.log("Connected to host:", mongoose_1.default.connection.host, "| db:", mongoose_1.default.connection.name);
        // Wipe any existing record for this email so a stale/partial account
        // (no password, wrong role, OAuth-created, etc.) can't block login.
        const deleted = await User_1.User.deleteMany({ email: ADMIN_EMAIL.toLowerCase().trim() });
        console.log("Removed existing records:", deleted.deletedCount);
        const passwordHash = await bcryptjs_1.default.hash(ADMIN_PASSWORD, 12);
        const admin = await User_1.User.create({
            email: ADMIN_EMAIL.toLowerCase().trim(),
            passwordHash,
            name: "Priya",
            role: "SUPER_ADMIN",
            isActive: true,
            isVerified: true,
        });
        console.log("✅ Admin ready:", admin.email, admin.role, admin._id.toString());
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
    catch (error) {
        console.error("Error creating admin user:", error);
        process.exit(1);
    }
}
createAdmin();
//# sourceMappingURL=CreateAdmin.js.map