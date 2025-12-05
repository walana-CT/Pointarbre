import prisma from './src'

const account = await prisma.account.findFirst({
  where: { accountId: 'admin@example.com' }
});

console.log("Account:", JSON.stringify(account, null, 2));
if (account?.password) {
  console.log("Password hash length:", account.password.length);
  console.log("Password hash starts with:", account.password.substring(0, 20));
}
await prisma.$disconnect();
