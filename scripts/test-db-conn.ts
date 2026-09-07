import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const userCount = await prisma.user.count();
    console.log('Connected to DB! User count:', userCount);
  } catch (err: any) {
    console.error('DB Connection error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
