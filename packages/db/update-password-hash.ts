import crypto from 'crypto';

// This replicates Better Auth's password hashing algorithm
const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  return `${salt}:${hash.toString('hex')}`;
};

const password = "admin123";
const hashedPassword = await hashPassword(password);

console.log("Better Auth compatible password hash:");
console.log(hashedPassword);

// Now we need to update the database with this hash
import prisma from './src'

await prisma.account.updateMany({
  where: { accountId: 'admin@example.com' },
  data: { password: hashedPassword }
});

console.log("Updated admin account password hash in database");
await prisma.$disconnect();
