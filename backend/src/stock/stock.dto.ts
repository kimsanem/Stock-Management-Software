import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { StockReason } from '@prisma/client';

export class AdjustStockDto {
  @IsString() productId!: string;
  @IsInt() quantity!: number;
  @IsEnum(StockReason) reason!: StockReason;
  @IsOptional() @IsString() note?: string;
}
