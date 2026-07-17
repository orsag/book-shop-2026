import { prisma } from '@prismalib';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { OrderStatus } from '@store/libs';

type OrderItemDto = {
  productId: string;
  quantity: number;
  price: number;
};

export class OrderService {
  async create(userId: string, createOrderDto: CreateOrderDto) {
    if (!userId) {
      throw new Error(`Missing userId and will stop create method.`);
    }

    // 🛡️ We use a transaction to ensure either everything succeeds or nothing does
    return prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const VAT_RATE = 0.05;
      const orderItemsData: OrderItemDto[] = [];

      for (const item of createOrderDto.items) {
        // 1. Fetch current price directly from DB (never trust frontend prices!)
        const book = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (!book) {
          throw new Error(`Product ${item.productId} not found`); // Will return 404 in route
        }

        // 🛡️ STOCK CHECK: Prevent ordering more than available
        if (book.availableCount < item.quantity) {
          throw new Error(
            `Insufficient stock for "${book.name}". Available: ${book.availableCount}`,
          );
        }

        const priceWithVat = book.price * (1 - book.discount) * (1 + VAT_RATE);
        const itemTotal = priceWithVat * item.quantity;

        totalAmount += itemTotal;

        // 2. Prepare the item data
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: priceWithVat, // Locking the price at the time of purchase
        });

        // 3. DECREASE STOCK: Use atomic decrement to avoid race conditions
        await tx.product.update({
          where: { id: item.productId },
          data: {
            availableCount: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 4. Create the order and its items in one relational query
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
            include: { product: true }, // Return book details
          },
        },
      });
    });
  }

  async findAll() {
    return prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
  }

  async update(userId: string, id: string, updateOrderDto: UpdateOrderDto) {
    console.log(JSON.stringify(updateOrderDto));
    return `This action updates a #${id} order`;
  }

  async remove(userId: string, id: string, isAdmin: boolean) {
    return prisma.$transaction(async (tx) => {
      // 1. Delete all items associated with this order first
      await tx.orderItem.deleteMany({
        where: { orderId: id },
      });

      // 2. Delete the order itself
      return tx.order.delete({
        where: {
          id,
          ...(isAdmin ? {} : { userId }), // Admins can bypass personal ownership
        },
      });
    });
  }

  async findAllByUser(userId: string) {
    if (!userId) {
      throw new Error(`Missing userId and will stop find method.`);
    }
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancel(userId: string, id: string) {
    if (!userId) {
      throw new Error(`Missing userId and will stop cancel method.`);
    }
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Backend validation for the 14-day cancellation window
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    if (order.createdAt < fourteenDaysAgo) {
      throw new Error('Orders older than 14 days cannot be cancelled');
    }

    // Perform the cancellation
    return prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async updateStatus(id: string, status: string) {
    return prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus },
    });
  }
}
