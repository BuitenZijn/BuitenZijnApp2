"use node";

/**
 * BuitenZijn App - Email Service
 *
 * Convex action for sending emails via SMTP.
 * Note: We use actions (not mutations) because actions can make external API calls.
 */
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Send email action (internal - called by other actions)
 *
 * This action sends emails using nodemailer and SMTP.
 * Configure SMTP settings in .env.local
 */
export const sendEmail = internalAction({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    text: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Import nodemailer dynamically (only needed in actions)
    const nodemailer = await import("nodemailer");

    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_SECURE,
      SMTP_USER,
      SMTP_PASSWORD,
      EMAIL_FROM,
      EMAIL_FROM_NAME,
      EMAIL_TEST_MODE,
    } = process.env;

    // Validate configuration
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
      throw new Error(
        "SMTP configuration is missing. Please check your .env.local file",
      );
    }

    // Test mode — only allowed in non-production environments
    if (EMAIL_TEST_MODE === "true") {
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          "EMAIL_TEST_MODE must not be true in production. Check your environment variables.",
        );
      }
      console.log("📧 EMAIL TEST MODE - Would send:");
      console.log("To:", args.to);
      console.log("Subject:", args.subject);
      console.log("HTML:", args.html.substring(0, 200) + "...");
      return { success: true, messageId: "test-mode" };
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || "587"),
      secure: SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });

    // Send email
    try {
      const info = await transporter.sendMail({
        from: `"${EMAIL_FROM_NAME || "BuitenZijn"}" <${EMAIL_FROM || SMTP_USER}>`,
        to: args.to,
        subject: args.subject,
        text: args.text || args.html.replace(/<[^>]*>/g, ""), // Strip HTML as fallback
        html: args.html,
      });

      console.log("✅ Email sent:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("❌ Failed to send email:", error);
      throw new Error(
        `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
});

/**
 * Send verification email (internal - called from mutations)
 */
export const sendVerificationEmail = internalAction({
  args: {
    to: v.string(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email?token=${args.token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #212121; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4EB54A 0%, #186DB7 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #F5F3E8; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 30px; background: #4EB54A; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6e6e6e; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌿 BuitenZijn</h1>
            </div>
            <div class="content">
              <h2>Welkom bij BuitenZijn!</h2>
              <p>Bedankt voor je registratie. Klik op de knop hieronder om je e-mailadres te verifiëren:</p>
              <div style="text-align: center;">
                <a href="${verifyUrl}" class="button">Verifieer E-mailadres</a>
              </div>
              <p>Of kopieer deze link naar je browser:</p>
              <p style="word-break: break-all; color: #186DB7;">${verifyUrl}</p>
              <p style="margin-top: 30px; color: #6e6e6e; font-size: 14px;">
                Deze link is 24 uur geldig. Als je geen account hebt aangemaakt, kun je deze e-mail negeren.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} VZW BuitenZijn - Samen buiten zijn</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send the email using the main sendEmail logic
    const nodemailer = await import("nodemailer");

    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_SECURE,
      SMTP_USER,
      SMTP_PASSWORD,
      EMAIL_FROM,
      EMAIL_FROM_NAME,
      EMAIL_TEST_MODE,
    } = process.env;

    // Validate configuration
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
      throw new Error(
        "SMTP configuration is missing. Please check your .env.local file",
      );
    }

    // Test mode - log instead of sending
    if (EMAIL_TEST_MODE === "true") {
      console.log(
        "📧 EMAIL TEST MODE - Verification email would be sent to:",
        args.to,
      );
      return { success: true, messageId: "test-mode" };
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || "587"),
      secure: SMTP_SECURE === "true",
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });

    // Send email
    try {
      const info = await transporter.sendMail({
        from: `"${EMAIL_FROM_NAME || "BuitenZijn"}" <${EMAIL_FROM || SMTP_USER}>`,
        to: args.to,
        subject: "Verifieer je e-mailadres - BuitenZijn",
        text: html.replace(/<[^>]*>/g, ""),
        html,
      });

      console.log("✅ Verification email sent:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("❌ Failed to send verification email:", error);
      throw new Error(
        `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
});

/**
 * Send password reset email (internal - called from mutations)
 */
export const sendPasswordResetEmail = internalAction({
  args: {
    to: v.string(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${args.token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #212121; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4EB54A 0%, #186DB7 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #F5F3E8; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 30px; background: #186DB7; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .warning { background: #fdf3e8; border-left: 4px solid #E07A1F; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6e6e6e; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌿 BuitenZijn</h1>
            </div>
            <div class="content">
              <h2>Wachtwoord Resetten</h2>
              <p>We hebben een verzoek ontvangen om je wachtwoord te resetten. Klik op de knop hieronder om een nieuw wachtwoord in te stellen:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Wachtwoord</a>
              </div>
              <p>Of kopieer deze link naar je browser:</p>
              <p style="word-break: break-all; color: #186DB7;">${resetUrl}</p>
              <div class="warning">
                <strong>⚠️ Veiligheidsmelding:</strong> Als je dit verzoek niet hebt gedaan, kun je deze e-mail negeren. Je wachtwoord blijft ongewijzigd.
              </div>
              <p style="margin-top: 20px; color: #6e6e6e; font-size: 14px;">
                Deze link is 1 uur geldig.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} VZW BuitenZijn - Samen buiten zijn</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send the email using the main sendEmail logic
    const nodemailer = await import("nodemailer");

    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_SECURE,
      SMTP_USER,
      SMTP_PASSWORD,
      EMAIL_FROM,
      EMAIL_FROM_NAME,
      EMAIL_TEST_MODE,
    } = process.env;

    // Validate configuration
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
      throw new Error(
        "SMTP configuration is missing. Please check your .env.local file",
      );
    }

    // Test mode - log instead of sending
    if (EMAIL_TEST_MODE === "true") {
      console.log(
        "📧 EMAIL TEST MODE - Password reset email would be sent to:",
        args.to,
      );
      return { success: true, messageId: "test-mode" };
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || "587"),
      secure: SMTP_SECURE === "true",
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });

    // Send email
    try {
      const info = await transporter.sendMail({
        from: `"${EMAIL_FROM_NAME || "BuitenZijn"}" <${EMAIL_FROM || SMTP_USER}>`,
        to: args.to,
        subject: "Reset je wachtwoord - BuitenZijn",
        text: html.replace(/<[^>]*>/g, ""),
        html,
      });

      console.log("✅ Password reset email sent:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("❌ Failed to send password reset email:", error);
      throw new Error(
        `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
});
