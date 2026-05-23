import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { StockService } from './stock.service';
import { AdjustStockDto } from './stock.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stock')
export class StockController {
  constructor(private stock: StockService) {}

  @Get('movements')
  movements(@Query('productId') productId?: string) {
    return this.stock.movements(productId);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Post('adjust')
  adjust(@Req() req: any, @Body() dto: AdjustStockDto) {
    return this.stock.adjust(req.user.id, dto);
  }
}
