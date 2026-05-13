import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@store/libs';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createOrderDto: CreateOrderDto) {
    if (!userId) {
      return `Missing userId #${userId} and will stop create method.`;
    }
    // 🛡️ We use a transaction to ensure either everything succeeds or nothing does
    return this.prisma.client.$transaction(async (tx) => {
      let totalAmount = 0;
      const VAT_RATE = 0.05;
      const orderItemsData: any = [];

      for (const item of createOrderDto.items) {
        // 1. Fetch current price directly from DB (never trust frontend prices!)
        const book = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (!book)
          throw new NotFoundException(`Product ${item.productId} not found`);

        // 🛡️ STOCK CHECK: Prevent ordering more than available
        if (book.availableCount < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${book.name}". Available: ${book.availableCount}`,
          );
        }

        const priceWithVat = book.price * (1 + VAT_RATE);
        const itemTotal = priceWithVat * item.quantity;

        totalAmount += itemTotal;

        // 2. Prepare the item data
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: priceWithVat, // Locking the price at the time of purchase
        });

        // 2. DECREASE STOCK: Use atomic decrement to avoid race conditions
        await tx.product.update({
          where: { id: item.productId },
          data: {
            availableCount: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 3. Create the order and its items in one relational query
      return tx.order.create({
        data: {
          user: { connect: { id: userId } },
          totalAmount,
          status: 'PENDING',
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: { product: true }, // Return book details for the "Thank You" page
          },
        },
      });
    });
  }

  findAll() {
    return this.prisma.client.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.client.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
  }

  update(userId: string, id: string, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  async remove(userId: string, id: string, isAdmin: boolean) {
    return await this.prisma.client.$transaction(async (tx) => {
      // 1. Delete all items associated with this order first
      await tx.orderItem.deleteMany({
        where: { orderId: id },
      });

      // 2. Delete the order itself
      return tx.order.delete({
        where: {
          id,
          ...(isAdmin ? {} : { userId }),
        },
      });
    });
  }

  // Fetch all orders for a specific user with items and book details
  findAllByUser(userId: string) {
    if (!userId) {
      return `Missing userId #${userId} and will stop create method.`;
    }
    return this.prisma.client.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Cancel an order if within 14 days
  async cancel(userId: string, id: string) {
    if (!userId) {
      return `Missing userId #${userId} and will stop create method.`;
    }
    const order = await this.prisma.client.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Backend validation for the 14-day cancellation window
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    if (order.createdAt < fourteenDaysAgo) {
      throw new BadRequestException(
        'Orders older than 14 days cannot be cancelled',
      );
    }

    // Perform the cancellation
    return this.prisma.client.order.update({
      where: { id },
      data: { status: 'CANCELLED' }, // Assuming your Enum or string is 'CANCELLED'
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.client.order.update({
      where: { id },
      data: { status: status as OrderStatus },
    });
  }
}
