import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from monorepo root
config({ path: resolve(__dirname, '../../.env') });

import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecommerce.com' },
    update: {},
    create: {
      email: 'admin@ecommerce.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: UserRole.SUPER_ADMIN,
      emailVerified: true,
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // Create test customer
  const customerPassword = await bcrypt.hash('Customer@123', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      name: 'Test Customer',
      phone: '9876543210',
      passwordHash: customerPassword,
      role: UserRole.CUSTOMER,
      emailVerified: true,
    },
  });
  console.log(`✅ Customer user created: ${customer.email}`);

  // Create sample categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets',
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'fashion' },
      update: {},
      create: {
        name: 'Fashion',
        slug: 'fashion',
        description: 'Clothing and accessories',
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'home-kitchen' },
      update: {},
      create: {
        name: 'Home & Kitchen',
        slug: 'home-kitchen',
        description: 'Home appliances and kitchen items',
        isActive: true,
        sortOrder: 3,
      },
    }),
  ]);
  console.log(`✅ ${categories.length} categories created`);

  // Create sub-categories for Electronics
  const electronicsId = categories[0].id;
  const subCategories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'mobiles' },
      update: {},
      create: {
        name: 'Mobiles',
        slug: 'mobiles',
        description: 'Smartphones and feature phones',
        parentId: electronicsId,
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'laptops' },
      update: {},
      create: {
        name: 'Laptops',
        slug: 'laptops',
        description: 'Laptops and notebooks',
        parentId: electronicsId,
        isActive: true,
        sortOrder: 2,
      },
    }),
  ]);
  console.log(`✅ ${subCategories.length} sub-categories created`);

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
