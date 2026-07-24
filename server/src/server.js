import 'dotenv/config';
import bcrypt from 'bcrypt';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { User } from './models/index.js';

const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD', 'FINANCE_PIN'];

function assertEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error(`[server] Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

async function ensureAdminAccount() {
  const existing = await User.findOne({ email: process.env.ADMIN_EMAIL.toLowerCase() });
  if (existing) return;

  await User.create({
    email: process.env.ADMIN_EMAIL,
    password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
    financePin: await bcrypt.hash(process.env.FINANCE_PIN, 12),
  });
  console.log(`[server] Admin account created for ${process.env.ADMIN_EMAIL}`);
}

async function start() {
  assertEnv();
  await connectDB();
  await ensureAdminAccount();

  const app = createApp();
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`[server] API ready on port ${port}`));
}

start().catch((err) => {
  console.error('[server] Fatal startup error:', err);
  process.exit(1);
});
