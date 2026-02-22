import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ==========================================
// QUERIES
// ==========================================

/**
 * List all active credit packages (for users to buy)
 */
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const packages = await ctx.db
      .query("credit_packages")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    return packages.sort((a, b) => a.credits - b.credits);
  },
});

/**
 * List all credit packages (admin view, including inactive)
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const packages = await ctx.db.query("credit_packages").collect();
    return packages.sort((a, b) => a.credits - b.credits);
  },
});

/**
 * Get a single credit package
 */
export const get = query({
  args: { packageId: v.id("credit_packages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.packageId);
  },
});

// ==========================================
// MUTATIONS (admin only)
// ==========================================

/**
 * Create a new credit package
 */
export const create = mutation({
  args: {
    name: v.string(),
    credits: v.number(),
    priceInCents: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("credit_packages", {
      name: args.name,
      credits: args.credits,
      priceInCents: args.priceInCents,
      isActive: true,
      createdAt: Date.now(),
    });
    return id;
  },
});

/**
 * Update a credit package
 */
export const update = mutation({
  args: {
    packageId: v.id("credit_packages"),
    name: v.optional(v.string()),
    credits: v.optional(v.number()),
    priceInCents: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { packageId, ...updates } = args;
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) clean[key] = value;
    }
    if (Object.keys(clean).length > 0) {
      await ctx.db.patch(packageId, clean);
    }
    return { success: true };
  },
});

/**
 * Deactivate a credit package (soft delete)
 */
export const deactivate = mutation({
  args: { packageId: v.id("credit_packages") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.packageId, { isActive: false });
    return { success: true };
  },
});
