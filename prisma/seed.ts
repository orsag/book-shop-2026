import { faker } from '@faker-js/faker';
import { prisma, Prisma } from './prisma';
import { DEFAULT_EMAIL } from './creator.constants';
import { createAdmin } from './creator';
import { createProduct } from './createProduct';

async function main() {
  // await prisma.gastro.deleteMany();
  // await prisma.aggregateRating.deleteMany();
  // await prisma.book.deleteMany();
  // await prisma.game.deleteMany();
  // console.log(' ✅ Deleted extensions...');
  // // Clear existing data
  // await prisma.product.deleteMany();
  // console.log(' ✅ Deleted products...');
  //
  // await prisma.userDetail.deleteMany();
  // console.log(' ✅ Deleted userDetail...');
  //
  // await prisma.user.deleteMany({
  //   where: {
  //     OR: [
  //       { username: 'bossman' },
  //       { username: 'bossmann' },
  //       { email: DEFAULT_EMAIL },
  //     ],
  //   },
  // });
  // console.log(' ✅ Deleted users...');

  for (let i = 0; i < 300; i++) {
    const type = faker.helpers.arrayElement(['BOOK', 'GAME', 'GASTRO']);
    // 1. Create the Base Product
    const createInput: Prisma.ProductCreateInput = createProduct(type);
    // database create
    await prisma.product.create({ data: createInput });
  }
  console.log(' ✅ Seeded 300 products...');

  const freshAdmin = await createAdmin();
  await prisma.user.create({
    data: { ...freshAdmin },
  });
  console.log(' 👤 Seeded Admin...');

  // 3. Handle Random Users
  // const userCount = await prisma.user.count();
  // if (userCount <= 1) {
  //   // Only the admin exists
  //   console.log('👥 Generating 2 random users...');
  //   const users = Array.from({ length: 2 }).map(() => ({
  //     username: faker.internet.username().toLowerCase(),
  //     email: faker.internet.email().toLowerCase(),
  //     isAdmin: false,
  //     phoneNumber: faker.phone.number(),
  //     avatarUrl: faker.image.avatar(),
  //     theme: 'light',
  //     favorites: [], // Empty as requested
  //     cartItems: [], // Empty as requested
  //     lastLogin: faker.date.recent(),
  //   }));
  //
  //   await prisma.user.createMany({ data: users });
  //   console.log(' ✅ Seeded 2 users.');
  // }
  await seedDetail();
}

async function seedDetail() {
  console.log(' 🚀 Starting to populate UserDetails...');

  const allUsers = await prisma.user.findMany();

  for (const user of allUsers) {
    try {
      const existingDetail = await prisma.userDetail.findUnique({
        where: { userId: user.id },
      });

      if (!existingDetail) {
        await prisma.userDetail.create({
          data: {
            userId: user.id,
            isPremium: true,
            membershipStart: faker.date.past({ years: 1 }),
            membershipEnd: faker.date.future({ years: 1 }),
            displayName: faker.person.fullName(),
            addressLine1: faker.location.streetAddress(),
            city: faker.location.city(),
            countryCode: 'SK',
            avatarUrl: faker.image.avatar(),
            bio: faker.person.bio(),
            iban: faker.finance.iban(),
            dateOfBirth: faker.date.birthdate(),
            lastActiveAt: faker.date.past({ years: 1 }),
          },
        });
      }
    } catch (err) {
      console.error(` ⚠️ Failed to seed details for user ${user.id}:`, err);
    }
  }
}

main().finally(() => prisma.$disconnect());
