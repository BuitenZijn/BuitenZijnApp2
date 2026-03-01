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
        v.literal("ella"),
      ),
    ),
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

  linedance_dances: defineTable({
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
  // LINEDANCE: Danskrediet balance per user
  // ==========================================
  linedance_credits: defineTable({
    userId: v.id("users"),
    balance: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // ==========================================
  // LINEDANCE: Danskrediet packages (admin-configurable)
  // ==========================================
  linedance_credit_packages: defineTable({
    name: v.string(),
    credits: v.number(),
    priceInCents: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  }),

  // ==========================================
  // LINEDANCE: Danskrediet purchase history / transactions
  // ==========================================
  linedance_credit_purchases: defineTable({
    userId: v.id("users"),
    packageId: v.optional(v.id("linedance_credit_packages")),
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
  // LINEDANCE: Lesson sessions (admin creates)
  // ==========================================
  linedance_sessions: defineTable({
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
  // LINEDANCE: Check-in records
  // ==========================================
  linedance_checkins: defineTable({
    userId: v.id("users"),
    sessionId: v.id("linedance_sessions"),
    creditsDeducted: v.number(),
    checkedInAt: v.number(),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_userId", ["userId"])
    .index("by_session_user", ["sessionId", "userId"]),

  // ==========================================
  // ELLA: Knutselen (crafts) videos
  // ==========================================
  ella_knutselen: defineTable({
    categorie: v.union(
      v.literal("tekenen"),
      v.literal("vouwen"),
      v.literal("schilderen"),
      v.literal("verven"),
      v.literal("slijm maken"),
      v.literal("boetseren"),
      v.literal("stempelen"),
    ),
    titel: v.string(),
    youtube_url: v.string(),
    beschrijving: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_categorie", ["categorie"])
    .index("by_createdAt", ["createdAt"]),

  // ==========================================
  // ELLA: Puzzle images for multiplication grid
  // ==========================================
  ella_puzzle_images: defineTable({
    storageId: v.id("_storage"),
    name: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_active", ["isActive"]),

  // ==========================================
  // ELLA: Game settings (singleton per game)
  // ==========================================
  ella_game_settings: defineTable({
    game: v.string(), // e.g. "multiplication_grid"
    settings: v.object({
      gridSize: v.number(),
      blanksPerRound: v.number(),
      bombChance: v.number(),
    }),
    updatedAt: v.number(),
  }).index("by_game", ["game"]),

  // ==========================================
  // ELLA: Dinosaurs
  // ==========================================
  ella_dinosaurs: defineTable({
    nummer: v.number(),
    nederlandseNaam: v.string(),
    wetenschappelijkeNaam: v.string(),
    korteBeschrijving: v.string(),
    leukWeetje: v.string(),
    imageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  })
    .index("by_nummer", ["nummer"])
    .index("by_naam", ["nederlandseNaam"]),

  // ==========================================
  // ELLA: Planets
  // ==========================================
  ella_planets: defineTable({
    nummer: v.number(),
    nederlandseNaam: v.string(),
    wetenschappelijkeNaam: v.string(),
    korteBeschrijving: v.string(),
    leukWeetje: v.string(),
    imageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  })
    .index("by_nummer", ["nummer"])
    .index("by_naam", ["nederlandseNaam"]),

  // ==========================================
  // BUZZ QUIZ: Quizzes
  // ==========================================
  quizzes: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_active", ["isActive"])
    .index("by_createdAt", ["createdAt"]),

  // ==========================================
  // BUZZ QUIZ: Questions
  // ==========================================
  quiz_questions: defineTable({
    quizId: v.id("quizzes"),
    questionText: v.string(),
    questionType: v.union(v.literal("multiple_choice"), v.literal("open")),
    // For multiple choice: array of option strings
    options: v.optional(v.array(v.string())),
    // The correct answer (for MC: the correct option text, for open: accepted answer)
    correctAnswer: v.string(),
    // Points awarded for this question
    points: v.number(),
    // Order within the quiz
    order: v.number(),
    // Time limit in seconds (0 = no limit)
    timeLimitSeconds: v.number(),
    createdAt: v.number(),
  })
    .index("by_quizId", ["quizId"])
    .index("by_quizId_order", ["quizId", "order"]),

  // ==========================================
  // BUZZ QUIZ: Game sessions (a live game instance)
  // ==========================================
  quiz_sessions: defineTable({
    quizId: v.id("quizzes"),
    // "lobby" | "active" | "question" | "revealing" | "finished"
    status: v.union(
      v.literal("lobby"),
      v.literal("active"),
      v.literal("question"),
      v.literal("revealing"),
      v.literal("finished"),
    ),
    joinCode: v.string(),
    currentQuestionIndex: v.number(),
    // Timestamp when current question was shown (for timing answers)
    questionStartedAt: v.optional(v.number()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_joinCode", ["joinCode"])
    .index("by_status", ["status"])
    .index("by_quizId", ["quizId"]),

  // ==========================================
  // BUZZ QUIZ: Session participants
  // ==========================================
  quiz_participants: defineTable({
    sessionId: v.id("quiz_sessions"),
    userId: v.optional(v.id("users")),
    displayName: v.string(),
    totalScore: v.number(),
    joinedAt: v.number(),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_session_user", ["sessionId", "userId"]),

  // ==========================================
  // BUZZ QUIZ: Answers
  // ==========================================
  quiz_answers: defineTable({
    sessionId: v.id("quiz_sessions"),
    questionId: v.id("quiz_questions"),
    participantId: v.id("quiz_participants"),
    answer: v.string(),
    isCorrect: v.boolean(),
    // Time in milliseconds from question shown to answer submitted
    responseTimeMs: v.number(),
    pointsAwarded: v.number(),
    answeredAt: v.number(),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_questionId", ["questionId"])
    .index("by_participantId", ["participantId"])
    .index("by_session_question", ["sessionId", "questionId"])
    .index("by_session_participant", ["sessionId", "participantId"]),
});
