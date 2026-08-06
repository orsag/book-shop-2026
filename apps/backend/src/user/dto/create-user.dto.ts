import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  MinLength,
  IsArray,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(3)
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;

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
}
