import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { SaleType } from '@prisma/client';

export class SaleItemDto {
  @IsString() productId!: string;
  @IsInt() @Min(1) quantity!: number;
}

export class CreateSaleDto {
  @IsOptional() @IsString() customerId?: string;
  @IsEnum(SaleType) type!: SaleType;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => SaleItemDto)
  items!: SaleItemDto[];
  @IsOptional() @IsNumber() @Min(0) discount?: number;
  @IsOptional() @IsNumber() @Min(0) tax?: number;
  @IsOptional() @IsNumber() @Min(0) paid?: number;
  @IsOptional() @IsString() notes?: string;
}

export class SendReceiptDto {
  @IsEmail() email!: string;
  @IsString() verifyToken!: string;
}
