/* 
author: HungNQ
date: 2025-03-06
  The MailService is responsible for sending verification emails to users.
  It uses nodemailer to create a transporter and send emails with a verification link.
  The service retrieves configuration values from the ConfigService for email settings.
  MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, and MAIL_FROM are expected to be set in the environment variables.
*/
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get("MAIL_HOST"),
      port: this.configService.get("MAIL_PORT"),
      secure: true,
      auth: {
        user: this.configService.get("MAIL_USER"),
        pass: this.configService.get("MAIL_PASS"),
      },
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationLink = `${this.configService.get("FRONTEND_URL")}/verify-email/check?token=${token}`;

    await this.transporter.sendMail({
      from: this.configService.get("MAIL_FROM"),
      to: email,
      subject: "Verify your email",
      html: `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email:</p>
        <a href="${verificationLink}">${verificationLink}</a>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `${this.configService.get("FRONTEND_URL")}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: this.configService.get("MAIL_FROM"),
      to: email,
      subject: "Reset Your Password",
      html: `
        <h1>Password Reset</h1>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      `,
    });
  }
}
