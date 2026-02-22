import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * ELLA Subapp - Knutselen (Crafts) Functions
 *
 * CRUD operations for craft videos organized by category.
 */

const CATEGORIE_VALIDATOR = v.union(
  v.literal("tekenen"),
  v.literal("vouwen"),
  v.literal("schilderen"),
  v.literal("verven"),
  v.literal("slijm maken"),
  v.literal("boetseren"),
  v.literal("stempelen"),
);

// ==========================================
// QUERIES
// ==========================================

/**
 * Get all knutsel videos
 */
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("knutselen").order("desc").collect();
  },
});

/**
 * Get knutsel videos by category
 */
export const getByCategorie = query({
  args: { categorie: CATEGORIE_VALIDATOR },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("knutselen")
      .withIndex("by_categorie", (q) => q.eq("categorie", args.categorie))
      .order("desc")
      .collect();
  },
});

/**
 * Get all unique categories with counts
 */
export const getCategoryCounts = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("knutselen").collect();
    const counts: Record<string, number> = {};
    for (const item of all) {
      counts[item.categorie] = (counts[item.categorie] || 0) + 1;
    }
    return counts;
  },
});

/**
 * Get a single knutsel video by ID
 */
export const getById = query({
  args: { id: v.id("knutselen") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// ==========================================
// MUTATIONS
// ==========================================

/**
 * Add a new knutsel video
 */
export const add = mutation({
  args: {
    categorie: CATEGORIE_VALIDATOR,
    titel: v.string(),
    youtube_url: v.string(),
    beschrijving: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("knutselen", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update an existing knutsel video
 */
export const update = mutation({
  args: {
    id: v.id("knutselen"),
    categorie: v.optional(CATEGORIE_VALIDATOR),
    titel: v.optional(v.string()),
    youtube_url: v.optional(v.string()),
    beschrijving: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) clean[key] = value;
    }
    if (Object.keys(clean).length === 0) return { success: true };
    clean.updatedAt = Date.now();
    await ctx.db.patch(id, clean);
    return { success: true };
  },
});

/**
 * Delete a knutsel video
 */
export const remove = mutation({
  args: { id: v.id("knutselen") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
