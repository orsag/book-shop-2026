import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindAllParams } from './types';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Prisma } from '../../../../generated/prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  }

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
    const andConditions: any[] = [];

    // 1. Search condition
    if (search) {
      andConditions.push({
        OR: [{ name: { contains: search, mode: 'insensitive' } }],
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

  findOne(id: string) {
    return this.prisma.client.product.findUnique({
      where: { id },
      include: {
        rating: true,
        bookDetails: true,
        gameDetails: true,
        gastroDetails: true,
        cardDetails: true,
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

    // Construct the update object matching Prisma's type requirements
    const updateData: any = {
      ...updateProduct,
    };

    if (selectedProduct.productType === 'BOOK' && updateProduct.bookDetails) {
      updateData.bookDetails = {
        update: {
          ...updateProduct.bookDetails, // Modify properties nested under the relation
        },
      };
    }

    if (selectedProduct.productType === 'GAME' && updateProduct.gameDetails) {
      updateData.gameDetails = {
        update: {
          ...updateProduct.gameDetails,
        },
      };
    }

    if (
      selectedProduct.productType === 'GASTRO' &&
      updateProduct.gastroDetails
    ) {
      updateData.gastroDetails = {
        update: {
          ...updateProduct.gastroDetails,
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
      message: 'Produkt bola úspešne odstránený.',
    };
  }
}
