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
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
      isActive: args.isActive,
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
    questionType: v.union(v.literal("multiple_choice"), v.literal("open")),
    options: v.optional(v.array(v.string())),
    correctAnswer: v.string(),
    points: v.number(),
    order: v.number(),
    timeLimitSeconds: v.number(),
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
    questionType: v.union(v.literal("multiple_choice"), v.literal("open")),
    options: v.optional(v.array(v.string())),
    correctAnswer: v.string(),
    points: v.number(),
    order: v.number(),
    timeLimitSeconds: v.number(),
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
    await ctx.db.patch(args.sessionId, {
      status: "question",
      currentQuestionIndex: 0,
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

    const nextIndex = session.currentQuestionIndex + 1;
    if (nextIndex >= questions.length) {
      await ctx.db.patch(args.sessionId, {
        status: "finished",
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.patch(args.sessionId, {
        status: "question",
        currentQuestionIndex: nextIndex,
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

    // Check correctness
    const isCorrect =
      args.answer.trim().toLowerCase() ===
      question.correctAnswer.trim().toLowerCase();

    // Speed bonus: faster = more points (max 2x if instant)
    const timeLimit = question.timeLimitSeconds * 1000;
    let pointsAwarded = 0;
    if (isCorrect) {
      const speedFactor =
        timeLimit > 0
          ? Math.max(0.5, 1 - args.responseTimeMs / timeLimit) + 0.5
          : 1;
      pointsAwarded = Math.round(question.points * speedFactor);
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

    // Don't send correct answer to players during active question
    if (session.status === "question") {
      return {
        _id: current._id,
        questionText: current.questionText,
        questionType: current.questionType,
        options: current.options,
        points: current.points,
        timeLimitSeconds: current.timeLimitSeconds,
        order: current.order,
        questionStartedAt: session.questionStartedAt,
        totalQuestions: questions.length,
        currentIndex: session.currentQuestionIndex,
      };
    }

    // During reveal, include correct answer
    return {
      _id: current._id,
      questionText: current.questionText,
      questionType: current.questionType,
      options: current.options,
      correctAnswer: current.correctAnswer,
      points: current.points,
      timeLimitSeconds: current.timeLimitSeconds,
      order: current.order,
      questionStartedAt: session.questionStartedAt,
      totalQuestions: questions.length,
      currentIndex: session.currentQuestionIndex,
    };
  },
});
