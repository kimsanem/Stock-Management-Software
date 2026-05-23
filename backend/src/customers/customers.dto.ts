import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsString() name!: string;
  @IsString() phone!: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsBoolean() isWholesale?: boolean;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateCustomerDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsBoolean() isWholesale?: boolean;
  @IsOptional() @IsString() notes?: string;
}
