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
    const mailHost = this.configService.get("MAIL_HOST");
    const mailPort = this.configService.get("MAIL_PORT");
    const mailUser = this.configService.get("MAIL_USER");
    const mailPass = this.configService.get("MAIL_PASS");
    const mailSecure = this.configService.get("MAIL_SECURE") === "true";

    // Check if mail configuration is available
    if (!mailHost || !mailPort || !mailUser || !mailPass) {
      console.warn(
        "Mail configuration is incomplete. Email sending will be disabled.",
      );
      console.warn("Required: MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS");
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: mailHost,
      port: parseInt(mailPort),
      secure: parseInt(mailPort) === 465, // Port 465 requires secure: true
      auth: {
        user: mailUser,
        pass: mailPass,
      },
    });

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.error("Mail transporter verification failed:", error);
      } else {
        console.log("Mail transporter is ready to send emails");
      }
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    if (!this.transporter) {
      console.error(
        "Mail transporter is not configured. Cannot send verification email.",
      );
      throw new Error(
        "Email service is not configured. Please contact administrator.",
      );
    }

    const verificationLink = `${this.configService.get("FRONTEND_URL")}/verify-email/check?token=${token}`;

    try {
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
      console.log(`Verification email sent to ${email}`);
    } catch (error) {
      console.error("Failed to send verification email:", error);
      throw new Error(
        "Failed to send verification email. Please try again later.",
      );
    }
  }

  async sendPasswordResetEmail(email: string, token: string) {
    if (!this.transporter) {
      console.error(
        "Mail transporter is not configured. Cannot send password reset email.",
      );
      throw new Error(
        "Email service is not configured. Please contact administrator.",
      );
    }

    const resetLink = `${this.configService.get("FRONTEND_URL")}/reset-password?token=${token}`;

    try {
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
      console.log(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      throw new Error(
        "Failed to send password reset email. Please try again later.",
      );
    }
  }

  async sendPasswordResetCodeEmail(email: string, code: string) {
    if (!this.transporter) {
      console.error(
        "Mail transporter is not configured. Cannot send password reset code email.",
      );
      throw new Error(
        "Email service is not configured. Please contact administrator.",
      );
    }

    try {
      await this.transporter.sendMail({
        from: this.configService.get("MAIL_FROM"),
        to: email,
        subject: "Your Password Reset Code",
        html: `
          <h1>Password Reset Code</h1>
          <p>Use the code below to reset your password. This code expires in 1 hour.</p>
          <p style="font-size:24px;font-weight:bold;letter-spacing:4px;">${code}</p>
        `,
      });
      console.log(`Password reset code email sent to ${email}`);
    } catch (error) {
      console.error("Failed to send password reset code email:", error);
      throw new Error(
        "Failed to send password reset code email. Please try again later.",
      );
    }
  }

  convertBase64ToPdfBuffer(base64Pdf: string): Buffer {
    if (!base64Pdf) throw new Error("Base64 input is required");

    return Buffer.from(
      base64Pdf.replace(/^data:application\/pdf;base64,/, ""),
      "base64",
    );
  }

  async sendCvPdfEmail(
    recipientEmail: string,
    pdfBuffer: Buffer,
    cvTitle: string,
  ) {
    if (!this.transporter) {
      console.error(
        "Mail transporter is not configured. Cannot send CV PDF email.",
      );
      throw new Error(
        "Email service is not configured. Please contact administrator.",
      );
    }

    if (!recipientEmail || !pdfBuffer) {
      throw new Error("Recipient email and PDF buffer are required");
    }

    try {
      await this.transporter.sendMail({
        from: this.configService.get("MAIL_FROM"),
        to: recipientEmail,
        subject: `Your CV - ${cvTitle}`,
        html: `
          <h1>Your CV is ready!</h1>
          <p>Please find your CV PDF attached to this email.</p>
          <p>You can download and view the PDF file directly.</p>
          <p>If you did not request this, please ignore this email.</p>
        `,
        attachments: [
          {
            filename: `${cvTitle.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });
      console.log(`CV PDF email sent to ${recipientEmail}`);
    } catch (error) {
      console.error("Failed to send CV PDF email:", error);
      throw new Error("Failed to send CV PDF email. Please try again later.");
    }
  }
}
