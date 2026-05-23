import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { OtpPurpose } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

const CODE_TTL_MS = 10 * 60 * 1000;
const REQUEST_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
const VERIFY_TOKEN_TTL = '15m';

@Injectable()
export class OtpService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
    private jwt: JwtService,
  ) {}

  async request(email: string, purpose: OtpPurpose = OtpPurpose.RECEIPT) {
    const normalized = email.trim().toLowerCase();

    const recent = await this.prisma.otp.findFirst({
      where: { email: normalized, purpose, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (recent && Date.now() - recent.createdAt.getTime() < REQUEST_COOLDOWN_MS) {
      throw new BadRequestException('Please wait before requesting another code');
    }

    // Invalidate any prior unconsumed codes for this email+purpose.
    await this.prisma.otp.updateMany({
      where: { email: normalized, purpose, consumedAt: null },
      data: { consumedAt: new Date() },
    });

    const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
    const codeHash = await bcrypt.hash(code, 10);

    await this.prisma.otp.create({
      data: {
        email: normalized,
        codeHash,
        purpose,
        expiresAt: new Date(Date.now() + CODE_TTL_MS),
      },
    });

    await this.email.send({
      to: normalized,
      subject: `Your verification code: ${code}`,
      text: `Your verification code is ${code}. It expires in 10 minutes.`,
      html: `<p>Your verification code is:</p>
             <p style="font-size:28px;letter-spacing:6px;font-weight:bold;">${code}</p>
             <p>It expires in 10 minutes.</p>`,
    });

    return { ok: true };
  }

  async verify(email: string, code: string, purpose: OtpPurpose = OtpPurpose.RECEIPT) {
    const normalized = email.trim().toLowerCase();
    const otp = await this.prisma.otp.findFirst({
      where: { email: normalized, purpose, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!otp) throw new UnauthorizedException('No active code — request a new one');

    if (otp.expiresAt < new Date()) {
      throw new UnauthorizedException('Code expired — request a new one');
    }
    if (otp.attempts >= MAX_ATTEMPTS) {
      throw new UnauthorizedException('Too many attempts — request a new code');
    }

    const ok = await bcrypt.compare(code, otp.codeHash);
    if (!ok) {
      await this.prisma.otp.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('Invalid code');
    }

    await this.prisma.otp.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() },
    });

    const verifyToken = await this.jwt.signAsync(
      { email: normalized, purpose, kind: 'otp-verified' },
      { expiresIn: VERIFY_TOKEN_TTL },
    );

    return { verifyToken, email: normalized };
  }

  async assertVerified(verifyToken: string, email: string, purpose: OtpPurpose) {
    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(verifyToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired verification token');
    }
    if (
      payload.kind !== 'otp-verified' ||
      payload.purpose !== purpose ||
      payload.email !== email.trim().toLowerCase()
    ) {
      throw new UnauthorizedException('Verification token does not match');
    }
  }
}
