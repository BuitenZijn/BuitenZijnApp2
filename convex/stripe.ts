"use node";

/**
 * Stripe integration for dance credit purchases.
 *
 * Actions run in Node.js runtime for Stripe SDK usage.
 * Requires environment variables:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 *   CONVEX_SITE_URL (auto-set by Convex)
 */
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import Stripe from "stripe";

/**
 * Create a Stripe Checkout Session for purchasing credits
 */
export const createCheckoutSession = action({
  args: {
    userId: v.id("users"),
    packageId: v.id("credit_packages"),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ url: string | null; sessionId: string }> => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    // Get the package details
    const pkg: any = await ctx.runQuery(internal.stripeHelpers.getPackage, {
      packageId: args.packageId,
    });

    if (!pkg || !pkg.isActive) {
      throw new Error("Pakket niet beschikbaar");
    }

    // Get user details
    const user: any = await ctx.runQuery(internal.stripeHelpers.getUser, {
      userId: args.userId,
    });

    if (!user) {
      throw new Error("Gebruiker niet gevonden");
    }

    const siteUrl =
      process.env.CONVEX_SITE_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "https://buitenzijnvzw.be";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "bancontact"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: pkg.name,
              description: `${pkg.credits} danscredit${pkg.credits > 1 ? "s" : ""} voor lijndansen`,
            },
            unit_amount: pkg.priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${siteUrl}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/credits/cancel`,
      customer_email: user.email,
      metadata: {
        userId: args.userId,
        packageId: args.packageId,
        credits: String(pkg.credits),
      },
    });

    return { url: session.url, sessionId: session.id };
  },
});

/**
 * Verify a completed checkout (called from success page or polling)
 */
export const verifyCheckout = action({
  args: {
    stripeSessionId: v.string(),
  },
  handler: async (ctx, args): Promise<{ paid: boolean; status: string }> => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const session = await stripe.checkout.sessions.retrieve(
      args.stripeSessionId,
    );

    if (session.payment_status === "paid") {
      return { paid: true, status: session.payment_status };
    }

    return { paid: false, status: session.payment_status };
  },
});
