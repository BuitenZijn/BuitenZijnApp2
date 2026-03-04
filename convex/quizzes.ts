import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ==========================================
// QUIZ CRUD (Admin)
// ==========================================

export const listQuizzes = query(async (ctx) => {
  return await ctx.db.query("quizzes").order("desc").collect();
});

export const getQuiz = query({
  args: { id: v.id("quizzes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getActiveQuizzes = query(async (ctx) => {
  return await ctx.db
    .query("quizzes")
    .withIndex("by_active", (q) => q.eq("isActive", true))
    .collect();
});

export const createQuiz = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("quizzes", {
      title: args.title,
      description: args.description,
      isActive: false,
      createdBy: args.createdBy,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateQuiz = mutation({
  args: {
    id: v.id("quizzes"),
    title: v.string(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    reactionTimeScoring: v.optional(v.boolean()),
    scoringMode: v.optional(
      v.union(v.literal("linear"), v.literal("tiered"), v.literal("flat")),
    ),
    linearMinMultiplier: v.optional(v.number()),
    tieredBrackets: v.optional(
      v.array(
        v.object({
          withinMs: v.number(),
          bonusPoints: v.number(),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
      isActive: args.isActive,
      reactionTimeScoring: args.reactionTimeScoring,
      scoringMode: args.scoringMode,
      linearMinMultiplier: args.linearMinMultiplier,
      tieredBrackets: args.tieredBrackets,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

export const deleteQuiz = mutation({
  args: { id: v.id("quizzes") },
  handler: async (ctx, args) => {
    // Delete all questions for this quiz
    const questions = await ctx.db
      .query("quiz_questions")
      .withIndex("by_quizId", (q) => q.eq("quizId", args.id))
      .collect();
    for (const q of questions) {
      await ctx.db.delete(q._id);
    }
    // Delete all rounds for this quiz
    const rounds = await ctx.db
      .query("quiz_rounds")
      .withIndex("by_quizId", (q) => q.eq("quizId", args.id))
      .collect();
    for (const r of rounds) {
      await ctx.db.delete(r._id);
    }
    await ctx.db.delete(args.id);
  },
});

// ==========================================
// FILE UPLOAD (for question images)
// ==========================================

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/** Convert a storageId to a public URL */
export const getStorageUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// ==========================================
// ROUND CRUD (Admin)
// ==========================================

export const getRounds = query({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quiz_rounds")
      .withIndex("by_quizId_order", (q) => q.eq("quizId", args.quizId))
      .collect();
  },
});

export const addRound = mutation({
  args: {
    quizId: v.id("quizzes"),
    name: v.string(),
    roundType: v.union(
      v.literal("regular"),
      v.literal("sudden_death"),
      v.literal("eliminatie"),
    ),
    order: v.number(),
    eliminateCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("quiz_rounds", {
      quizId: args.quizId,
      name: args.name,
      roundType: args.roundType,
      order: args.order,
      eliminateCount: args.eliminateCount,
      createdAt: Date.now(),
    });
  },
});

export const updateRound = mutation({
  args: {
    id: v.id("quiz_rounds"),
    name: v.string(),
    roundType: v.union(
      v.literal("regular"),
      v.literal("sudden_death"),
      v.literal("eliminatie"),
    ),
    order: v.number(),
    eliminateCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
    return id;
  },
});

export const deleteRound = mutation({
  args: { id: v.id("quiz_rounds") },
  handler: async (ctx, args) => {
    // Unassign questions from this round
    const questions = await ctx.db
      .query("quiz_questions")
      .withIndex("by_roundId", (q) => q.eq("roundId", args.id))
      .collect();
    for (const q of questions) {
      await ctx.db.patch(q._id, { roundId: undefined });
    }
    await ctx.db.delete(args.id);
  },
});

// ==========================================
// QUESTION CRUD (Admin)
// ==========================================

export const getQuestions = query({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quiz_questions")
      .withIndex("by_quizId_order", (q) => q.eq("quizId", args.quizId))
      .collect();
  },
});

export const addQuestion = mutation({
  args: {
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
    options: v.optional(v.array(v.string())),
    optionImageUrls: v.optional(v.array(v.string())),
    correctAnswer: v.string(),
    points: v.number(),
    order: v.number(),
    timeLimitSeconds: v.number(),
    estimationUnit: v.optional(v.string()),
    geoZoom: v.optional(v.number()),
    matchingPairs: v.optional(
      v.array(v.object({ left: v.string(), right: v.string() })),
    ),
    roundId: v.optional(v.id("quiz_rounds")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("quiz_questions", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateQuestion = mutation({
  args: {
    id: v.id("quiz_questions"),
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
    options: v.optional(v.array(v.string())),
    optionImageUrls: v.optional(v.array(v.string())),
    correctAnswer: v.string(),
    points: v.number(),
    order: v.number(),
    timeLimitSeconds: v.number(),
    estimationUnit: v.optional(v.string()),
    geoZoom: v.optional(v.number()),
    matchingPairs: v.optional(
      v.array(v.object({ left: v.string(), right: v.string() })),
    ),
    roundId: v.optional(v.id("quiz_rounds")),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
    return id;
  },
});

export const deleteQuestion = mutation({
  args: { id: v.id("quiz_questions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ==========================================
// QUIZ SESSION (Live game)
// ==========================================

function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const createSession = mutation({
  args: {
    quizId: v.id("quizzes"),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const joinCode = generateJoinCode();
    return await ctx.db.insert("quiz_sessions", {
      quizId: args.quizId,
      status: "lobby",
      joinCode,
      currentQuestionIndex: 0,
      createdBy: args.createdBy,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getLiveSessions = query(async (ctx) => {
  const [lobby, active, question, revealing] = await Promise.all([
    ctx.db
      .query("quiz_sessions")
      .withIndex("by_status", (q) => q.eq("status", "lobby"))
      .collect(),
    ctx.db
      .query("quiz_sessions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect(),
    ctx.db
      .query("quiz_sessions")
      .withIndex("by_status", (q) => q.eq("status", "question"))
      .collect(),
    ctx.db
      .query("quiz_sessions")
      .withIndex("by_status", (q) => q.eq("status", "revealing"))
      .collect(),
  ]);
  const sessions = [...lobby, ...active, ...question, ...revealing];
  // Enrich with quiz title
  const enriched = await Promise.all(
    sessions.map(async (s) => {
      const quiz = await ctx.db.get(s.quizId);
      return { ...s, quizTitle: quiz?.title ?? "Quiz" };
    }),
  );
  return enriched;
});

export const getSession = query({
  args: { id: v.id("quiz_sessions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getSessionByJoinCode = query({
  args: { joinCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quiz_sessions")
      .withIndex("by_joinCode", (q) => q.eq("joinCode", args.joinCode))
      .first();
  },
});

export const startSession = mutation({
  args: { sessionId: v.id("quiz_sessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    // Find the first round (if any)
    const rounds = await ctx.db
      .query("quiz_rounds")
      .withIndex("by_quizId_order", (q) => q.eq("quizId", session.quizId))
      .collect();

    const firstRound = rounds.length > 0 ? rounds[0] : null;

    await ctx.db.patch(args.sessionId, {
      status: "question",
      currentQuestionIndex: 0,
      currentRoundId: firstRound?._id,
      questionStartedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const nextQuestion = mutation({
  args: { sessionId: v.id("quiz_sessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    const questions = await ctx.db
      .query("quiz_questions")
      .withIndex("by_quizId_order", (q) => q.eq("quizId", session.quizId))
      .collect();

    // Get rounds for this quiz
    const rounds = await ctx.db
      .query("quiz_rounds")
      .withIndex("by_quizId_order", (q) => q.eq("quizId", session.quizId))
      .collect();

    const currentQuestion = questions[session.currentQuestionIndex];

    // --- Elimination logic: after revealing, eliminate bottom players ---
    if (session.currentRoundId && currentQuestion) {
      const currentRound = await ctx.db.get(session.currentRoundId);
      if (currentRound?.roundType === "eliminatie") {
        // Get all non-eliminated participants
        const participants = await ctx.db
          .query("quiz_participants")
          .withIndex("by_sessionId", (q) => q.eq("sessionId", session._id))
          .collect();
        const alive = participants.filter((p) => !p.isEliminated);

        if (alive.length > 1) {
          const eliminateCount = currentRound.eliminateCount || 1;
          // Sort by totalScore ascending (lowest first)
          const sorted = [...alive].sort((a, b) => a.totalScore - b.totalScore);
          const toEliminate = sorted.slice(
            0,
            Math.min(eliminateCount, alive.length - 1),
          );
          for (const p of toEliminate) {
            await ctx.db.patch(p._id, {
              isEliminated: true,
              eliminatedInRound: currentRound._id,
            });
          }
        }
      }
    }

    const nextIndex = session.currentQuestionIndex + 1;
    if (nextIndex >= questions.length) {
      await ctx.db.patch(args.sessionId, {
        status: "finished",
        updatedAt: Date.now(),
      });
    } else {
      // Determine which round the next question belongs to
      const nextQ = questions[nextIndex];
      let nextRoundId = nextQ.roundId || undefined;

      // If the round changed, update the session
      await ctx.db.patch(args.sessionId, {
        status: "question",
        currentQuestionIndex: nextIndex,
        currentRoundId: nextRoundId,
        questionStartedAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

export const revealAnswer = mutation({
  args: { sessionId: v.id("quiz_sessions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      status: "revealing",
      updatedAt: Date.now(),
    });
  },
});

export const endSession = mutation({
  args: { sessionId: v.id("quiz_sessions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      status: "finished",
      updatedAt: Date.now(),
    });
  },
});

// ==========================================
// PARTICIPANTS
// ==========================================

export const joinSession = mutation({
  args: {
    joinCode: v.string(),
    displayName: v.string(),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("quiz_sessions")
      .withIndex("by_joinCode", (q) => q.eq("joinCode", args.joinCode))
      .first();

    if (!session) throw new Error("Geen sessie gevonden met deze code");
    if (session.status === "finished")
      throw new Error("Deze quiz is al afgelopen");

    // Check if already joined
    if (args.userId) {
      const existing = await ctx.db
        .query("quiz_participants")
        .withIndex("by_session_user", (q) =>
          q.eq("sessionId", session._id).eq("userId", args.userId!),
        )
        .first();
      if (existing)
        return { participantId: existing._id, sessionId: session._id };
    }

    const participantId = await ctx.db.insert("quiz_participants", {
      sessionId: session._id,
      userId: args.userId,
      displayName: args.displayName,
      totalScore: 0,
      joinedAt: Date.now(),
    });

    return { participantId, sessionId: session._id };
  },
});

export const getParticipants = query({
  args: { sessionId: v.id("quiz_sessions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quiz_participants")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();
  },
});

export const getLeaderboard = query({
  args: { sessionId: v.id("quiz_sessions") },
  handler: async (ctx, args) => {
    const participants = await ctx.db
      .query("quiz_participants")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    return participants.sort((a, b) => b.totalScore - a.totalScore);
  },
});

// ==========================================
// ANSWERS
// ==========================================

export const submitAnswer = mutation({
  args: {
    sessionId: v.id("quiz_sessions"),
    questionId: v.id("quiz_questions"),
    participantId: v.id("quiz_participants"),
    answer: v.string(),
    responseTimeMs: v.number(),
  },
  handler: async (ctx, args) => {
    // Prevent double-answer
    const existing = await ctx.db
      .query("quiz_answers")
      .withIndex("by_session_question", (q) =>
        q.eq("sessionId", args.sessionId).eq("questionId", args.questionId),
      )
      .filter((q) => q.eq(q.field("participantId"), args.participantId))
      .first();
    if (existing) return existing._id;

    const question = await ctx.db.get(args.questionId);
    if (!question) throw new Error("Question not found");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");
    const quiz = await ctx.db.get(session.quizId);

    // Check correctness based on question type
    const basePoints = question.points;
    const timeLimit = question.timeLimitSeconds * 1000;
    let isCorrect = false;
    let pointsAwarded = 0;

    if (question.questionType === "estimation") {
      // Estimation: score based on closeness to correct number
      const correctNum = parseFloat(question.correctAnswer);
      const playerNum = parseFloat(args.answer);
      if (!isNaN(correctNum) && !isNaN(playerNum)) {
        if (correctNum === 0) {
          // Special case: correct answer is 0
          const absError = Math.abs(playerNum);
          isCorrect = absError < 0.001;
          pointsAwarded = isCorrect
            ? basePoints
            : Math.round(basePoints * Math.max(0, 1 - absError));
        } else {
          const relativeError =
            Math.abs(playerNum - correctNum) / Math.abs(correctNum);
          isCorrect = relativeError < 0.001; // essentially exact
          // Score: full points at 0% error, 0 points at >=100% error
          pointsAwarded = Math.round(
            basePoints * Math.max(0, 1 - relativeError),
          );
        }
      }
    } else if (question.questionType === "ranking") {
      // Ranking: score per correct position
      try {
        const correctOrder: string[] = JSON.parse(question.correctAnswer);
        const playerOrder: string[] = JSON.parse(args.answer);
        let correctCount = 0;
        for (let i = 0; i < correctOrder.length; i++) {
          if (playerOrder[i] === correctOrder[i]) correctCount++;
        }
        isCorrect = correctCount === correctOrder.length;
        // Partial scoring: proportional to how many are in the right spot
        pointsAwarded = Math.round(
          basePoints * (correctCount / correctOrder.length),
        );
      } catch {
        isCorrect = false;
        pointsAwarded = 0;
      }
    } else if (question.questionType === "geo") {
      // Geo: score based on distance (in km) from correct location
      try {
        const [correctLat, correctLng] = question.correctAnswer
          .split(",")
          .map(Number);
        const [playerLat, playerLng] = args.answer.split(",").map(Number);
        // Haversine distance calculation
        const R = 6371; // Earth radius in km
        const dLat = ((playerLat - correctLat) * Math.PI) / 180;
        const dLng = ((playerLng - correctLng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((correctLat * Math.PI) / 180) *
            Math.cos((playerLat * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distKm = R * c;
        isCorrect = distKm < 50; // Within 50km = "correct"
        // Full points within 50km, linearly decays to 0 at 2000km
        const maxDist = 2000;
        pointsAwarded =
          distKm < 50
            ? basePoints
            : Math.round(basePoints * Math.max(0, 1 - distKm / maxDist));
      } catch {
        isCorrect = false;
        pointsAwarded = 0;
      }
    } else if (question.questionType === "matching") {
      // Matching: score per correct pair
      try {
        const correctPairs: Record<string, string> = JSON.parse(
          question.correctAnswer,
        );
        const playerPairs: Record<string, string> = JSON.parse(args.answer);
        const keys = Object.keys(correctPairs);
        let correctCount = 0;
        for (const key of keys) {
          if (playerPairs[key] === correctPairs[key]) correctCount++;
        }
        isCorrect = correctCount === keys.length;
        pointsAwarded = Math.round(basePoints * (correctCount / keys.length));
      } catch {
        isCorrect = false;
        pointsAwarded = 0;
      }
    } else {
      // MC / open: exact string match
      isCorrect =
        args.answer.trim().toLowerCase() ===
        question.correctAnswer.trim().toLowerCase();
      pointsAwarded = isCorrect ? basePoints : 0;
    }

    // Apply reaction time scoring for types that use it (MC, open, estimation)
    if (
      pointsAwarded > 0 &&
      question.questionType !== "ranking" &&
      question.questionType !== "geo" &&
      question.questionType !== "matching"
    ) {
      const useReactionTime = quiz?.reactionTimeScoring ?? false;
      const scoringMode = quiz?.scoringMode ?? "linear";

      if (useReactionTime && scoringMode !== "flat") {
        if (scoringMode === "tiered") {
          // Tiered scoring: base points + bonus for speed brackets
          const brackets = quiz?.tieredBrackets ?? [];
          const sorted = [...brackets].sort((a, b) => a.withinMs - b.withinMs);
          for (const bracket of sorted) {
            if (args.responseTimeMs <= bracket.withinMs) {
              pointsAwarded = pointsAwarded + bracket.bonusPoints;
              break;
            }
          }
        } else {
          // Linear scoring (default): multiplier decays linearly from 1.0 to minMultiplier
          const minMult = quiz?.linearMinMultiplier ?? 0.5;
          if (timeLimit > 0) {
            const ratio = Math.min(1, args.responseTimeMs / timeLimit);
            const multiplier = 1 - ratio * (1 - minMult);
            pointsAwarded = Math.round(pointsAwarded * multiplier);
          }
        }
      }
    }

    const answerId = await ctx.db.insert("quiz_answers", {
      sessionId: args.sessionId,
      questionId: args.questionId,
      participantId: args.participantId,
      answer: args.answer,
      isCorrect,
      responseTimeMs: args.responseTimeMs,
      pointsAwarded,
      answeredAt: Date.now(),
    });

    // Update participant total score
    const participant = await ctx.db.get(args.participantId);
    if (participant) {
      await ctx.db.patch(args.participantId, {
        totalScore: participant.totalScore + pointsAwarded,
      });

      // Sudden death: eliminate on wrong answer
      if (!isCorrect && session.currentRoundId) {
        const currentRound = await ctx.db.get(session.currentRoundId);
        if (
          currentRound?.roundType === "sudden_death" &&
          !participant.isEliminated
        ) {
          await ctx.db.patch(args.participantId, {
            isEliminated: true,
            eliminatedInRound: currentRound._id,
          });
        }
      }
    }

    return answerId;
  },
});

export const getAnswersForQuestion = query({
  args: {
    sessionId: v.id("quiz_sessions"),
    questionId: v.id("quiz_questions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quiz_answers")
      .withIndex("by_session_question", (q) =>
        q.eq("sessionId", args.sessionId).eq("questionId", args.questionId),
      )
      .collect();
  },
});

export const getMyAnswers = query({
  args: { participantId: v.id("quiz_participants") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quiz_answers")
      .withIndex("by_participantId", (q) =>
        q.eq("participantId", args.participantId),
      )
      .collect();
  },
});

// Get current question for a session (used by players)
export const getCurrentQuestion = query({
  args: { sessionId: v.id("quiz_sessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) return null;

    const questions = await ctx.db
      .query("quiz_questions")
      .withIndex("by_quizId_order", (q) => q.eq("quizId", session.quizId))
      .collect();

    const current = questions[session.currentQuestionIndex];
    if (!current) return null;

    // Get current round info
    let roundInfo: { name: string; roundType: string } | undefined;
    if (session.currentRoundId) {
      const round = await ctx.db.get(session.currentRoundId);
      if (round) {
        roundInfo = { name: round.name, roundType: round.roundType };
      }
    }

    // Don't send correct answer to players during active question
    if (session.status === "question") {
      // For matching, send only shuffled right-side options (not the mapping)
      let shuffledRightOptions: string[] | undefined;
      if (current.questionType === "matching" && current.matchingPairs) {
        shuffledRightOptions = current.matchingPairs
          .map((p) => p.right)
          .sort(() => Math.random() - 0.5);
      }
      return {
        _id: current._id,
        questionText: current.questionText,
        questionType: current.questionType,
        options: current.options,
        optionImageUrls: current.optionImageUrls,
        points: current.points,
        timeLimitSeconds: current.timeLimitSeconds,
        order: current.order,
        questionStartedAt: session.questionStartedAt,
        totalQuestions: questions.length,
        currentIndex: session.currentQuestionIndex,
        estimationUnit: current.estimationUnit,
        geoZoom: current.geoZoom,
        roundInfo,
        // For matching: left items + shuffled right items (not the correct mapping)
        matchingPairs:
          current.questionType === "matching" && current.matchingPairs
            ? current.matchingPairs.map((p) => ({ left: p.left, right: "" }))
            : undefined,
        shuffledRightOptions,
      };
    }

    // During reveal, include correct answer
    return {
      _id: current._id,
      questionText: current.questionText,
      questionType: current.questionType,
      options: current.options,
      optionImageUrls: current.optionImageUrls,
      correctAnswer: current.correctAnswer,
      points: current.points,
      timeLimitSeconds: current.timeLimitSeconds,
      order: current.order,
      questionStartedAt: session.questionStartedAt,
      totalQuestions: questions.length,
      currentIndex: session.currentQuestionIndex,
      estimationUnit: current.estimationUnit,
      geoZoom: current.geoZoom,
      matchingPairs: current.matchingPairs,
      roundInfo,
    };
  },
});
