import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, requireSelf } from "./authUtils";

/**
 * BuitenZijn App - User Functions
 *
 * Backend functions for user management.
 */

// ==========================================
// QUERIES
// ==========================================

/**
 * Get current user's profile
 */
export const getProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) return null;

    // Return profile data (without sensitive info)
    return {
      id: user._id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      roles: user.roles ?? (user.role ? [user.role] : ["member"]),
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  },
});

/**
 * List all users (admin only)
 */
export const listUsers = query({
  args: {
    sessionToken: v.string(),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const limit = args.limit ?? 50;

    const users = await ctx.db.query("users").order("desc").take(limit);

    return users.map((user) => ({
      id: user._id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      roles: user.roles ?? (user.role ? [user.role] : ["member"]),
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
    }));
  },
});

// ==========================================
// MUTATIONS
// ==========================================

/**
 * Update user profile
 */
export const updateProfile = mutation({
  args: {
    sessionToken: v.string(),
    userId: v.id("users"),
    name: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireSelf(ctx, args.sessionToken, args.userId);
    const { sessionToken: _t, userId, ...updates } = args;
    void _t;

    // Remove undefined values
    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }

    if (Object.keys(cleanUpdates).length === 0) {
      return { success: true };
    }

    cleanUpdates.updatedAt = Date.now();

    await ctx.db.patch(userId, cleanUpdates);

    return { success: true };
  },
});

/**
 * Update user roles (admin only)
 */
export const updateUserRoles = mutation({
  args: {
    sessionToken: v.string(),
    userId: v.id("users"),
    roles: v.array(
      v.union(
        v.literal("admin"),
        v.literal("member"),
        v.literal("guest"),
        v.literal("lijndans"),
        v.literal("ella"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    await ctx.db.patch(args.userId, {
      roles: args.roles,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Deactivate user (admin only)
 */
export const deactivateUser = mutation({
  args: { sessionToken: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    await ctx.db.patch(args.userId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Reactivate user (admin only)
 */
export const reactivateUser = mutation({
  args: { sessionToken: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    await ctx.db.patch(args.userId, {
      isActive: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Admin: update any user's fields
 */
export const adminUpdateUser = mutation({
  args: {
    sessionToken: v.string(),
    userId: v.id("users"),
    name: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    roles: v.optional(
      v.array(
        v.union(
          v.literal("admin"),
          v.literal("member"),
          v.literal("guest"),
          v.literal("lijndans"),
          v.literal("ella"),
        ),
      ),
    ),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const { sessionToken: _token, userId, ...updates } = args;
    void _token;

    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) clean[key] = value;
    }

    if (Object.keys(clean).length === 0) return { success: true };

    clean.updatedAt = Date.now();
    await ctx.db.patch(userId, clean);

    return { success: true };
  },
});

/**
 * Delete own account — anonymises personal data and deactivates the account.
 * Financial transaction records are retained for audit/legal purposes.
 * Also invalidates all active sessions.
 */
export const deleteAccount = mutation({
  args: {
    sessionToken: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Only the account owner (or an admin) may delete this account
    await requireSelf(ctx, args.sessionToken, args.userId);

    const now = Date.now();

    // Anonymise the user record — replace personal fields with placeholders
    await ctx.db.patch(args.userId, {
      email: `deleted_${args.userId}@deleted.invalid`,
      passwordHash: "DELETED",
      name: undefined,
      firstName: undefined,
      lastName: undefined,
      phone: undefined,
      avatarUrl: undefined,
      isActive: false,
      emailVerified: false,
      updatedAt: now,
    });

    // Invalidate all sessions for this user
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const s of sessions) {
      await ctx.db.delete(s._id);
    }

    // Delete email-verification tokens
    const verifyTokens = await ctx.db
      .query("emailVerificationTokens")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const t of verifyTokens) {
      await ctx.db.delete(t._id);
    }

    return { success: true };
  },
});
