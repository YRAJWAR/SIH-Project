// @ts-nocheck
// Prisma client singleton — prevents multiple instances during Next.js hot reload
// Note: PrismaClient type is only available after `prisma generate` runs

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
