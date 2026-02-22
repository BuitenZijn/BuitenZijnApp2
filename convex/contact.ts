import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

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
    const now = Date.now();

    // Save to database
    const id = await ctx.db.insert("contactMessages", {
      name: args.name,
      email: args.email,
      message: args.message,
      read: false,
      createdAt: now,
    });

    // Send notification email to info@buitenzijnvzw.be
    try {
      await ctx.scheduler.runAfter(0, internal.email.sendEmail, {
        to: "info@buitenzijnvzw.be",
        subject: `Nieuw contactbericht van ${args.name}`,
        html: `
          <h2>Nieuw contactbericht via de website</h2>
          <p><strong>Naam:</strong> ${args.name}</p>
          <p><strong>E-mail:</strong> ${args.email}</p>
          <p><strong>Bericht:</strong></p>
          <p>${args.message.replace(/\n/g, "<br>")}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Dit bericht werd verzonden via het contactformulier op buitenzijnvzw.be
          </p>
        `,
        text: `Nieuw contactbericht\n\nNaam: ${args.name}\nE-mail: ${args.email}\n\nBericht:\n${args.message}`,
      });
    } catch (error) {
      // Don't fail the mutation if email fails — the message is saved
      console.error("Failed to schedule contact notification email:", error);
    }

    return id;
  },
});
