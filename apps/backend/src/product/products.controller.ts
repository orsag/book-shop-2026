import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  ParseBoolPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  DEFAULT_TYPE,
  DEFAULT_PAGE,
  DEFAULT_MAX_LIMIT,
  ProductType,
} from '@store/libs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get('')
  findAll(
    @Query('type', new DefaultValuePipe(DEFAULT_TYPE)) type: ProductType,
    @Query('page', new DefaultValuePipe(DEFAULT_PAGE), ParseIntPipe)
    page: number,
    @Query('limit', new DefaultValuePipe(DEFAULT_MAX_LIMIT), ParseIntPipe)
    limit: number,
    @Query('isDiscounted', new DefaultValuePipe(false), ParseBoolPipe)
    isDiscounted: boolean,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('sortBy') sortBy?: 'price_asc' | 'price_desc',
  ) {
    return this.productsService.findAll({
      type,
      page,
      limit,
      search,
      category,
      sortBy,
      isDiscounted,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('type') type: ProductType) {
    return this.productsService.findOne(id, type);
  }

  @Post('list')
  async getProductsByIds(@Body('ids') ids: string[]) {
    // If no IDs are provided, return an empty array immediately
    if (!ids || ids.length === 0) {
      return [];
    }

    return this.productsService.getProductsByIds(ids);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
