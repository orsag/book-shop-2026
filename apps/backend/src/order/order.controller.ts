import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtAuthGuard) // Ensure the user is logged in
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    // Use the ID from the JWT payload instead of the hardcoded one
    return this.orderService.create(req.user.userId, createOrderDto);
  }

  @Get('all')
  findAllGlobal() {
    return this.orderService.findAll(); // Assuming this returns everything
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Request() req,
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

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.orderService.remove(req.user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  findAllByUser(@Request() req) {
    return this.orderService.findAllByUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancelOrder(@Request() req, @Param('id') id: string) {
    return this.orderService.cancel(req.user.userId, id);
  }
}
