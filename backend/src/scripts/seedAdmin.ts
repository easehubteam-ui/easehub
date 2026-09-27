import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { hashPassword } from '../utils/password.js';

const seedAdmin = async () => {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@easehub.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'EaseHub@2026!Admin';

  console.log('Connecting to database for admin seeding...');
  await mongoose.connect(env.MONGO_URI);

  const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
  if (existingAdmin) {
    console.log(`[SEED ADMIN] Superadmin account already exists: ${adminEmail}`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await hashPassword(adminPassword);

  const admin = await User.create({
    name: 'EaseHub Admin',
    email: adminEmail.toLowerCase(),
    passwordHash,
    role: 'superadmin',
    isActive: true,
    isEmailVerified: true,
  });

  console.log('[SEED ADMIN] SUPERADMIN seeded successfully!');
  console.log(`Email: ${admin.email}`);
  console.log(`Role: ${admin.role}`);

  await mongoose.disconnect();
};

seedAdmin().catch((err) => {
  console.error('[SEED ADMIN ERROR]', err);
  process.exit(1);
});
