import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProductPayloadDto,
} from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindAllParams } from './types';
import { Prisma } from '@prismalib';
import { ProductWhereInput } from '@prismalib';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll({
    type = 'BOOK',
    page = 1,
    limit = 10,
    search,
    category,
    sortBy,
    isDiscounted,
  }: FindAllParams) {
    const skip = (page - 1) * limit;
    const andConditions: ProductWhereInput | ProductWhereInput[] = [];

    // 1. Search condition
    if (search) {
      const cleanedSearch = search.trim().toLowerCase();

      // Create a percentage wrap for substring matching (e.g., "frozing" -> "%froz%")
      // We take the first 4 letters of the word to catch the core root of the typo
      const rootWord =
        cleanedSearch.length > 4
          ? cleanedSearch.substring(0, 4)
          : cleanedSearch;
      const percentageSearch = `%${rootWord}%`;

      const fuzzyMatches = await this.prisma.client.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Product" 
        WHERE 
          -- 1. Catch substring variations (e.g., "froz" matches "Frozen")
          name ILIKE ${percentageSearch}
          OR
      -- 2. Catch overall typo closeness (Highly forgiving threshold)
      similarity(name, ${cleanedSearch}) > 0.18
      `;

      const matchedIds = fuzzyMatches.map((m) => m.id);

      andConditions.push({
        id: { in: matchedIds },
      });
    }

    if (isDiscounted) {
      andConditions.push({
        OR: [
          {
            discount: {
              gt: 0,
            },
          },
        ],
      });
    }

    // 2. Category filters
    if (category) {
      if (type === 'BOOK') {
        andConditions.push({
          bookDetails: {
            category: { equals: category },
            author: { contains: search, mode: 'insensitive' },
          },
        });
      } else if (type === 'GAME') {
        andConditions.push({
          gameDetails: {
            category: { equals: category },
            brand: { contains: search, mode: 'insensitive' },
          },
        });
      } else if (type === 'GASTRO') {
        andConditions.push({
          gastroDetails: {
            category: { equals: category },
            producer: { contains: search, mode: 'insensitive' },
          },
        });
      }
    }

    const where: Prisma.ProductWhereInput = {
      productType: type,
      AND: andConditions,
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput[] = [];

    switch (sortBy) {
      case 'price_asc':
        orderBy.push({ price: 'asc' });
        break;
      case 'price_desc':
        orderBy.push({ price: 'desc' });
        break;
    }
    orderBy.push({ id: 'asc' });

    // 3. Execute Parallel Queries
    const [data, total] = await Promise.all([
      this.prisma.client.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          rating: true, // Always include the pre-calculated ratings
          bookDetails: type === 'BOOK', // Include if it's a book
          gameDetails: type === 'GAME', // Include if it's a game
          gastroDetails: type === 'GASTRO',
          cardDetails: type === 'GIFT_CARD',
        },
      }),
      this.prisma.client.product.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    };
  }

  findOne(id: string, type = 'BOOK') {
    return this.prisma.client.product.findUnique({
      where: { id },
      include: {
        rating: true,
        bookDetails: type === 'BOOK',
        gameDetails: type === 'GAME',
        gastroDetails: type === 'GASTRO',
        cardDetails: type === 'GIFT_CARD',
      },
    });
  }

  getProductsByIds(ids: string[]) {
    return this.prisma.client.product.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async update(id: string, updateProduct: UpdateProductDto) {
    const selectedProduct = await this.findOne(id);

    if (!selectedProduct) {
      return `This action updates a #${id} product`;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {
      bookDetails,
      cardDetails,
      gameDetails,
      gastroDetails,
      ...restProps
    } = updateProduct;

    // Construct the update object matching Prisma's type requirements
    const updateData: Prisma.ProductUpdateInput = {
      ...restProps,
    };

    if (selectedProduct.productType === 'BOOK' && updateProduct.bookDetails) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const bookUpdateData = (({ id, productId, ...rest }) => rest)(
        updateProduct.bookDetails,
      );

      updateData.bookDetails = {
        update: {
          ...bookUpdateData, // Modify properties nested under the relation
        },
      };
    }

    if (selectedProduct.productType === 'GAME' && updateProduct.gameDetails) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const gameUpdateData = (({ id, productId, ...rest }) => rest)(
        updateProduct.gameDetails,
      );
      updateData.gameDetails = {
        update: {
          ...gameUpdateData,
        },
      };
    }

    if (
      selectedProduct.productType === 'GASTRO' &&
      updateProduct.gastroDetails
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const gastroUpdateData = (({ id, productId, ...rest }) => rest)(
        updateProduct.gastroDetails,
      );
      updateData.gastroDetails = {
        update: {
          ...gastroUpdateData,
        },
      };
    }

    return this.prisma.client.product.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    // 1. Check if the book is part of any existing orders
    const orderCount = await this.prisma.client.orderItem.count({
      where: { productId: id },
    });

    // 2. If it is linked to orders, forbid deletion and return a warning
    if (orderCount > 0) {
      return {
        success: false,
        message: `Produkt nie je možné vymazať, pretože sa nachádza v ${orderCount} objednávkach.`,
        warning: true,
      };
    }

    // 3. Otherwise, proceed with standard deletion
    await this.prisma.client.book.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Produkt bol úspešne odstránený.',
    };
  }

  // 1. Helper function to generate an internal alphanumeric SKU matching your format
  private generateInternalSku(): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  create(createProductDto: CreateProductPayloadDto) {
    // 1. Separate nested relations from the core product properties
    const {
      rating,
      bookDetails,
      gameDetails,
      gastroDetails,
      cardDetails,
      ...productData
    } = createProductDto;

    // 2. Build the Prisma configuration for nested creation
    const createData: any = {
      ...productData,
      sku: this.generateInternalSku(),
      rating: {
        create: {
          ratingValue: 0,
          ratingCount: 0,
          bestRating: 5,
          worstRating: 1,
        },
      },
    };

    if (createProductDto.productType === 'BOOK' && bookDetails) {
      const { id, productId, ...bookData } = bookDetails;
      createData.bookDetails = {
        create: bookData,
      };
    }

    if (createProductDto.productType === 'GAME' && gameDetails) {
      const { id, productId, ...gameData } = gameDetails;
      createData.gameDetails = {
        create: gameData,
      };
    }

    if (createProductDto.productType === 'GASTRO' && gastroDetails) {
      const { id, productId, ...gastroData } = gastroDetails;
      createData.gastroDetails = {
        create: gastroData,
      };
    }

    if (createProductDto.productType === 'GIFT_CARD' && cardDetails) {
      const { id, productId, ...cardData } = cardDetails;
      createData.cardDetails = {
        create: cardData,
      };
    }

    // 4. Save to database and return the newly created product with its relation included
    return this.prisma.client.product.create({
      data: createData,
      include: {
        rating: true,
        bookDetails: createProductDto.productType === 'BOOK',
        gameDetails: createProductDto.productType === 'GAME',
        gastroDetails: createProductDto.productType === 'GASTRO',
        cardDetails: createProductDto.productType === 'GIFT_CARD',
      },
    });
  }
}
