import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/** Escape HTML special characters to prevent injection in emails */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Submit a contact form message.
 * Saves to the database and sends a notification email.
 */
export const submitContactMessage = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // Server-side input validation
    const name = args.name.trim();
    const email = args.email.trim().toLowerCase();
    const message = args.message.trim();

    if (name.length < 2 || name.length > 100) {
      throw new Error("Naam moet tussen 2 en 100 tekens lang zijn");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Ongeldig e-mailadres");
    }
    if (message.length < 10 || message.length > 5000) {
      throw new Error("Bericht moet tussen 10 en 5000 tekens lang zijn");
    }

    const now = Date.now();

    // Save to database
    const id = await ctx.db.insert("contactMessages", {
      name,
      email,
      message,
      read: false,
      createdAt: now,
    });

    // Send notification email — HTML-escape all user input to prevent injection
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

    try {
      await ctx.scheduler.runAfter(0, internal.email.sendEmail, {
        to: "info@buitenzijnvzw.be",
        subject: `Nieuw contactbericht van ${name}`,
        html: `
          <h2>Nieuw contactbericht via de website</h2>
          <p><strong>Naam:</strong> ${safeName}</p>
          <p><strong>E-mail:</strong> ${safeEmail}</p>
          <p><strong>Bericht:</strong></p>
          <p>${safeMessage}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Dit bericht werd verzonden via het contactformulier op buitenzijnvzw.be
          </p>
        `,
        text: `Nieuw contactbericht\n\nNaam: ${name}\nE-mail: ${email}\n\nBericht:\n${message}`,
      });
    } catch (error) {
      // Don't fail the mutation if email fails — the message is saved
      console.error("Failed to schedule contact notification email:", error);
    }

    return id;
  },
});
