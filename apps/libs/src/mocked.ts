import { CreateProductDto } from '@api';

const BOOK_GRADIENT =
  'bg-gradient-to-br from-red-100 via-pink-100 to-purple-100 text-purple-900';

const MOCKED_PRODUCT: CreateProductDto = {
  id: '01b9d23b-0a21-409f-a28a-85f07f2d5b75',
  sku: '27Z6SGMY',
  name: 'Elegant Bamboo Chicken',
  alternativeHeadline: 'Sharable static throughput',
  description:
    "Cruickshank Group's most advanced Car technology increases sunny capabilities",
  price: 197.75,
  discount: 0.1,
  availableCount: 20,
  isAvailable: true,
  product_quality: 'new',
  coverUrl:
    'https://picsum.photos/seed/14eb3c2f-f822-4d73-ac06-186197dee6a0/400/600',
  productType: 'BOOK',
  createdAt: '2026-05-16T10:00:00.992Z',
  updatedAt: '2026-06-26T07:47:14.213Z',
  bookDetails: {
    id: 'cd4fe403-fe47-4fd9-8ffc-439f3d0095bb',
    productId: '01b9d23b-0a21-409f-a28a-85f07f2d5b75',
    author: 'The Prophet',
    isbn: '978-0-11-486512-2',
    publisher: 'University of Michigan Press',
    pageCount: 509,
    bookFormat: 'Audiobook',
    category: 'Fantasy',
    binding: 'flexibound',
    publishedDate: new Date('2026-01-30T19:22:36.209Z').toDateString(),
    audioBook: false,
    audioLength: 227,
    audioLanguage: 'Slovak',
  },
};

export { BOOK_GRADIENT, MOCKED_PRODUCT };
