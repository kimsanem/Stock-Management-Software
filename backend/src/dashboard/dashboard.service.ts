import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async summary() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [productCount, customerCount, lowStock, todaySales, todayRevenue] =
      await Promise.all([
        this.prisma.product.count({ where: { isActive: true } }),
        this.prisma.customer.count({ where: { deletedAt: null } }),
        this.prisma.$queryRaw<
          { count: bigint }[]
        >`SELECT COUNT(*)::bigint as count FROM "Product" WHERE "stock" <= "lowStockAlert" AND "isActive" = true`,
        this.prisma.sale.count({ where: { createdAt: { gte: startOfDay } } }),
        this.prisma.sale.aggregate({
          where: { createdAt: { gte: startOfDay } },
          _sum: { total: true },
        }),
      ]);

    return {
      productCount,
      customerCount,
      lowStockCount: Number(lowStock[0]?.count ?? 0),
      todaySales,
      todayRevenue: todayRevenue._sum.total ?? 0,
    };
  }
}
