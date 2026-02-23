import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// ==========================================
// QUERIES
// ==========================================

/**
 * Get credit balance for a user
 */
export const getBalance = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("linedance_credits")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    return record?.balance ?? 0;
  },
});

/**
 * Get purchase history for a user
 */
export const getPurchaseHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const purchases = await ctx.db
      .query("linedance_credit_purchases")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);

    // Enrich with package name
    const enriched = await Promise.all(
      purchases.map(async (p) => {
        const pkg = p.packageId ? await ctx.db.get(p.packageId) : null;
        return {
          ...p,
          packageName: pkg?.name ?? p.note ?? "Manueel",
        };
      }),
    );

    return enriched;
  },
});

/**
 * Get all purchases (admin - revenue overview)
 */
export const getAllPurchases = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 200;
    const purchases = await ctx.db
      .query("linedance_credit_purchases")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);

    const enriched = await Promise.all(
      purchases.map(async (p) => {
        const user = await ctx.db.get(p.userId);
        const pkg = p.packageId ? await ctx.db.get(p.packageId) : null;
        return {
          ...p,
          userName: user?.name ?? user?.firstName ?? user?.email ?? "Onbekend",
          userEmail: user?.email ?? "",
          packageName: pkg?.name ?? p.note ?? "Manueel",
        };
      }),
    );

    return enriched;
  },
});

/**
 * Get all users with their credit balances (admin)
 */
export const getAllBalances = query({
  args: {},
  handler: async (ctx) => {
    const creditRecords = await ctx.db.query("linedance_credits").collect();

    const enriched = await Promise.all(
      creditRecords.map(async (cr) => {
        const user = await ctx.db.get(cr.userId);
        return {
          userId: cr.userId,
          balance: cr.balance,
          userName: user?.name ?? user?.firstName ?? user?.email ?? "Onbekend",
          userEmail: user?.email ?? "",
          userRole: user?.role ?? "guest",
          userRoles: user?.roles ?? (user?.role ? [user.role] : ["guest"]),
          updatedAt: cr.updatedAt,
        };
      }),
    );

    return enriched.sort((a, b) => a.userName.localeCompare(b.userName));
  },
});

/**
 * Get all users with 'lijndans' role, including those without credits (admin)
 */
export const getAllLijndansUsers = query({
  args: {},
  handler: async (ctx) => {
    // Get all users
    const allUsers = await ctx.db.query("users").collect();

    // Filter to users with 'lijndans' or 'admin' role
    const lijndansUsers = allUsers.filter((u) => {
      const roles = u.roles ?? (u.role ? [u.role] : []);
      return roles.includes("lijndans");
    });

    // Get all credit records
    const creditRecords = await ctx.db.query("linedance_credits").collect();
    const creditMap = new Map(
      creditRecords.map((cr) => [cr.userId.toString(), cr.balance]),
    );

    const enriched = lijndansUsers.map((user) => ({
      userId: user._id,
      balance: creditMap.get(user._id.toString()) ?? 0,
      userName: user.name ?? user.firstName ?? user.email ?? "Onbekend",
      userEmail: user.email ?? "",
      userRole: user.role ?? "guest",
      userRoles: user.roles ?? (user.role ? [user.role] : ["guest"]),
      updatedAt: Date.now(),
    }));

    return enriched.sort((a, b) => a.userName.localeCompare(b.userName));
  },
});

// ==========================================
// MUTATIONS
// ==========================================

/**
 * Add credits to a user (used by webhook or admin)
 */
export const addCredits = mutation({
  args: {
    userId: v.id("users"),
    credits: v.number(),
    paymentMethod: v.union(
      v.literal("stripe"),
      v.literal("cash"),
      v.literal("manual"),
    ),
    packageId: v.optional(v.id("linedance_credit_packages")),
    amountPaidInCents: v.optional(v.number()),
    stripeSessionId: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Update or create balance
    const existing = await ctx.db
      .query("linedance_credits")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        balance: existing.balance + args.credits,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("linedance_credits", {
        userId: args.userId,
        balance: args.credits,
        updatedAt: now,
      });
    }

    // Log the transaction
    await ctx.db.insert("linedance_credit_purchases", {
      userId: args.userId,
      packageId: args.packageId,
      credits: args.credits,
      amountPaidInCents: args.amountPaidInCents ?? 0,
      paymentMethod: args.paymentMethod,
      stripeSessionId: args.stripeSessionId,
      note: args.note,
      createdAt: now,
    });

    return { success: true };
  },
});

/**
 * Internal mutation for webhook to add credits (bypasses auth)
 */
export const internalAddCredits = internalMutation({
  args: {
    userId: v.id("users"),
    credits: v.number(),
    packageId: v.optional(v.id("linedance_credit_packages")),
    amountPaidInCents: v.number(),
    stripeSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const existing = await ctx.db
      .query("linedance_credits")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        balance: existing.balance + args.credits,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("linedance_credits", {
        userId: args.userId,
        balance: args.credits,
        updatedAt: now,
      });
    }

    await ctx.db.insert("linedance_credit_purchases", {
      userId: args.userId,
      packageId: args.packageId,
      credits: args.credits,
      amountPaidInCents: args.amountPaidInCents,
      paymentMethod: "stripe",
      stripeSessionId: args.stripeSessionId,
      createdAt: now,
    });

    return { success: true };
  },
});

/**
 * Admin: remove credits from a user
 */
export const removeCredits = mutation({
  args: {
    userId: v.id("users"),
    credits: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("linedance_credits")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!existing || existing.balance < args.credits) {
      throw new Error("Onvoldoende danskrediet");
    }

    await ctx.db.patch(existing._id, {
      balance: existing.balance - args.credits,
      updatedAt: Date.now(),
    });

    // Log as negative transaction
    await ctx.db.insert("linedance_credit_purchases", {
      userId: args.userId,
      credits: -args.credits,
      amountPaidInCents: 0,
      paymentMethod: "manual",
      note: args.note ?? "Danskrediet verwijderd door admin",
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Deduct 1 credit for check-in (called by check-in mutation)
 */
export const deductCredit = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("linedance_credits")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!existing || existing.balance < 1) {
      throw new Error("Geen danskrediet beschikbaar");
    }

    await ctx.db.patch(existing._id, {
      balance: existing.balance - 1,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
