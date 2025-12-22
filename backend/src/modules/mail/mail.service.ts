/* 
author: HungNQ
date: 2025-03-06
  The MailService is responsible for sending verification emails to users.
  It uses SendGrid's HTTP API to send emails with verification links and attachments.
  The service retrieves configuration values from the ConfigService for email settings.
  SENDGRID_API_KEY and MAIL_FROM (or SENDGRID_FROM) are expected to be set in the environment variables.
*/
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as sgMail from "@sendgrid/mail";

@Injectable()
export class MailService {
  private fromEmail: string | undefined;
  private isConfigured = false;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>("SENDGRID_API_KEY");
    this.fromEmail =
      this.configService.get<string>("MAIL_FROM") ||
      this.configService.get<string>("SENDGRID_FROM");

    if (!apiKey || !this.fromEmail) {
      console.warn(
        "SendGrid configuration missing. Required: SENDGRID_API_KEY and MAIL_FROM/SENDGRID_FROM"
      );
      return;
    }

    sgMail.setApiKey(apiKey);
    this.isConfigured = true;
  }

  private ensureConfigured() {
    if (!this.isConfigured || !this.fromEmail) {
      console.error(
        "SendGrid is not configured. Cannot send emails. Check SENDGRID_API_KEY and MAIL_FROM/SENDGRID_FROM."
      );
      throw new Error(
        "Email service is not configured. Please contact administrator."
      );
    }
  }

  async sendVerificationEmail(email: string, token: string) {
    this.ensureConfigured();

    const verificationLink = `${this.configService.get("FRONTEND_URL")}/verify-email/check?token=${token}`;

    try {
      await sgMail.send({
        from: this.fromEmail as string,
        to: email,
        subject: "Verify your email",
        html: `
          <h1>Email Verification</h1>
          <p>Please click the link below to verify your email:</p>
          <a href="${verificationLink}">${verificationLink}</a>
        `,
      });
    } catch (error) {
      throw new Error(
        "Failed to send verification email. Please try again later."
      );
    }
  }

  async sendPasswordResetEmail(email: string, token: string) {
    this.ensureConfigured();

    const resetLink = `${this.configService.get("FRONTEND_URL")}/reset-password?token=${token}`;

    try {
      await sgMail.send({
        from: this.fromEmail as string,
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
    } catch (error) {
      throw new Error(
        "Failed to send password reset email. Please try again later."
      );
    }
  }

  async sendPasswordResetCodeEmail(email: string, code: string) {
    this.ensureConfigured();

    try {
      await sgMail.send({
        from: this.fromEmail as string,
        to: email,
        subject: "Your Password Reset Code",
        html: `
          <h1>Password Reset Code</h1>
          <p>Use the code below to reset your password. This code expires in 1 hour.</p>
          <p style="font-size:24px;font-weight:bold;letter-spacing:4px;">${code}</p>
        `,
      });
    } catch (error) {
      throw new Error(
        "Failed to send password reset code email. Please try again later."
      );
    }
  }

  convertBase64ToPdfBuffer(base64Pdf: string): Buffer {
    if (!base64Pdf) throw new Error("Base64 input is required");

    return Buffer.from(
      base64Pdf.replace(/^data:application\/pdf;base64,/, ""),
      "base64"
    );
  }

  async sendCvPdfEmail(
    recipientEmail: string,
    pdfBuffer: Buffer,
    cvTitle: string
  ) {
    this.ensureConfigured();

    if (!recipientEmail || !pdfBuffer) {
      throw new Error("Recipient email and PDF buffer are required");
    }

    try {
      await sgMail.send({
        from: this.fromEmail as string,
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
            content: pdfBuffer.toString("base64"),
            type: "application/pdf",
            disposition: "attachment",
          },
        ],
      });
    } catch (error) {
      throw new Error("Failed to send CV PDF email. Please try again later.");
    }
  }
  async sendEmailActiveHr(email: string) {
    this.ensureConfigured();

    const frontendUrl = this.configService.get("FRONTEND_URL");

    try {
      await sgMail.send({
        from: this.fromEmail as string,
        to: email,
        subject: "Your HR Account Has Been Activated",
        html: `
          <h1>Your HR Account is Now Active 🎉</h1>
          <p>Dear HR,</p>
  
          <p>Your account has been successfully <b>activated by Admin</b>.</p>
          <p>You can now log in and start using the HR features on our platform.</p>
  
          <p>
            👉 <a href="${frontendUrl}login" 
            style="color: #0066ff; font-weight: bold;">Click here to login</a>
          </p>
  
          <p>If you did not expect this email, please contact our support team.</p>
  
          <br/>
          <p>Best regards,<br/>The Support Team</p>
        `,
      });
    } catch (error) {
      console.error("Failed to send activation email:", error);
      throw new Error(
        "Failed to send HR activation email. Please try again later."
      );
    }
  }
}
