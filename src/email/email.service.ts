import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { getVerificationEmailTemplate } from './templates/verification.template';
import { getResendOtpEmailTemplate } from './templates/resend-otp.template';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendVerificationEmail(email: string, name: string, otp: string): Promise<boolean> {
    try {
      const template = getVerificationEmailTemplate(name, otp);

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@opensauce.com',
        to: email,
        subject: template.subject,
        html: template.html,
      });

      this.logger.log(`Verification email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}:`, error);
      return false;
    }
  }

  async sendResendOtpEmail(email: string, name: string, otp: string): Promise<boolean> {
    try {
      const template = getResendOtpEmailTemplate(name, otp);

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@opensauce.com',
        to: email,
        subject: template.subject,
        html: template.html,
      });

      this.logger.log(`Resend OTP email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send resend OTP email to ${email}:`, error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Email service connected successfully');
      return true;
    } catch (error) {
      this.logger.error('Email service connection failed:', error);
      return false;
    }
  }
}
