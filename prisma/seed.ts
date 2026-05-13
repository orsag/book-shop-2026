import { faker } from '@faker-js/faker';
import { prisma } from './prisma';
import { Prisma } from '../generated/prisma/client';

const computerGames = [
  "Baldur's Gate 3",
  'Elden Ring Nightreign',
  'Slay the Spire 2',
  'Borderlands 4',
  'Resident Evil Requiem',
  'Cyberpunk 2077',
  'Half-Life: Alyx',
  'The Witcher 3: Wild Hunt',
  'Doom Eternal',
  'Hollow Knight',
  'Minecraft',
  'Red Dead Redemption 2',
  'The Elder Scrolls V: Skyrim',
  'Portal 2',
  'Grand Theft Auto V',
  'Hades',
  'Disco Elysium',
  'Dark Souls III',
  'StarCraft II',
  'Mass Effect 2',
  'Civilization VI',
  'Terraria',
  'Stardew Valley',
  'Hogwarts Legacy',
  'Forza Horizon 5',
  'God of War',
  'Helldivers 2',
  'Apex Legends',
  'Counter-Strike 2',
  'World of Warcraft',
];

const categories: string[] = [
  'Fiction',
  'Non-fiction',
  'Fantasy',
  'Sci-Fi',
  'Romance',
  'History',
  'Biography',
  'Self-help',
  'Mystery',
];

const computerGameBrands: string[] = [
  'GSC',
  'GTA',
  'Bethesda',
  'Pearl Abyss',
  'Electronic Arts (EA)',
  'Ubisoft',
  'Valve',
  'Nintendo',
  'Sony IE',
  'Xbox Game Studios',
  'Blizzard',
];

const DEFAULT_AVATAR = 'https://avatars.githubusercontent.com/u/971652350';

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

    const discount = faker.helpers.arrayElement([
      0, 0, 0, 0, 0, 0.05, 0.1, 0.2,
    ]);

    const price = parseFloat(
      faker.commerce.price({ min: 9, max: 300, dec: 2 }),
    );

    // 1. Create the Base Product
    const createInput: Prisma.ProductCreateInput = {
      sku: faker.string.alphanumeric(8).toUpperCase(),
      name:
        type === 'BOOK'
          ? faker.commerce.productName()
          : type === 'GAME'
            ? faker.helpers.arrayElement(computerGames)
            : faker.food.dish(),
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
          ratingValue: faker.number.float({
            min: 1,
            max: 5,
            fractionDigits: 1,
          }),
          ratingCount: faker.number.int({ min: 0, max: 1000 }),
          bestRating: 5,
          worstRating: 1,
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
            'French',
          ]),
        },
      };
    } else if (type === 'GAME') {
      createInput.gameDetails = {
        create: {
          category: faker.helpers.arrayElement([
            'Strategic',
            'Shooter',
            'RPG',
            'Puzzle',
            'Survival',
            'Simulation',
            'Platformer',
            'Action-Adventure',
          ]),
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
          category: faker.helpers.arrayElement([
            'Chocolate',
            'Candy',
            'Puddings',
            'Pastries',
            'Coffee',
          ]),
          brand: faker.helpers.arrayElement([
            'Ferrero',
            'Lindt',
            'Nestle',
            'Mars',
            'Trolli',
            'Haribo',
            'Twizzlers',
            'Reese',
            'Milka',
            "Allen's",
            'Skittles',
          ]),
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
