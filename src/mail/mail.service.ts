import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  constructor(private configService: ConfigService) {}

  async sendEmail({
    to,
    subject,
    body,
  }: {
    to: string;
    subject: string;
    body: string;
  }) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: this.configService.get('EMAIL_USER'),
          pass: this.configService.get('EMAIL_PASS'),
        },
      });

      return await transporter.sendMail({
        from: this.configService.get('EMAIL_USER'),
        to,
        subject,
        html: body,
      });
    } catch (error) {
      throw new HttpException(
        'Email not delivered',
        HttpStatus.FAILED_DEPENDENCY,
      );
    }
  }
}
