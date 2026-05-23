import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@mall.local' },
    update: {},
    create: {
      email: 'admin@mall.local',
      name: 'Administrator',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  await prisma.product.upsert({
    where: { sku: 'SKU-001' },
    update: {},
    create: {
      sku: 'SKU-001',
      name: 'Sample Rice 5kg',
      category: 'Grocery',
      priceRetail: 12.50,
      priceWholesale: 10.00,
      cost: 8.00,
      stock: 100,
    },
  });

  console.log('Seeded admin:', admin.email, '/ password: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
