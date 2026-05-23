import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SalesService } from './sales.service';
import { CreateSaleDto, SendReceiptDto } from './sales.dto';

@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private sales: SalesService) {}

  @Get()
  list(@Query('from') from?: string, @Query('to') to?: string) {
    return this.sales.list(from, to);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.sales.get(id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateSaleDto) {
    return this.sales.create(req.user.id, dto);
  }

  @Post(':id/send-receipt')
  sendReceipt(@Param('id') id: string, @Body() dto: SendReceiptDto) {
    return this.sales.sendReceipt(id, dto.email, dto.verifyToken);
  }
}
