import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * ELLA Subapp - Dinosaurs
 *
 * CRUD operations for the dinosaurs table.
 */

// ==========================================
// QUERIES
// ==========================================

/**
 * Get all dinosaurs, ordered by nummer
 */
export const getAll = query({
  handler: async (ctx) => {
    const dinos = await ctx.db
      .query("ella_dinosaurs")
      .withIndex("by_nummer")
      .collect();

    // Attach image URL if available
    return Promise.all(
      dinos.map(async (d) => ({
        ...d,
        imageUrl: d.imageId ? await ctx.storage.getUrl(d.imageId) : null,
      })),
    );
  },
});

/**
 * Get a single dinosaur by ID
 */
export const getById = query({
  args: { id: v.id("ella_dinosaurs") },
  handler: async (ctx, args) => {
    const dino = await ctx.db.get(args.id);
    if (!dino) return null;
    return {
      ...dino,
      imageUrl: dino.imageId ? await ctx.storage.getUrl(dino.imageId) : null,
    };
  },
});

// ==========================================
// MUTATIONS
// ==========================================

/**
 * Generate an upload URL for a dinosaur image
 */
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Set/update the image for a dinosaur
 */
export const setImage = mutation({
  args: {
    id: v.id("ella_dinosaurs"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const dino = await ctx.db.get(args.id);
    if (!dino) throw new Error("Dinosaur not found");

    // Delete old image if exists
    if (dino.imageId) {
      await ctx.storage.delete(dino.imageId);
    }

    await ctx.db.patch(args.id, { imageId: args.storageId });
  },
});

/**
 * Remove the image from a dinosaur
 */
export const removeImage = mutation({
  args: { id: v.id("ella_dinosaurs") },
  handler: async (ctx, args) => {
    const dino = await ctx.db.get(args.id);
    if (!dino) throw new Error("Dinosaur not found");

    if (dino.imageId) {
      await ctx.storage.delete(dino.imageId);
      await ctx.db.patch(args.id, { imageId: undefined });
    }
  },
});

/**
 * Add a dinosaur
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
    return await ctx.db.insert("ella_dinosaurs", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

/**
 * Update a dinosaur
 */
export const update = mutation({
  args: {
    id: v.id("ella_dinosaurs"),
    nederlandseNaam: v.optional(v.string()),
    wetenschappelijkeNaam: v.optional(v.string()),
    korteBeschrijving: v.optional(v.string()),
    leukWeetje: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    // Only patch defined fields
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
 * Delete a dinosaur (and its image)
 */
export const remove = mutation({
  args: { id: v.id("ella_dinosaurs") },
  handler: async (ctx, args) => {
    const dino = await ctx.db.get(args.id);
    if (dino?.imageId) {
      await ctx.storage.delete(dino.imageId);
    }
    await ctx.db.delete(args.id);
  },
});
