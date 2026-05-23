import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustStockDto } from './stock.dto';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  movements(productId?: string) {
    return this.prisma.stockMovement.findMany({
      where: productId ? { productId } : undefined,
      include: {
        product: { select: { id: true, sku: true, name: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async adjust(userId: string, dto: AdjustStockDto) {
    return this.prisma.$transaction(
      async (tx) => {
        const product = await tx.product.findUnique({ where: { id: dto.productId } });
        if (!product) throw new BadRequestException('Product not found');
        const newStock = product.stock + dto.quantity;
        if (newStock < 0) throw new BadRequestException('Stock cannot be negative');

        await tx.product.update({
          where: { id: dto.productId },
          data: { stock: newStock },
        });
        return tx.stockMovement.create({
          data: {
            productId: dto.productId,
            userId,
            quantity: dto.quantity,
            reason: dto.reason,
            note: dto.note,
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
