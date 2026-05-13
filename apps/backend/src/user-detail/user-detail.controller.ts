import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserDetailService } from './user-detail.service';
import { CreateUserDetailDto } from './dto/create-user-detail.dto';
import { UpdateUserDetailDto } from './dto/update-user-detail.dto';

@Controller('user-detail')
export class UserDetailController {
  constructor(private readonly userDetailService: UserDetailService) {}

  @Get(':userId')
  findOne(@Param('userId') userId: string) {
    return this.userDetailService.findOne(userId);
  }

  @Get('/premium/:userId')
  findPremiumStatus(@Param('userId') userId: string) {
    return this.userDetailService.findPremiumStatus(userId);
  }

  @Patch(':userId')
  update(
    @Param('userId') userId: string,
    @Body() updateData: UpdateUserDetailDto,
  ) {
    return this.userDetailService.update(userId, updateData);
  }

  @Post()
  create(@Body() createUserDetailDto: CreateUserDetailDto) {
    return this.userDetailService.create(createUserDetailDto);
  }

  @Get()
  findAll() {
    return this.userDetailService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userDetailService.remove(+id);
  }
}
