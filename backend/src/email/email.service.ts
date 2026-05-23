import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: { filename: string; content: Buffer; contentType?: string }[];
};

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private from = '';

  onModuleInit() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    this.from = process.env.SMTP_FROM || user || 'no-reply@example.com';

    if (!host || !user || !pass) {
      this.logger.warn(
        'SMTP_HOST/SMTP_USER/SMTP_PASS not set — emails will be logged to console only.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  async send({ to, subject, html, text, attachments }: SendArgs) {
    if (!this.transporter) {
      this.logger.log(`[DEV EMAIL] to=${to} subject=${subject}\n${text || html}`);
      return { devLogged: true };
    }
    const info = await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      html,
      text,
      attachments,
    });
    return { messageId: info.messageId };
  }
}
