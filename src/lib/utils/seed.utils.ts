import bcrypt from "bcryptjs";
import { Admin } from "../models/admin.model";

/**
 * Seeded admin logins (for dev / initial setup). Use these to sign in at the admin login page.
 * In production, set SEED_ON_BOOT=false or change passwords after first login.
 *
 * - admin@cargopulse.com / admin@CargoPulse123
 * - superadmin@cargopulse.com / SuperAdmin@CargoPulse456
 * - support@cargopulse.com / Support@CargoPulse789
 */
const ADMIN_SEED_ENTRIES: { email: string; plainPassword: string }[] = [
    { email: "admin@cargopulse.com", plainPassword: "admin@CargoPulse123" },
    { email: "superadmin@cargopulse.com", plainPassword: "SuperAdmin@CargoPulse456" },
    { email: "support@cargopulse.com", plainPassword: "Support@CargoPulse789" },
];

export default async function runSeed() {
    console.log("[SEED] ▶️ Seeding started...");

    for (const { email, plainPassword } of ADMIN_SEED_ENTRIES) {
        const existing = await Admin.findOne({ email });
        if (!existing) {
            const hashedPassword = await bcrypt.hash(plainPassword, 10);
            await new Admin({ email, password: hashedPassword }).save();
            console.log("[SEED] Created admin:", email);
        }
    }

    console.log("[SEED] ✅ Seeding finished.");
}
