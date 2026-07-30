import { faker } from '@faker-js/faker';
import { prisma, Prisma } from './prisma';
import { createAdmin, createTestUser, createUserDetail } from './creator';
import { createProduct } from './createProduct';

async function main() {
  await prisma.gastro.deleteMany();
  await prisma.aggregateRating.deleteMany();
  await prisma.book.deleteMany();
  await prisma.game.deleteMany();
  console.log(' ✅ Deleted extensions successfully');
  // Clear existing data
  await prisma.product.deleteMany();
  console.log(' ✅ Deleted products successfully');

  await prisma.userDetail.deleteMany();
  console.log(' ✅ Deleted userDetail successfully');

  await prisma.user.deleteMany();
  console.log(' ✅ Deleted users successfully');

  for (let i = 0; i < 300; i++) {
    const type = faker.helpers.arrayElement(['BOOK', 'GAME', 'GASTRO']);
    // 1. Create the Base Product
    const createInput: Prisma.ProductCreateInput = createProduct(type);
    // database create
    await prisma.product.create({ data: createInput });
  }
  console.log(' ✅ Seeded 300 products successfully');

  const freshAdmin = await createAdmin();
  await prisma.user.create({
    data: { ...freshAdmin },
  });
  console.log(' ✅ Seeded Admin successfully');

  const testUser = await createTestUser();
  await prisma.user.create({
    data: { ...testUser },
  });
  console.log(' ✅ Seeded TestUser successfully');

  await seedDetail();
  console.log(' ✅ UserDetails populated successfully');
}

async function seedDetail() {
  const allUsers = await prisma.user.findMany();

  for (const user of allUsers) {
    try {
      const existingDetail = await prisma.userDetail.findUnique({
        where: { userId: user.id },
      });

      if (!existingDetail) {
        await prisma.userDetail.create({
          data: createUserDetail(user.id),
        });
      }
    } catch (err) {
      console.error(` ⚠️ Failed to seed details for user ${user.id}:`, err);
    }
  }
}

main().finally(() => {
  console.log(' 🚀 Database seeded successfully');
  prisma.$disconnect();
});
