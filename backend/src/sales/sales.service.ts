import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OtpPurpose, Prisma, SaleType, StockReason } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { OtpService } from '../otp/otp.service';
import { buildReceiptPdf, receiptHtml } from './receipt';
import { CreateSaleDto } from './sales.dto';

@Injectable()
export class SalesService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
    private otp: OtpService,
  ) {}

  async sendReceipt(saleId: string, email: string, verifyToken: string) {
    await this.otp.assertVerified(verifyToken, email, OtpPurpose.RECEIPT);
    const sale = await this.get(saleId);
    const pdf = await buildReceiptPdf(sale as any);
    await this.email.send({
      to: email,
      subject: `Receipt ${sale.invoiceNo}`,
      html: receiptHtml(sale as any),
      attachments: [
        { filename: `${sale.invoiceNo}.pdf`, content: pdf, contentType: 'application/pdf' },
      ],
    });
    return { ok: true };
  }

  list(from?: string, to?: string) {
    return this.prisma.sale.findMany({
      where: {
        createdAt: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      include: {
        customer: true,
        user: { select: { id: true, name: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async get(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        user: { select: { id: true, name: true } },
        items: { include: { product: true } },
      },
    });
    if (!sale) throw new NotFoundException('Sale not found');
    return sale;
  }

  async create(userId: string, dto: CreateSaleDto) {
    // Run the entire sale inside a Serializable transaction to prevent overselling.
    return this.prisma.$transaction(
      async (tx) => {
        const productIds = dto.items.map((i) => i.productId);
        const products = await tx.product.findMany({
          where: { id: { in: productIds }, isActive: true },
        });
        if (products.length !== productIds.length) {
          throw new BadRequestException('One or more products not found or inactive');
        }
        const byId = new Map(products.map((p) => [p.id, p]));

        let subtotal = new Prisma.Decimal(0);
        const itemRows: {
          productId: string;
          quantity: number;
          unitPrice: Prisma.Decimal;
          lineTotal: Prisma.Decimal;
        }[] = [];

        for (const item of dto.items) {
          const p = byId.get(item.productId)!;
          if (p.stock < item.quantity) {
            throw new BadRequestException(`Insufficient stock for ${p.name}`);
          }
          const unitPrice =
            dto.type === SaleType.WHOLESALE ? p.priceWholesale : p.priceRetail;
          const lineTotal = unitPrice.mul(item.quantity);
          subtotal = subtotal.add(lineTotal);
          itemRows.push({
            productId: p.id,
            quantity: item.quantity,
            unitPrice,
            lineTotal,
          });
        }

        const discount = new Prisma.Decimal(dto.discount ?? 0);
        const tax = new Prisma.Decimal(dto.tax ?? 0);
        const total = subtotal.sub(discount).add(tax);
        const paid = new Prisma.Decimal(dto.paid ?? total);

        const invoiceNo = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const sale = await tx.sale.create({
          data: {
            invoiceNo,
            customerId: dto.customerId,
            userId,
            type: dto.type,
            subtotal,
            discount,
            tax,
            total,
            paid,
            notes: dto.notes,
            items: { create: itemRows },
          },
          include: { items: true },
        });

        // Decrement stock + write audit rows.
        for (const item of dto.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              userId,
              quantity: -item.quantity,
              reason: StockReason.SALE,
              reference: sale.invoiceNo,
            },
          });
        }

        return sale;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
