import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request as Req,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from '@store/libs';
import { AdminGuard } from '../guards/admin.guard';

@Controller('order')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Req() req: RequestWithUser, @Body() createOrderDto: CreateOrderDto) {
    const userId = req.user?.userId;
    return this.orderService.create(userId, createOrderDto);
  }

  @Get('all')
  @UseGuards(AdminGuard)
  findAllGlobal() {
    return this.orderService.findAll(); // Assuming this returns everything
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.orderService.update(req.user.userId, id, updateOrderDto);
  }

  // 2. Administration: Generic status update
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.orderService.updateStatus(id, status);
  }

  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.orderService.remove(req.user.userId, id, req.user.isAdmin);
  }

  @Get('user/:userId')
  findAllByUser(@Req() req: RequestWithUser) {
    return this.orderService.findAllByUser(req.user.userId);
  }

  @Patch(':id/cancel')
  cancelOrder(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.orderService.cancel(req.user.userId, id);
  }
}
