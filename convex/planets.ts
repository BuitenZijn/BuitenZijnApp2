import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * ELLA Subapp - Planets
 *
 * CRUD operations for the planets table.
 */

// ==========================================
// QUERIES
// ==========================================

/**
 * Get all planets, ordered by nummer
 */
export const getAll = query({
  handler: async (ctx) => {
    const planets = await ctx.db
      .query("ella_planets")
      .withIndex("by_nummer")
      .collect();

    return Promise.all(
      planets.map(async (p) => ({
        ...p,
        imageUrl: p.imageId ? await ctx.storage.getUrl(p.imageId) : null,
      })),
    );
  },
});

/**
 * Get a single planet by ID
 */
export const getById = query({
  args: { id: v.id("ella_planets") },
  handler: async (ctx, args) => {
    const planet = await ctx.db.get(args.id);
    if (!planet) return null;
    return {
      ...planet,
      imageUrl: planet.imageId
        ? await ctx.storage.getUrl(planet.imageId)
        : null,
    };
  },
});

// ==========================================
// MUTATIONS
// ==========================================

/**
 * Generate an upload URL for a planet image
 */
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Set/update the image for a planet
 */
export const setImage = mutation({
  args: {
    id: v.id("ella_planets"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const planet = await ctx.db.get(args.id);
    if (!planet) throw new Error("Planet not found");

    if (planet.imageId) {
      await ctx.storage.delete(planet.imageId);
    }

    await ctx.db.patch(args.id, { imageId: args.storageId });
  },
});

/**
 * Remove the image from a planet
 */
export const removeImage = mutation({
  args: { id: v.id("ella_planets") },
  handler: async (ctx, args) => {
    const planet = await ctx.db.get(args.id);
    if (!planet) throw new Error("Planet not found");

    if (planet.imageId) {
      await ctx.storage.delete(planet.imageId);
      await ctx.db.patch(args.id, { imageId: undefined });
    }
  },
});

/**
 * Add a planet
 */
export const add = mutation({
  args: {
    nummer: v.number(),
    nederlandseNaam: v.string(),
    wetenschappelijkeNaam: v.string(),
    korteBeschrijving: v.string(),
    leukWeetje: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("ella_planets", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

/**
 * Update a planet
 */
export const update = mutation({
  args: {
    id: v.id("ella_planets"),
    nederlandseNaam: v.optional(v.string()),
    wetenschappelijkeNaam: v.optional(v.string()),
    korteBeschrijving: v.optional(v.string()),
    leukWeetje: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const patch: Record<string, string> = {};
    for (const [k, val] of Object.entries(fields)) {
      if (val !== undefined) patch[k] = val;
    }
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(id, patch);
    }
  },
});

/**
 * Delete a planet (and its image)
 */
export const remove = mutation({
  args: { id: v.id("ella_planets") },
  handler: async (ctx, args) => {
    const planet = await ctx.db.get(args.id);
    if (planet?.imageId) {
      await ctx.storage.delete(planet.imageId);
    }
    await ctx.db.delete(args.id);
  },
});
