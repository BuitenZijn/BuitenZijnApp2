import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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
    userId: v.id("users"),
    name: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

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
    userId: v.id("users"),
    roles: v.array(
      v.union(
        v.literal("admin"),
        v.literal("member"),
        v.literal("guest"),
        v.literal("lijndans"),
      ),
    ),
  },
  handler: async (ctx, args) => {
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
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
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
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
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
        ),
      ),
    ),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

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
