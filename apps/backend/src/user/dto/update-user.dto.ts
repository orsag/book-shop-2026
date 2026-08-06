import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  IsArray,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  favorites?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cartItems?: string[];

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  // NOTICE: isAdmin is intentionally omitted here!
  // Users shouldn't be able to grant themselves admin rights.
}
