import { prisma, Prisma, ProductWhereInput } from '@prismalib';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { FindAllParams } from '../types/express';
import { DEFAULT_MAX_LIMIT, DEFAULT_PAGE, DEFAULT_TYPE } from '@store/libs';

export class ProductsService {
  async findAll({
    type = DEFAULT_TYPE,
    page = DEFAULT_PAGE,
    limit = DEFAULT_MAX_LIMIT,
    search,
    category,
    sortBy,
    isDiscounted,
  }: FindAllParams) {
    const skip = (page - 1) * limit;
    const andConditions: ProductWhereInput[] = [];

    // 1. Search condition with PostgreSQL similarity
    if (search && search.trim().length > 0) {
      const cleanedSearch = search.trim().toLowerCase();

      // Create a percentage wrap for substring matching (e.g., "frozing" -> "%froz%")
      // We take the first 4 letters of the word to catch the core root of the typo
      const rootWord =
        cleanedSearch.length > 4
          ? cleanedSearch.substring(0, 4)
          : cleanedSearch;
      const percentageSearch = `%${rootWord}%`;

      // Raw SQL query executed directly through our prisma reference
      const fuzzyMatches = await prisma.$queryRaw<{ id: string }[]>`
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

    // 2. Category filters depending on product type
    if (category) {
      if (type === 'BOOK') {
        andConditions.push({
          bookDetails: {
            category: { equals: category },
          },
        });
      } else if (type === 'GAME') {
        andConditions.push({
          gameDetails: {
            category: { equals: category },
          },
        });
      } else if (type === 'GASTRO') {
        andConditions.push({
          gastroDetails: {
            category: { equals: category },
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
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          rating: true, // Always include pre-calculated ratings
          bookDetails: type === 'BOOK',
          gameDetails: type === 'GAME',
          gastroDetails: type === 'GASTRO',
          cardDetails: type === 'GIFT_CARD'
        },
      }),
      prisma.product.count({ where }),
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

  async findOne(id: string, type = 'BOOK') {
    return prisma.product.findUnique({
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

  async getProductsByIds(ids: string[]) {
    return prisma.product.findMany({
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
      throw new Error(`This action updates a #${id} product`); // Standard runtime error
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {
      bookDetails,
      cardDetails,
      gameDetails,
      gastroDetails,
      ...restProps
    } = updateProduct;

    const updateData: Prisma.ProductUpdateInput = {
      ...restProps,
    };

    if (selectedProduct.productType === 'BOOK' && updateProduct.bookDetails) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {
        id: _,
        productId: __,
        ...bookUpdateData
      } = updateProduct.bookDetails; // Clean ES6 destructuring

      updateData.bookDetails = {
        update: {
          ...bookUpdateData,
        },
      };
    }

    if (selectedProduct.productType === 'GAME' && updateProduct.gameDetails) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {
        id: _,
        productId: __,
        ...gameUpdateData
      } = updateProduct.gameDetails;
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
      const {
        id: _,
        productId: __,
        ...gastroUpdateData
      } = updateProduct.gastroDetails;
      updateData.gastroDetails = {
        update: {
          ...gastroUpdateData,
        },
      };
    }

    return prisma.product.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    // 1. Check if the product is part of any existing orders
    const orderCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    // 2. If it is linked to orders, forbid deletion
    if (orderCount > 0) {
      return {
        success: false,
        message: `Produkt nie je možné vymazať, pretože sa nachádza v ${orderCount} objednávkach.`,
        warning: true,
      };
    }

    // 3. Otherwise, proceed with standard deletion
    // (Notice: corrected schema reference to match project requirements)
    await prisma.product.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Produkt bol úspešne odstránený.',
    };
  }

  private generateInternalSku(): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async create(createProductDto: CreateProductDto) {
    const {
      bookDetails,
      gameDetails,
      gastroDetails,
      cardDetails,
      ...productData
    } = createProductDto;

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
      const { id: _, productId: __, ...bookData } = bookDetails;
      createData.bookDetails = {
        create: bookData,
      };
    }

    if (createProductDto.productType === 'GAME' && gameDetails) {
      const { id: _, productId: __, ...gameData } = gameDetails;
      createData.gameDetails = {
        create: gameData,
      };
    }

    if (createProductDto.productType === 'GASTRO' && gastroDetails) {
      const { id: _, productId: __, ...gastroData } = gastroDetails;
      createData.gastroDetails = {
        create: gastroData,
      };
    }

    if (createProductDto.productType === 'GIFT_CARD' && cardDetails) {
      const { id: _, productId: __, ...cardData } = cardDetails;
      createData.cardDetails = {
        create: cardData,
      };
    }

    return prisma.product.create({
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
