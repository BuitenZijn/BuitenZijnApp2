import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const GAME_VALIDATOR = v.union(
  v.literal("planeten_puzzel"),
  v.literal("maaltafel_puzzel"),
  v.literal("dino_quiz"),
);

// ── Save a game score ────────────────────────────────────────────────
export const saveScore = mutation({
  args: {
    userId: v.id("users"),
    game: GAME_VALIDATOR,
    timeSeconds: v.number(),
    moves: v.optional(v.number()),
    mistakes: v.optional(v.number()),
    correctAnswers: v.optional(v.number()),
    totalQuestions: v.optional(v.number()),
    stars: v.optional(v.number()),
    difficulty: v.optional(v.string()),
    subjectName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("ella_game_scores", {
      ...args,
      completedAt: Date.now(),
    });
  },
});

// ── Get scores for a specific user + game ────────────────────────────
export const getMyScores = query({
  args: {
    userId: v.id("users"),
    game: GAME_VALIDATOR,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ella_game_scores")
      .withIndex("by_userId_game", (q) =>
        q.eq("userId", args.userId).eq("game", args.game),
      )
      .order("desc")
      .collect();
  },
});

// ── Get all scores for a user (all games) ────────────────────────────
export const getAllMyScores = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ella_game_scores")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// ── Top 10 leaderboard per game ──────────────────────────────────────
// Gets best score per user for a given game, ranked
export const getLeaderboard = query({
  args: {
    game: GAME_VALIDATOR,
  },
  handler: async (ctx, args) => {
    // Get all scores for this game
    const allScores = await ctx.db
      .query("ella_game_scores")
      .withIndex("by_game", (q) => q.eq("game", args.game))
      .collect();

    // Group by user, keep best score per user
    const bestByUser = new Map<string, (typeof allScores)[number]>();

    for (const score of allScores) {
      const existing = bestByUser.get(score.userId);
      if (!existing || isBetterScore(args.game, score, existing)) {
        bestByUser.set(score.userId, score);
      }
    }

    // Sort by best score
    const ranked = [...bestByUser.values()].sort((a, b) =>
      compareScores(args.game, a, b),
    );

    // Fetch user names for top 10
    const top10 = ranked.slice(0, 10);
    const result = [];
    for (const score of top10) {
      const user = await ctx.db.get(score.userId);
      result.push({
        ...score,
        playerName: user?.firstName || user?.name || user?.email || "Onbekend",
      });
    }

    return result;
  },
});

// ── Game stats summary for a user ────────────────────────────────────
export const getMyStats = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const allScores = await ctx.db
      .query("ella_game_scores")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const games = ["planeten_puzzel", "maaltafel_puzzel", "dino_quiz"] as const;
    const stats: Record<
      string,
      {
        timesPlayed: number;
        bestTime: number | null;
        avgTime: number | null;
        bestScore: number | null;
        lastPlayed: number | null;
      }
    > = {};

    for (const game of games) {
      const gameScores = allScores.filter((s) => s.game === game);
      if (gameScores.length === 0) {
        stats[game] = {
          timesPlayed: 0,
          bestTime: null,
          avgTime: null,
          bestScore: null,
          lastPlayed: null,
        };
        continue;
      }

      const times = gameScores.map((s) => s.timeSeconds);
      const bestTime = Math.min(...times);
      const avgTime = Math.round(
        times.reduce((a, b) => a + b, 0) / times.length,
      );
      const lastPlayed = Math.max(...gameScores.map((s) => s.completedAt));

      let bestScore: number | null = null;
      if (game === "planeten_puzzel") {
        // Lower moves is better
        const movesArr = gameScores
          .map((s) => s.moves)
          .filter((m): m is number => m != null);
        bestScore = movesArr.length > 0 ? Math.min(...movesArr) : null;
      } else if (game === "maaltafel_puzzel") {
        // Lower mistakes is better
        const mistakesArr = gameScores
          .map((s) => s.mistakes)
          .filter((m): m is number => m != null);
        bestScore = mistakesArr.length > 0 ? Math.min(...mistakesArr) : null;
      } else if (game === "dino_quiz") {
        // Higher correct answers is better
        const correctArr = gameScores
          .map((s) => s.correctAnswers)
          .filter((m): m is number => m != null);
        bestScore = correctArr.length > 0 ? Math.max(...correctArr) : null;
      }

      stats[game] = {
        timesPlayed: gameScores.length,
        bestTime,
        avgTime,
        bestScore,
        lastPlayed,
      };
    }

    return stats;
  },
});

