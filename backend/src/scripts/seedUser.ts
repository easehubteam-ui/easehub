import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { hashPassword } from '../utils/password.js';

const seedUser = async () => {
  const userEmail = process.env.SEED_USER_EMAIL || 'user@easehub.local';
  const userPassword = process.env.SEED_USER_PASSWORD || 'EaseHub@2026!User';

  console.log('Connecting to database for customer seeding...');
  await mongoose.connect(env.MONGO_URI);

  const existingUser = await User.findOne({ email: userEmail.toLowerCase() });
  if (existingUser) {
    console.log(`[SEED USER] Customer account already exists: ${userEmail}`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await hashPassword(userPassword);

  const customer = await User.create({
    name: 'Aarav Sharma',
    email: userEmail.toLowerCase(),
    phone: '9876543210',
    passwordHash,
    role: 'customer',
    city: 'Bhilai',
    isActive: true,
    isEmailVerified: true,
  });

  console.log('[SEED USER] CUSTOMER seeded successfully!');
  console.log(`Email: ${customer.email}`);
  console.log(`Role: ${customer.role}`);

  await mongoose.disconnect();
};

seedUser().catch((err) => {
  console.error('[SEED USER ERROR]', err);
  process.exit(1);
});
