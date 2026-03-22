import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// ── Default themes (used for seeding) ────────────────────────────────
const DEFAULT_THEMES = [
  {
    name: "Dieren",
    emoji: "🐾",
    emojis: [
      "🐶",
      "🐱",
      "🐭",
      "🐹",
      "🐰",
      "🦊",
      "🐻",
      "🐼",
      "🐨",
      "🐯",
      "🦁",
      "🐮",
      "🐷",
      "🐸",
      "🐵",
      "🐔",
      "🐧",
      "🐦",
      "🦆",
      "🦅",
      "🦉",
      "🐴",
      "🦄",
      "🐝",
      "🐛",
      "🦋",
      "🐌",
      "🐞",
      "🐙",
      "🐠",
      "🐬",
      "🐳",
    ],
  },
  {
    name: "Eten",
    emoji: "🍕",
    emojis: [
      "🍎",
      "🍐",
      "🍊",
      "🍋",
      "🍌",
      "🍉",
      "🍇",
      "🍓",
      "🫐",
      "🍒",
      "🍑",
      "🥭",
      "🍍",
      "🥝",
      "🍅",
      "🥑",
      "🥕",
      "🌽",
      "🥦",
      "🧁",
      "🍩",
      "🍪",
      "🎂",
      "🍫",
      "🍬",
      "🍭",
      "🍕",
      "🍔",
      "🌮",
      "🍟",
      "🧀",
      "🥐",
    ],
  },
  {
    name: "Sport",
    emoji: "⚽",
    emojis: [
      "⚽",
      "🏀",
      "🏈",
      "⚾",
      "🥎",
      "🎾",
      "🏐",
      "🏉",
      "🥏",
      "🎱",
      "🏓",
      "🏸",
      "🏒",
      "🥊",
      "🥋",
      "⛳",
      "🎯",
      "🏄",
      "🚴",
      "🏊",
      "🤸",
      "⛷️",
      "🏂",
      "🤺",
      "🏇",
      "🧗",
      "🚣",
      "🏋️",
      "🤾",
      "🥇",
      "🏆",
      "🎖️",
    ],
  },
  {
    name: "Natuur",
    emoji: "🌿",
    emojis: [
      "🌸",
      "🌺",
      "🌻",
      "🌹",
      "🌷",
      "🌵",
      "🎄",
      "🌲",
      "🌳",
      "🍀",
      "🍁",
      "🍂",
      "🍃",
      "🌾",
      "🌱",
      "🪴",
      "☀️",
      "🌈",
      "⭐",
      "🌙",
      "❄️",
      "🔥",
      "💧",
      "🌊",
      "⛰️",
      "🏔️",
      "🌋",
      "🏝️",
      "🍄",
      "🐚",
      "🪨",
      "💎",
    ],
  },
  {
    name: "Voertuigen",
    emoji: "🚗",
    emojis: [
      "🚗",
      "🚕",
      "🚙",
      "🚌",
      "🚎",
      "🏎️",
      "🚓",
      "🚑",
      "🚒",
      "🚐",
      "🛻",
      "🚚",
      "🚛",
      "🚜",
      "🏍️",
      "🛵",
      "🚲",
      "🛴",
      "🚂",
      "🚆",
      "🚇",
      "✈️",
      "🚀",
      "🛸",
      "🚁",
      "⛵",
      "🚤",
      "🛥️",
      "🚢",
      "⛽",
      "🚦",
      "🛞",
    ],
  },
];

// ── Seed default themes ──────────────────────────────────────────────
export const seedThemes = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("ella_memory_themes").collect();
    if (existing.length > 0) return { message: "Themes already seeded" };

    const now = Date.now();
    for (const theme of DEFAULT_THEMES) {
      await ctx.db.insert("ella_memory_themes", {
        name: theme.name,
        emoji: theme.emoji,
        emojis: theme.emojis,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }
    return { message: `Seeded ${DEFAULT_THEMES.length} themes` };
  },
});

// ── Get all active themes (for game) ─────────────────────────────────
export const getActiveThemes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("ella_memory_themes")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

// ── Get all themes (for admin) ───────────────────────────────────────
export const getAllThemes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("ella_memory_themes").collect();
  },
});

// ── Add a new theme ──────────────────────────────────────────────────
export const addTheme = mutation({
  args: {
    name: v.string(),
    emoji: v.string(),
    emojis: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("ella_memory_themes", {
      name: args.name,
      emoji: args.emoji,
      emojis: args.emojis,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// ── Update a theme ───────────────────────────────────────────────────
export const updateTheme = mutation({
  args: {
    id: v.id("ella_memory_themes"),
    name: v.optional(v.string()),
    emoji: v.optional(v.string()),
    emojis: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const theme = await ctx.db.get(id);
    if (!theme) throw new Error("Theme not found");

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// ── Delete a theme ───────────────────────────────────────────────────
export const deleteTheme = mutation({
  args: {
    id: v.id("ella_memory_themes"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