// ── Helpers: compare scores (game-specific) ──────────────────────────

// ── All scores for a game (admin) ────────────────────────────────────
export const getAllScoresForGame = query({
  args: {
    game: GAME_VALIDATOR,
  },
  handler: async (ctx, args) => {
    const allScores = await ctx.db
      .query("ella_game_scores")
      .withIndex("by_game", (q) => q.eq("game", args.game))
      .order("desc")
      .collect();

    // Fetch user names
    const result = [];
    for (const score of allScores) {
      const user = await ctx.db.get(score.userId);
      result.push({
        ...score,
        playerName: user?.firstName || user?.name || user?.email || "Onbekend",
      });
    }
    return result;
  },
});

function isBetterScore(
  game: string,
  a: {
    timeSeconds: number;
    moves?: number | null;
    mistakes?: number | null;
    correctAnswers?: number | null;
    totalQuestions?: number | null;
  },
  b: {
    timeSeconds: number;
    moves?: number | null;
    mistakes?: number | null;
    correctAnswers?: number | null;
    totalQuestions?: number | null;
  },
): boolean {
  if (game === "planeten_puzzel") {
    // Fewer moves → better; tiebreak: faster time
    if ((a.moves ?? Infinity) !== (b.moves ?? Infinity))
      return (a.moves ?? Infinity) < (b.moves ?? Infinity);
    return a.timeSeconds < b.timeSeconds;
  }
  if (game === "maaltafel_puzzel") {
    // Fewer mistakes → better; tiebreak: faster time
    if ((a.mistakes ?? Infinity) !== (b.mistakes ?? Infinity))
      return (a.mistakes ?? Infinity) < (b.mistakes ?? Infinity);
    return a.timeSeconds < b.timeSeconds;
  }
  if (game === "dino_quiz") {
    // More correct → better; tiebreak: faster time
    if ((a.correctAnswers ?? 0) !== (b.correctAnswers ?? 0))
      return (a.correctAnswers ?? 0) > (b.correctAnswers ?? 0);
    return a.timeSeconds < b.timeSeconds;
  }
  return a.timeSeconds < b.timeSeconds;
}

function compareScores(
  game: string,
  a: {
    timeSeconds: number;
    moves?: number | null;
    mistakes?: number | null;
    correctAnswers?: number | null;
    totalQuestions?: number | null;
  },
  b: {
    timeSeconds: number;
    moves?: number | null;
    mistakes?: number | null;
    correctAnswers?: number | null;
    totalQuestions?: number | null;
  },
): number {
  // Negative = a is better (comes first)
  if (game === "planeten_puzzel") {
    const diff = (a.moves ?? Infinity) - (b.moves ?? Infinity);
    if (diff !== 0) return diff;
    return a.timeSeconds - b.timeSeconds;
  }
  if (game === "maaltafel_puzzel") {
    const diff = (a.mistakes ?? Infinity) - (b.mistakes ?? Infinity);
    if (diff !== 0) return diff;
    return a.timeSeconds - b.timeSeconds;
  }
  if (game === "dino_quiz") {
    // Higher correct answers first
    const diff = (b.correctAnswers ?? 0) - (a.correctAnswers ?? 0);
    if (diff !== 0) return diff;
    return a.timeSeconds - b.timeSeconds;
  }
  return a.timeSeconds - b.timeSeconds;
}
