// Initialisation
import { UpdateProductDto } from './shared-models/product.model';

export const EMPTY_BOOK: UpdateProductDto = {
  name: '',
  alternativeHeadline: '',
  description: '',
  price: 0,
  discount: 0,
  availableCount: 0,
  availability: 'InStock',
  deliveryLeadTime: 3,
  product_quality: 'new',
  productType: 'BOOK',
  bookDetails: {
    id: '',
    productId: '',
    author: '',
    isbn: '',
    publisher: '',
    pageCount: 0,
    bookFormat: '',
    category: '',
    binding: '',
    publishedDate: new Date(),
    audioBook: false,
    audioLength: 0,
    audioLanguage: 'English',
  },
};

export const EMPTY_GAME: UpdateProductDto = {
  name: '',
  alternativeHeadline: '',
  description: '',
  price: 0,
  discount: 0,
  availableCount: 0,
  availability: 'InStock',
  deliveryLeadTime: 3,
  product_quality: 'new',
  productType: 'GAME',
  gameDetails: {
    id: '',
    productId: '',
    category: '',
    brand: '',

    playersMin: 2,
    playersMax: 2,
    playTimeMinutes: 30,
    producer: '',
  },
};

export const EMPTY_GASTRO: UpdateProductDto = {
  name: '',
  alternativeHeadline: '',
  description: '',
  price: 0,
  discount: 0,
  availableCount: 0,
  availability: 'In stock',
  deliveryLeadTime: 3,
  product_quality: 'new',
  productType: 'GASTRO',
  gastroDetails: {
    id: '',
    productId: '',
    producer: '',
    category: '',
    brand: '',
    binding: '',
    edition: 1,
    weight: 1,
  },
};
