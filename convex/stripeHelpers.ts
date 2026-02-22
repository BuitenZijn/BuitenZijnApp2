import { query, internalQuery } from "./_generated/server";
import { v } from "convex/values";

/**
 * Internal helpers for Stripe actions (need to read DB from actions context)
 */

export const getPackage = internalQuery({
  args: { packageId: v.id("credit_packages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.packageId);
  },
});

export const getUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

/**
 * Check if a Stripe session was already processed
 */
export const isPurchaseProcessed = internalQuery({
  args: { stripeSessionId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("credit_purchases")
      .withIndex("by_stripeSessionId", (q) =>
        q.eq("stripeSessionId", args.stripeSessionId),
      )
      .unique();
    return !!existing;
  },
});
