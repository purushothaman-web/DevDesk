import { prisma } from '../db/client.js';
import bcrypt from 'bcrypt';

export const seedSuperAdmin = async () => {
    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;

    console.log("Seeding attempt. Email:", email ? "Found" : "Not Found", "Password:", password ? "Found" : "Not Found");

    if (!email || !password) {
        console.log("⚠️ SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not set in .env. Skipping Super Admin seeding.");
        return;
    }

    try {
        let admin = await prisma.user.findUnique({ where: { email } });
        
        if (!admin) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: 'Super Admin',
                    role: 'SUPER_ADMIN'
                }
            });
            console.log(`✅ Super Admin created from .env: ${email}`);
        } else {
            // Check if password or role needs updating
            const isMatch = await bcrypt.compare(password, admin.password);
            
            if (!isMatch || admin.role !== 'SUPER_ADMIN') {
                const hashedPassword = await bcrypt.hash(password, 10);
                await prisma.user.update({
                    where: { email },
                    data: {
                        password: hashedPassword,
                        role: 'SUPER_ADMIN'
                    }
                });
                console.log(`✅ Super Admin credentials/role updated from .env: ${email}`);
            } else {
                 console.log(`✅ Super Admin already exists and matches .env: ${email}`);
            }
        }
    } catch (error) {
        console.error("❌ Error seeding Super Admin:", error);
    }
};
