import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OtpService } from './otp.service';
import { RequestOtpDto, VerifyOtpDto } from './otp.dto';

@UseGuards(JwtAuthGuard)
@Controller('otp')
export class OtpController {
  constructor(private otp: OtpService) {}

  @Post('request')
  request(@Body() dto: RequestOtpDto) {
    return this.otp.request(dto.email);
  }

  @Post('verify')
  verify(@Body() dto: VerifyOtpDto) {
    return this.otp.verify(dto.email, dto.code);
  }
}
