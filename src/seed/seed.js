import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

import "dotenv/config";

import { connectDB } from '../config/db.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Collection from '../models/Collection.js';
import { slugify } from '../utils/slugify.js';

async function seed() {
  await connectDB();

  if (process.argv.includes('--destroy')) {
    await Promise.all([User.deleteMany(), Category.deleteMany(), Collection.deleteMany()]);
    console.log('All seeded collections cleared.');
    await mongoose.disconnect();
    process.exit(0);
  }

  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@fitstitchboutique.com').toLowerCase();
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    await User.create({
      name: process.env.SEED_ADMIN_NAME || 'FitStitch Admin',
      email: adminEmail,
      password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!',
      role: 'admin',
    });
    console.log(`Admin user created: ${adminEmail}`);
  } else {
    console.log('Admin user already exists — skipping.');
  }

  const categoryNames = ['Co-Ord Sets'];
  for (const name of categoryNames) {
    const exists = await Category.findOne({ name });
    if (!exists) await Category.create({ name, slug: slugify(name) });
  }

  const collectionNames = [
    { name: 'New Arrivals', description: 'The latest pieces added to FitStitch.' },
    { name: 'Festive Edit', description: 'Statement sets for celebrations.' },
    { name: 'Everyday Luxe', description: 'Quiet luxury for daily wear.' },
  ];
  for (const c of collectionNames) {
    const exists = await Collection.findOne({ name: c.name });
    if (!exists) await Collection.create({ ...c, slug: slugify(c.name) });
  }

  console.log('Seed complete. Categories and collections are ready — add products from the admin dashboard.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
