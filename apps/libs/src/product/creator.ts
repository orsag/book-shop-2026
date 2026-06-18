import { faker } from '@faker-js/faker';
import {
  categories,
  computerGameBrands,
  computerGameCategory,
  productTypeHelper,
  DISCOUNT,
  gastroBrands,
  gatroCategory,
  computerGames,
  RATING,
  RATING_MAX,
  RATING_MIN,
  DEFAULT_EMAIL,
  DEFAULT_AVATAR,
  ProductCreateInput,
} from './creator.constants';

export function createAdmin() {
  return {
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
      favorites: [] as string[],
      cartItems: [] as any[],
    },
  };
}

export function getName (type: productTypeHelper) {
  const map: Record<productTypeHelper, string> = {
    BOOK: faker.commerce.productName(),
    GAME: faker.helpers.arrayElement(computerGames),
    GASTRO: faker.food.dish(),
    GIFT_CARD: faker.commerce.productName(),
    PUZZLE: faker.commerce.productName(),
    CARDS: faker.commerce.productName(),
    TOYS: faker.commerce.productName(),
  };
  return map[type] ?? faker.commerce.productName();
};

export function createProduct(type: productTypeHelper) {
  const audioBook = Math.random() > 0.8;
  const availableCount = faker.number.int({ min: 0, max: 50 });
  const isAvailable = availableCount > 0;
  const condition = Math.random() < 0.9 ? 'new' : 'used';
  const discount = faker.helpers.arrayElement(DISCOUNT);
  const price = parseFloat(faker.commerce.price({ min: 9, max: 300, dec: 2 }));

  const createInput: ProductCreateInput = {
    sku: faker.string.alphanumeric(8).toUpperCase(),
    name: getName(type),
    alternativeHeadline: faker.company.catchPhrase(),
    description: faker.commerce.productDescription(),
    discount: discount,
    price: price,
    productType: type,
    isAvailable: isAvailable,
    availableCount: availableCount,
    product_quality: condition,
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

  return createInput;
}