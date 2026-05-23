import { Module } from '@nestjs/common';
import { OtpModule } from '../otp/otp.module';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

@Module({
  imports: [OtpModule],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
