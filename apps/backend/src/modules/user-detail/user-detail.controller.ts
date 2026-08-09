import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserDetailService } from './user-detail.service';
import { CreateUserDetailDto } from './dto/create-user-detail.dto';
import { UpdateUserDetailDto } from './dto/update-user-detail.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserOwnershipGuard } from '../../guards/user-ownership.guard';
import { SanitizeInterceptor } from '../../interceptors/sanitize.interceptor';

@Controller('user-detail')
@UseGuards(JwtAuthGuard, UserOwnershipGuard)
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
  @UseInterceptors(SanitizeInterceptor)
  update(
    @Param('userId') userId: string,
    @Body() updateData: UpdateUserDetailDto,
  ) {
    return this.userDetailService.update(userId, updateData);
  }

  @Post()
  @UseInterceptors(SanitizeInterceptor)
  create(@Body() createUserDetailDto: CreateUserDetailDto) {
    return this.userDetailService.create(createUserDetailDto);
  }

  @Delete(':userId')
  remove(@Param('userId') userId: string) {
    return this.userDetailService.remove(userId);
  }
}
