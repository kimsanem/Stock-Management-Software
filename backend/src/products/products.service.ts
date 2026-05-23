import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './products.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  list(q?: string) {
    return this.prisma.product.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { sku: { contains: q, mode: 'insensitive' } },
              { category: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string) {
    const p = await this.prisma.product.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  create(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto });
  }

  update(id: string, dto: UpdateProductDto) {
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.product.update({ where: { id }, data: { isActive: false } });
  }

  lowStock() {
    return this.prisma.$queryRaw`
      SELECT * FROM "Product"
      WHERE "stock" <= "lowStockAlert" AND "isActive" = true
      ORDER BY "stock" ASC
    `;
  }
}
