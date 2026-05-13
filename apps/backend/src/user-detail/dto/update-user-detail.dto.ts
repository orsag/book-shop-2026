import {
  IsString,
  IsOptional,
  MaxLength,
  IsUrl,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDetailDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  displayName?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  bio?: string;

  @IsOptional()
  @IsString()
  preferredLanguage: string;

  @IsOptional()
  @IsString()
  addressLine1?: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  stateProvince?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsString()
  iban?: string;

  @IsOptional()
  @IsString()
  bic?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  taxId?: string;

  // NOTICE: We omit isPremium and membership dates here!
  // Users shouldn't be able to touch those.
}
