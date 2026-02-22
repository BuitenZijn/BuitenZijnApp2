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

    // Organization roles (multiple roles per user)
    role: v.optional(
      v.union(
        v.literal("admin"),
        v.literal("member"),
        v.literal("guest"),
        v.literal("lijndans"),
      ),
    ),
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

    // Status
    isActive: v.boolean(),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    lastLoginAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
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
    lesson_period: v.string(),
    lesson_year: v.number(),
    dance_name: v.string(),
    song_artist: v.optional(v.string()),
    song_name: v.string(),
    video_url: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_lesson_period_year", ["lesson_period", "lesson_year"])
    .index("by_dance_name", ["dance_name"]),

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
  // CONTACT MESSAGES
  // ==========================================
  contactMessages: defineTable({
    name: v.string(),
    email: v.string(),
    message: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_read", ["read"]),

  // ==========================================
  // DANCE CREDITS: Credit balance per user
  // ==========================================
  dance_credits: defineTable({
    userId: v.id("users"),
    balance: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // ==========================================
  // DANCE CREDITS: Purchasable packages (admin-configurable)
  // ==========================================
  credit_packages: defineTable({
    name: v.string(),
    credits: v.number(),
    priceInCents: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  }),

  // ==========================================
  // DANCE CREDITS: Purchase history / transactions
  // ==========================================
  credit_purchases: defineTable({
    userId: v.id("users"),
    packageId: v.optional(v.id("credit_packages")),
    credits: v.number(),
    amountPaidInCents: v.number(),
    paymentMethod: v.union(
      v.literal("stripe"),
      v.literal("cash"),
      v.literal("manual"),
    ),
    stripeSessionId: v.optional(v.string()),
    note: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_stripeSessionId", ["stripeSessionId"])
    .index("by_createdAt", ["createdAt"]),

  // ==========================================
  // DANCE CREDITS: Lesson sessions (admin creates)
  // ==========================================
  dance_sessions: defineTable({
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    location: v.string(),
    qrToken: v.string(),
    qrExpiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_date", ["date"])
    .index("by_qrToken", ["qrToken"]),

  // ==========================================
  // DANCE CREDITS: Check-in records
  // ==========================================
  dance_checkins: defineTable({
    userId: v.id("users"),
    sessionId: v.id("dance_sessions"),
    creditsDeducted: v.number(),
    checkedInAt: v.number(),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_userId", ["userId"])
    .index("by_session_user", ["sessionId", "userId"]),
});
