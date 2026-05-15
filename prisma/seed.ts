import { faker } from '@faker-js/faker';
import { prisma } from './prisma';
import { Prisma } from '../generated/prisma/client';
import {
  categories,
  gatroCategory,
  computerGames,
  gastroBrands,
  computerGameCategory,
  computerGameBrands,
  productTypeHelper,
  DISCOUNT,
  DEFAULT_AVATAR,
  RATING_MAX,
  RATING_MIN,
  RATING,
} from './seed.helper';

const getName = (type: productTypeHelper) => {
  const map: Record<productTypeHelper, string> = {
    BOOK: faker.commerce.productName(),
    GAME: faker.helpers.arrayElement(computerGames),
    GASTRO: faker.food.dish(),
  };
  return map[type] ?? faker.commerce.productName();
};

async function main() {
  await prisma.gastro.deleteMany();
  await prisma.aggregateRating.deleteMany();
  await prisma.book.deleteMany();
  await prisma.game.deleteMany();
  console.log(' ✅ Deleted extensions...');
  // Clear existing data
  await prisma.product.deleteMany();
  console.log(' ✅ Deleted products...');

  for (let i = 0; i < 300; i++) {
    const type = faker.helpers.arrayElement(['BOOK', 'GAME', 'GASTRO']);
    const audioBook = Math.random() > 0.8;
    const availableCount = faker.number.int({ min: 0, max: 50 });
    const isAvailable = availableCount > 0;
    const condition = Math.random() < 0.9 ? 'new' : 'used';
    const discount = faker.helpers.arrayElement(DISCOUNT);
    const price = parseFloat(
      faker.commerce.price({ min: 9, max: 300, dec: 2 }),
    );

    // 1. Create the Base Product
    const createInput: Prisma.ProductCreateInput = {
      sku: faker.string.alphanumeric(8).toUpperCase(),
      name: getName(type),
      alternativeHeadline: faker.company.catchPhrase(),
      description: faker.commerce.productDescription(),
      discount: discount,
      price: price,
      productType: type,
      availability: isAvailable ? 'InStock' : 'OutStock',
      isAvailable: isAvailable,
      availableCount: availableCount,
      product_quality: condition,
      deliveryLeadTime: faker.number.int({ min: 1, max: 7 }),
      coverUrl: `https://picsum.photos/seed/${faker.string.uuid()}/400/600`,
      // 2. Create the Rating as a child
      rating: {
        create: {
          ratingValue: faker.number.float(RATING),
          ratingCount: faker.number.int({ min: 0, max: 1000 }),
          bestRating: RATING_MAX,
          worstRating: RATING_MIN,
        },
      },
    };

    if (type === 'BOOK') {
      createInput.bookDetails = {
        create: {
          author: faker.book.title(),
          isbn: faker.commerce.isbn(),
          publisher: faker.book.publisher(),
          pageCount: faker.number.int({ min: 100, max: 1000 }),
          bookFormat: faker.book.format(),
          category: faker.helpers.arrayElement(categories),
          binding: faker.helpers.arrayElement([
            'hardcover',
            'paperback',
            'flexibound',
          ]),
          publishedDate: faker.date.past(),
          audioBook: audioBook,
          audioLength: faker.number.int({ min: 100, max: 400 }),
          audioLanguage: faker.helpers.arrayElement([
            'Slovak',
            'English',
            'German',
          ]),
        },
      };
    } else if (type === 'GAME') {
      createInput.gameDetails = {
        create: {
          category: faker.helpers.arrayElement(computerGameCategory),
          brand: faker.helpers.arrayElement(computerGameBrands),
          playersMin: 2,
          playersMax: faker.number.int({ min: 3, max: 6 }),
          playTimeMinutes: faker.number.int({ min: 30, max: 150 }),
          producer: faker.company.name(),
        },
      };
    } else if (type === 'GASTRO') {
      createInput.gastroDetails = {
        create: {
          producer: faker.company.name(),
          category: faker.helpers.arrayElement(gatroCategory),
          brand: faker.helpers.arrayElement(gastroBrands),
          binding: 'box',
          edition: faker.number.int({ min: 1, max: 3 }),
          weight: faker.number.int({ min: 100, max: 1000 }),
        },
      };
    }

    await prisma.product.create({ data: createInput });
  }
  console.log(' ✅ Seeded 300 products...');

  const DEFAULT_EMAIL = 'martin.orsag108@gmail.com';
  await prisma.user.upsert({
    where: { email: DEFAULT_EMAIL }, // Unique identifier
    update: {
      avatarUrl: DEFAULT_AVATAR,
      phoneNumber: '+421900000000',
    }, // If found, do nothing
    create: {
      username: 'bossman',
      email: DEFAULT_EMAIL,
      isAdmin: true,
      phoneNumber: '+421900000000',
      avatarUrl: DEFAULT_AVATAR,
      theme: 'light',
      favorites: [],
      cartItems: [],
    },
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

  // 1. Fetch all existing users
  const allUsers = await prisma.user.findMany();

  for (const user of allUsers) {
    await prisma.userDetail.upsert({
      where: { userId: user.id },
      update: {}, // Don't change anything if it already exists
      create: {
        userId: user.id,
        // Using faker for that "Real App" feel
        isPremium: true,
        membershipStart: faker.date.past({ years: 1 }),
        membershipEnd: faker.date.future({ years: 1 }),
        displayName: faker.person.fullName(),
        addressLine1: faker.location.streetAddress(),
        city: faker.location.city(),
        countryCode: 'SK', // Keeping it local to Zvolenská Slatina!
        avatarUrl: faker.image.avatar(),
        bio: faker.person.bio(),
        // If you added these to your model:
        iban: faker.finance.iban(),
        dateOfBirth: faker.date.birthdate(),
        lastActiveAt: faker.date.past({ years: 1 }),
        updatedAt: new Date(),
      },
    });
  }

  console.log(` ✅ Success! Linked Details to ${allUsers.length} users.`);
}

main().finally(() => prisma.$disconnect());
