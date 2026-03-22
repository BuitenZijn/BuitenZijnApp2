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
        v.literal("prono"),
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
          v.literal("prono"),
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
  // ELLA: Rekenoefeningen settings (singleton)
  // ==========================================
  ella_rekenoefeningen_settings: defineTable({
    // Difficulty presets: easy, medium, hard
    difficulties: v.array(
      v.object({
        id: v.string(),
        label: v.string(),
        emoji: v.string(),
        // Number range
        minNumber: v.number(),
        maxNumber: v.number(),
        // Enabled operations
        addition: v.boolean(),
        subtraction: v.boolean(),
        multiplication: v.boolean(),
        division: v.boolean(),
        fractions: v.boolean(),
        // Questions per round
        questionsPerRound: v.number(),
        // Time limit per question in seconds (0 = no limit)
        timeLimitSeconds: v.number(),
        // Points per correct answer
        pointsPerCorrect: v.number(),
        // Bonus points for speed (within half the time limit)
        speedBonus: v.number(),
        // Star thresholds (percentage correct)
        star1Threshold: v.number(), // e.g. 50
        star2Threshold: v.number(), // e.g. 75
        star3Threshold: v.number(), // e.g. 90
      }),
    ),
    updatedAt: v.number(),
  }),

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
  // BUZZ QUIZ: Rounds
  // ==========================================
  quiz_rounds: defineTable({
    quizId: v.id("quizzes"),
    name: v.string(),
    roundType: v.union(
      v.literal("regular"),
      v.literal("sudden_death"),
      v.literal("eliminatie"),
    ),
    order: v.number(),
    // For eliminatie: how many players to eliminate per question (0 = bottom player)
    eliminateCount: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_quizId", ["quizId"])
    .index("by_quizId_order", ["quizId", "order"]),

  // ==========================================
  // BUZZ QUIZ: Quizzes
  // ==========================================
  quizzes: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    // Scoring configuration
    reactionTimeScoring: v.optional(v.boolean()), // Enable speed-based scoring
    // "linear" = linear decay, "tiered" = time brackets, "flat" = no speed bonus
    scoringMode: v.optional(
      v.union(v.literal("linear"), v.literal("tiered"), v.literal("flat")),
    ),
    // For linear: minimum multiplier (0-1), e.g. 0.5 means slowest gets 50% of points
    linearMinMultiplier: v.optional(v.number()),
    // For tiered: bonus points per tier [fast, medium, slow] thresholds in ms and bonus points
    tieredBrackets: v.optional(
      v.array(
        v.object({
          withinMs: v.number(), // Answer within this many ms
          bonusPoints: v.number(), // Extra points awarded
        }),
      ),
    ),
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
    questionType: v.union(
      v.literal("multiple_choice"),
      v.literal("multiple_choice_picture"),
      v.literal("open"),
      v.literal("estimation"),
      v.literal("ranking"),
      v.literal("geo"),
      v.literal("matching"),
    ),
    // For multiple choice: array of option strings (labels)
    options: v.optional(v.array(v.string())),
    // For multiple_choice_picture: array of image URLs matching options order
    optionImageUrls: v.optional(v.array(v.string())),
    // The correct answer (for MC: the correct option text, for open: accepted answer,
    // for estimation: the number as string, for ranking: JSON array of correct order,
    // for geo: "lat,lng", for matching: JSON object mapping left→right)
    correctAnswer: v.string(),
    // Points awarded for this question
    points: v.number(),
    // Order within the quiz
    order: v.number(),
    // Time limit in seconds (0 = no limit)
    timeLimitSeconds: v.number(),
    // For estimation: unit label (e.g. "km", "jaar", "inwoners")
    estimationUnit: v.optional(v.string()),
    // For geo: map center and zoom
    geoZoom: v.optional(v.number()),
    // For matching: array of left→right pairs
    matchingPairs: v.optional(
      v.array(v.object({ left: v.string(), right: v.string() })),
    ),
    // Optional round assignment
    roundId: v.optional(v.id("quiz_rounds")),
    createdAt: v.number(),
  })
    .index("by_quizId", ["quizId"])
    .index("by_quizId_order", ["quizId", "order"])
    .index("by_roundId", ["roundId"]),

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
    // Track current round
    currentRoundId: v.optional(v.id("quiz_rounds")),
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
    isEliminated: v.optional(v.boolean()),
    eliminatedInRound: v.optional(v.id("quiz_rounds")),
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

  // ==========================================
  // ELLA: Game scores (per-user, per-game)
  // ==========================================
  ella_game_scores: defineTable({
    userId: v.id("users"),
    game: v.union(
      v.literal("planeten_puzzel"),
      v.literal("maaltafel_puzzel"),
      v.literal("dino_quiz"),
      v.literal("rekenoefeningen"),
      v.literal("memory_game"),
    ),
    // Time in seconds to finish the game
    timeSeconds: v.number(),
    // Game-specific metrics
    moves: v.optional(v.number()), // planeten_puzzel: swap count
    mistakes: v.optional(v.number()), // maaltafel_puzzel: wrong answers
    correctAnswers: v.optional(v.number()), // dino_quiz: correct count
    totalQuestions: v.optional(v.number()), // dino_quiz: total dinos
    stars: v.optional(v.number()), // star rating (1-3)
    // Context
    difficulty: v.optional(v.string()), // e.g. "4x4", "5x5"
    subjectName: v.optional(v.string()), // e.g. planet name, image name
    // Timestamps
    completedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_game", ["game"])
    .index("by_userId_game", ["userId", "game"])
    .index("by_game_completedAt", ["game", "completedAt"]),

  // ==========================================
  // ELLA: Memory Game Themes
  // ==========================================
  ella_memory_themes: defineTable({
    name: v.string(), // e.g. "Dieren", "Eten"
    emoji: v.string(), // theme icon e.g. "🐾"
    emojis: v.array(v.string()), // array of emojis in this theme
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_active", ["isActive"]),

  // ==========================================
  // PRONO: Competitions (e.g. WK 2026)
  // ==========================================
  prono_competitions: defineTable({
    name: v.string(), // e.g. "WK 2026"
    description: v.optional(v.string()),
    emoji: v.optional(v.string()),
    isActive: v.boolean(),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_active", ["isActive"])
    .index("by_createdAt", ["createdAt"]),

  // ==========================================
  // PRONO: Matches within a competition
  // ==========================================
  prono_matches: defineTable({
    competitionId: v.id("prono_competitions"),
    matchNumber: v.optional(v.number()), // e.g. match 1, 2, 3...
    homeTeam: v.string(),
    awayTeam: v.string(),
    homeFlag: v.optional(v.string()), // emoji flag e.g. "🇧🇪"
    awayFlag: v.optional(v.string()), // emoji flag e.g. "🇩🇪"
    matchDate: v.string(), // ISO date
    matchTime: v.optional(v.string()), // local time e.g. "12:00"
    belgianTime: v.optional(v.string()), // Belgian time e.g. "21:00"
    location: v.optional(v.string()), // e.g. "Mexico-Stad"
    group: v.optional(v.string()), // e.g. "Groep A", "Kwartfinale"
    homeScore: v.optional(v.number()),
    awayScore: v.optional(v.number()),
    isFinished: v.boolean(),
    pointsExact: v.number(), // points for exact score
    pointsResult: v.number(), // points for correct result (win/draw/loss)
    pointsGoalDiff: v.optional(v.number()), // points for correct goal difference
    createdAt: v.number(),
  })
    .index("by_competition", ["competitionId"])
    .index("by_competition_date", ["competitionId", "matchDate"]),

  // ==========================================
  // PRONO: User predictions
  // ==========================================
  prono_predictions: defineTable({
    userId: v.id("users"),
    matchId: v.id("prono_matches"),
    homeScore: v.number(),
    awayScore: v.number(),
    pointsAwarded: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_match", ["matchId"])
    .index("by_user_match", ["userId", "matchId"]),

  // ==========================================
  // PRONO: Leaderboard cache (per competition)
  // ==========================================
  prono_leaderboard: defineTable({
    competitionId: v.id("prono_competitions"),
    userId: v.id("users"),
    totalPoints: v.number(),
    exactPredictions: v.number(),
    correctResults: v.number(),
    totalPredictions: v.number(),
    updatedAt: v.number(),
  })
    .index("by_competition", ["competitionId"])
    .index("by_competition_user", ["competitionId", "userId"])
    .index("by_competition_points", ["competitionId", "totalPoints"]),
});
