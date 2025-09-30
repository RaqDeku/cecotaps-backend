import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import nodemailer from 'nodemailer';
import { VerifyEmailEvent } from 'src/events/verify.email.event';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT!),
      // secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  @OnEvent('verify.email', { async: true })
  async sendVerificationEmail(verifyEmailEvent: VerifyEmailEvent) {
    const { email, url } = verifyEmailEvent;

    try {
      await this.transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: email,
        subject: 'Verify Email',
        html: `
          <p>You account was successfully created. Please verify your email</p>
          <a href="${url}">Click here to verify your email</a>
          
          <p>This link expires in 5 minutes.</p>
        `,
      });
    } catch (error) {
      console.error('Error sending email verification email:', error);
    }
  }

  @OnEvent('reset.password')
  async sendResetPasswordEmail(verifyEmailEvent: VerifyEmailEvent) {
    const { email, url } = verifyEmailEvent;

    try {
      await this.transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: email,
        subject: 'Request To Reset Password',
        html: `
          <p>You requested to change your password. Please verify your email</p>
          <a href="${url}">Click here to verify your email</a>

          <p>If you didn't request for a password request, kindly disregard this email.</a>
          
          <p>This link expires in 5 minutes.</p>
        `,
      });
    } catch (error) {
      console.error('Error sending email verification email:', error);
    }
  }
}
