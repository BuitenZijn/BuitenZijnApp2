import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * ELLA Subapp - Rekenoefeningen (Math Exercises)
 *
 * Configurable math exercises with +, -, ×, ÷ and fractions.
 * Admin configures difficulty presets via the web dashboard.
 */

// ── Default difficulty presets ───────────────────────────────────────
const DEFAULT_DIFFICULTIES = [
  {
    id: "easy",
    label: "Makkelijk",
    emoji: "🟢",
    minNumber: 1,
    maxNumber: 20,
    addition: true,
    subtraction: true,
    multiplication: false,
    division: false,
    fractions: false,
    questionsPerRound: 10,
    timeLimitSeconds: 30,
    pointsPerCorrect: 10,
    speedBonus: 5,
    star1Threshold: 50,
    star2Threshold: 75,
    star3Threshold: 90,
  },
  {
    id: "medium",
    label: "Gemiddeld",
    emoji: "🟡",
    minNumber: 1,
    maxNumber: 50,
    addition: true,
    subtraction: true,
    multiplication: true,
    division: true,
    fractions: false,
    questionsPerRound: 15,
    timeLimitSeconds: 20,
    pointsPerCorrect: 15,
    speedBonus: 10,
    star1Threshold: 50,
    star2Threshold: 75,
    star3Threshold: 90,
  },
  {
    id: "hard",
    label: "Moeilijk",
    emoji: "🔴",
    minNumber: 1,
    maxNumber: 100,
    addition: true,
    subtraction: true,
    multiplication: true,
    division: true,
    fractions: true,
    questionsPerRound: 20,
    timeLimitSeconds: 15,
    pointsPerCorrect: 20,
    speedBonus: 15,
    star1Threshold: 50,
    star2Threshold: 75,
    star3Threshold: 90,
  },
];

// ── Get difficulty settings ──────────────────────────────────────────
export const getSettings = query({
  handler: async (ctx) => {
    const setting = await ctx.db.query("ella_rekenoefeningen_settings").first();

    if (!setting) {
      return { difficulties: DEFAULT_DIFFICULTIES };
    }
    return { difficulties: setting.difficulties };
  },
});

// ── Update difficulty settings (admin) ───────────────────────────────
const difficultyValidator = v.object({
  id: v.string(),
  label: v.string(),
  emoji: v.string(),
  minNumber: v.number(),
  maxNumber: v.number(),
  addition: v.boolean(),
  subtraction: v.boolean(),
  multiplication: v.boolean(),
  division: v.boolean(),
  fractions: v.boolean(),
  questionsPerRound: v.number(),
  timeLimitSeconds: v.number(),
  pointsPerCorrect: v.number(),
  speedBonus: v.number(),
  star1Threshold: v.number(),
  star2Threshold: v.number(),
  star3Threshold: v.number(),
});

export const updateSettings = mutation({
  args: {
    difficulties: v.array(difficultyValidator),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("ella_rekenoefeningen_settings")
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        difficulties: args.difficulties,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("ella_rekenoefeningen_settings", {
        difficulties: args.difficulties,
        updatedAt: Date.now(),
      });
    }
  },
});
