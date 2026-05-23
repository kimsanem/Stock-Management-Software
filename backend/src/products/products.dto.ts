import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString() sku!: string;
  @IsString() name!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() category?: string;
  @IsNumber() @Min(0) priceRetail!: number;
  @IsNumber() @Min(0) priceWholesale!: number;
  @IsNumber() @Min(0) cost!: number;
  @IsOptional() @IsInt() @Min(0) stock?: number;
  @IsOptional() @IsInt() @Min(0) lowStockAlert?: number;
}

export class UpdateProductDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsNumber() @Min(0) priceRetail?: number;
  @IsOptional() @IsNumber() @Min(0) priceWholesale?: number;
  @IsOptional() @IsNumber() @Min(0) cost?: number;
  @IsOptional() @IsInt() @Min(0) lowStockAlert?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
