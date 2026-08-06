import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ProductsControllerFindAllParams,
  CreateProductDtoProductType,
} from '@api';
import { Prisma } from '@prismalib';
import { ProductWhereInput } from '@prismalib';
import { DEFAULT_MAX_LIMIT, DEFAULT_PAGE, DEFAULT_TYPE } from '@store/libs';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private calculateEffectivePrice(product: {
    price: number;
    discount?: number | null;
  }): number {
    const discountMultiplier = 1 - (product.discount || 0);
    return product.price * discountMultiplier;
  }

  async findAll({
    type = DEFAULT_TYPE,
    page = DEFAULT_PAGE,
    limit = DEFAULT_MAX_LIMIT,
    search,
    category,
    sortBy,
    isDiscounted,
  }: ProductsControllerFindAllParams) {
    const skip = (page - 1) * limit;
    const andConditions: ProductWhereInput | ProductWhereInput[] = [];

    // 1. Search condition
    if (search && search.trim().length > 0) {
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
        WHERE name ILIKE ${percentageSearch}
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
      productType: type as CreateProductDtoProductType,
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
    const [rawProducts, total] = await Promise.all([
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

    const dataSorted = [...rawProducts];
    if (sortBy === 'price_asc') {
      dataSorted.sort(
        (a, b) =>
          this.calculateEffectivePrice(a) - this.calculateEffectivePrice(b),
      );
    } else if (sortBy === 'price_desc') {
      dataSorted.sort(
        (a, b) =>
          this.calculateEffectivePrice(b) - this.calculateEffectivePrice(a),
      );
    }

    return {
      data: dataSorted,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, type = 'BOOK') {
    const product = await this.prisma.client.product.findUnique({
      where: { id },
      include: {
        rating: true,
        bookDetails: type === 'BOOK',
        gameDetails: type === 'GAME',
        gastroDetails: type === 'GASTRO',
        cardDetails: type === 'GIFT_CARD',
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
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
    const orderCount = await this.prisma.client.orderItem.count({
      where: { productId: id },
    });

    if (orderCount > 0) {
      return {
        success: false,
        message: `Produkt nie je možné vymazať, pretože sa nachádza v ${orderCount} objednávkach.`,
        warning: true,
      };
    }

    const product = await this.prisma.client.product.findUnique({
      where: { id },
      select: { productType: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const detailWhere = { productId: id };

    switch (product.productType) {
      case 'BOOK':
        await this.prisma.client.book.delete({ where: detailWhere });
        break;
      case 'GAME':
        await this.prisma.client.game.delete({ where: detailWhere });
        break;
      case 'GASTRO':
        await this.prisma.client.gastro.delete({ where: detailWhere });
        break;
      case 'GIFT_CARD':
        await this.prisma.client.giftCard.delete({ where: detailWhere });
        break;
    }

    await this.prisma.client.aggregateRating.delete({ where: detailWhere });
    await this.prisma.client.product.delete({ where: { id } });

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

  create(createProductDto: CreateProductDto) {
    // 1. Separate nested relations from the core product properties
    const {
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
