import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

/**
 * Prono - Prediction Game
 *
 * Users predict match scores for competitions (e.g. WK 2026).
 * Admins manage competitions and matches via the web dashboard.
 */

// ==========================================
// COMPETITIONS
// ==========================================

export const getCompetitions = query({
  handler: async (ctx) => {
    return await ctx.db.query("prono_competitions").order("desc").collect();
  },
});

export const getActiveCompetitions = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("prono_competitions")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const getCompetition = query({
  args: { id: v.id("prono_competitions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createCompetition = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    emoji: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("prono_competitions", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateCompetition = mutation({
  args: {
    id: v.id("prono_competitions"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    emoji: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
  },
});

// ==========================================
// MATCHES
// ==========================================

export const getMatches = query({
  args: { competitionId: v.id("prono_competitions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("prono_matches")
      .withIndex("by_competition", (q) =>
        q.eq("competitionId", args.competitionId),
      )
      .collect();
  },
});

export const createMatch = mutation({
  args: {
    competitionId: v.id("prono_competitions"),
    matchNumber: v.optional(v.number()),
    homeTeam: v.string(),
    awayTeam: v.string(),
    homeFlag: v.optional(v.string()),
    awayFlag: v.optional(v.string()),
    matchDate: v.string(),
    matchTime: v.optional(v.string()),
    belgianTime: v.optional(v.string()),
    location: v.optional(v.string()),
    group: v.optional(v.string()),
    pointsExact: v.number(),
    pointsResult: v.number(),
    pointsGoalDiff: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("prono_matches", {
      ...args,
      isFinished: false,
      createdAt: Date.now(),
    });
  },
});

export const updateMatchResult = mutation({
  args: {
    id: v.id("prono_matches"),
    homeScore: v.number(),
    awayScore: v.number(),
  },
  handler: async (ctx, args) => {
    const match = await ctx.db.get(args.id);
    if (!match) throw new Error("Match niet gevonden");

    await ctx.db.patch(args.id, {
      homeScore: args.homeScore,
      awayScore: args.awayScore,
      isFinished: true,
    });

    // Calculate points for all predictions on this match
    const predictions = await ctx.db
      .query("prono_predictions")
      .withIndex("by_match", (q) => q.eq("matchId", args.id))
      .collect();

    for (const pred of predictions) {
      let points = 0;

      // Exact score match
      if (
        pred.homeScore === args.homeScore &&
        pred.awayScore === args.awayScore
      ) {
        points = match.pointsExact;
      } else {
        // Check correct result (win/draw/loss)
        const actualResult = Math.sign(args.homeScore - args.awayScore);
        const predResult = Math.sign(pred.homeScore - pred.awayScore);
        if (actualResult === predResult) {
          points = match.pointsResult;
        }

        // Check goal difference bonus
        if (
          match.pointsGoalDiff &&
          args.homeScore - args.awayScore === pred.homeScore - pred.awayScore
        ) {
          points += match.pointsGoalDiff;
        }
      }

      await ctx.db.patch(pred._id, { pointsAwarded: points });
    }
  },
});

export const deleteMatch = mutation({
  args: { id: v.id("prono_matches") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ==========================================
// PREDICTIONS
// ==========================================

export const getMyPredictions = query({
  args: {
    userId: v.id("users"),
    competitionId: v.id("prono_competitions"),
  },
  handler: async (ctx, args) => {
    const matches = await ctx.db
      .query("prono_matches")
      .withIndex("by_competition", (q) =>
        q.eq("competitionId", args.competitionId),
      )
      .collect();

    const matchIds = new Set(matches.map((m) => m._id));

    const allPredictions = await ctx.db
      .query("prono_predictions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return allPredictions.filter((p) => matchIds.has(p.matchId));
  },
});

export const savePrediction = mutation({
  args: {
    userId: v.id("users"),
    matchId: v.id("prono_matches"),
    homeScore: v.number(),
    awayScore: v.number(),
  },
  handler: async (ctx, args) => {
    // Check match hasn't started
    const match = await ctx.db.get(args.matchId);
    if (!match) throw new Error("Match niet gevonden");
    if (match.isFinished) throw new Error("Match is al gespeeld");

    // Check if prediction already exists
    const existing = await ctx.db
      .query("prono_predictions")
      .withIndex("by_user_match", (q) =>
        q.eq("userId", args.userId).eq("matchId", args.matchId),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        homeScore: args.homeScore,
        awayScore: args.awayScore,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("prono_predictions", {
      userId: args.userId,
      matchId: args.matchId,
      homeScore: args.homeScore,
      awayScore: args.awayScore,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// ==========================================
// LEADERBOARD
// ==========================================

export const getLeaderboard = query({
  args: { competitionId: v.id("prono_competitions") },
  handler: async (ctx, args) => {
    const matches = await ctx.db
      .query("prono_matches")
      .withIndex("by_competition", (q) =>
        q.eq("competitionId", args.competitionId),
      )
      .collect();

    const finishedMatchIds = new Set(
      matches.filter((m) => m.isFinished).map((m) => m._id),
    );

    // Get all predictions for finished matches
    const allPredictions: Array<{
      userId: string;
      pointsAwarded: number;
      homeScore: number;
      awayScore: number;
      matchId: string;
    }> = [];

    for (const matchId of finishedMatchIds) {
      const preds = await ctx.db
        .query("prono_predictions")
        .withIndex("by_match", (q) => q.eq("matchId", matchId))
        .collect();
      allPredictions.push(
        ...preds.map((p) => ({
          userId: p.userId,
          pointsAwarded: p.pointsAwarded ?? 0,
          homeScore: p.homeScore,
          awayScore: p.awayScore,
          matchId: p.matchId,
        })),
      );
    }

    // Aggregate per user
    const userStats = new Map<
      string,
      {
        totalPoints: number;
        exactPredictions: number;
        totalPredictions: number;
      }
    >();

    for (const pred of allPredictions) {
      const existing = userStats.get(pred.userId) ?? {
        totalPoints: 0,
        exactPredictions: 0,
        totalPredictions: 0,
      };
      existing.totalPoints += pred.pointsAwarded;
      existing.totalPredictions += 1;

      // Check if exact
      const match = matches.find((m) => m._id === pred.matchId);
      if (
        match &&
        pred.homeScore === match.homeScore &&
        pred.awayScore === match.awayScore
      ) {
        existing.exactPredictions += 1;
      }

      userStats.set(pred.userId, existing);
    }

    // Sort by total points descending
    const ranked = [...userStats.entries()]
      .sort(
        ([, a], [, b]) =>
          b.totalPoints - a.totalPoints ||
          b.exactPredictions - a.exactPredictions,
      )
      .slice(0, 50);

    // Fetch user names
    const result = [];
    for (const [userId, stats] of ranked) {
      const user = await ctx.db.get(userId as Id<"users">);
      result.push({
        userId,
        playerName: user?.firstName || user?.name || user?.email || "Onbekend",
        ...stats,
      });
    }

    return result;
  },
});
