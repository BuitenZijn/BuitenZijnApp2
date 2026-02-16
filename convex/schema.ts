import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * BuitenZijn App - Database Schema
 *
 * This file defines all database tables for the application.
 * Add new tables below the existing ones.
 */

export default defineSchema({
  // ==========================================
  // USERS TABLE
  // ==========================================
  users: defineTable({
    // Identity - required
    email: v.string(),
    passwordHash: v.string(),

    // Email verification
    emailVerified: v.boolean(),

    // Profile - optional
    name: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    phone: v.optional(v.string()),

    // Organization role
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("guest")),

    // Status
    isActive: v.boolean(),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    lastLoginAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_active", ["isActive"]),

  // ==========================================
  // EMAIL VERIFICATION TOKENS
  // ==========================================
  emailVerificationTokens: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    used: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),

  // ==========================================
  // PASSWORD RESET TOKENS
  // ==========================================
  passwordResetTokens: defineTable({
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    used: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_email", ["email"]),

  // ==========================================
  // SESSIONS
  // ==========================================
  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),

    // Session metadata
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),

    createdAt: v.number(),
    lastActiveAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"])
    .index("by_expiry", ["expiresAt"]),

  // ==========================================
  // LINEDANCE: DANCES
  // ==========================================

  linedances_dances: defineTable({
    dance_id: v.string(),
    lesson_period: v.string(),
    lesson_year: v.string(),
    dance_name: v.string(),
    song_artist: v.string(),
    song_name: v.string(),
    video_url: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_dance_id", ["dance_id"])
    .index("by_lesson_period_year", ["lesson_period", "lesson_year"]),

  // ==========================================
  // GRAVITY GRAB
  // ==========================================
  gravitygrab: defineTable({
    id: v.string(),
    player_name: v.string(),
    score: v.number(),
    level_reached: v.number(),
    timestamp: v.number(),
  })
    .index("by_player_name", ["player_name"])
    .index("by_score", ["score"])
    .index("by_level_reached", ["level_reached"])
    .index("by_timestamp", ["timestamp"]),

  // ==========================================
  // ADD YOUR FUTURE TABLES BELOW
  // ==========================================
  // Example: Activities table
  // activities: defineTable({
  //   title: v.string(),
  //   description: v.string(),
  //   date: v.number(),
  //   location: v.optional(v.string()),
  //   maxParticipants: v.optional(v.number()),
  //   createdBy: v.id("users"),
  //   createdAt: v.number(),
  //   updatedAt: v.number(),
  // })
  //   .index("by_date", ["date"])
  //   .index("by_creator", ["createdBy"]),

  // Example: Members table
  // members: defineTable({
  //   userId: v.id("users"),
  //   membershipType: v.union(
  //     v.literal("regular"),
  //     v.literal("premium"),
  //     v.literal("family")
  //   ),
  //   joinedAt: v.number(),
  //   expiresAt: v.optional(v.number()),
  //   isActive: v.boolean(),
  // })
  //   .index("by_user", ["userId"])
  //   .index("by_type", ["membershipType"]),
});
