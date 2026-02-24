import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * ELLA Subapp - Rekenen (Math) Functions
 *
 * Manage puzzle images and game settings for the multiplication grid game.
 */

// ==========================================
// FILE UPLOAD
// ==========================================

/**
 * Generate a URL for uploading a puzzle image
 */
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// ==========================================
// PUZZLE IMAGES
// ==========================================

/**
 * Add a puzzle image after upload
 */
export const addPuzzleImage = mutation({
  args: {
    storageId: v.id("_storage"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("ella_puzzle_images", {
      storageId: args.storageId,
      name: args.name,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

/**
 * Get all puzzle images (admin)
 */
export const getAllPuzzleImages = query({
  handler: async (ctx) => {
    const images = await ctx.db
      .query("ella_puzzle_images")
      .order("desc")
      .collect();

    // Attach URL to each image
    return Promise.all(
      images.map(async (img) => ({
        ...img,
        url: await ctx.storage.getUrl(img.storageId),
      })),
    );
  },
});

/**
 * Get active puzzle image URLs (for the game)
 */
export const getActivePuzzleImageUrls = query({
  handler: async (ctx) => {
    const images = await ctx.db
      .query("ella_puzzle_images")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const urls = await Promise.all(
      images.map(async (img) => {
        const url = await ctx.storage.getUrl(img.storageId);
        return url;
      }),
    );

    return urls.filter(Boolean) as string[];
  },
});

/**
 * Toggle active state of a puzzle image
 */
export const togglePuzzleImage = mutation({
  args: { id: v.id("ella_puzzle_images"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: args.isActive });
  },
});

/**
 * Delete a puzzle image
 */
export const deletePuzzleImage = mutation({
  args: { id: v.id("ella_puzzle_images") },
  handler: async (ctx, args) => {
    const img = await ctx.db.get(args.id);
    if (img) {
      await ctx.storage.delete(img.storageId);
      await ctx.db.delete(args.id);
    }
  },
});

// ==========================================
// GAME SETTINGS
// ==========================================

/**
 * Get game settings for multiplication grid
 */
export const getGameSettings = query({
  args: { game: v.string() },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("ella_game_settings")
      .withIndex("by_game", (q) => q.eq("game", args.game))
      .first();

    // Return defaults if no custom settings exist
    if (!setting) {
      return {
        gridSize: 10,
        blanksPerRound: 10,
        bombChance: 0.4,
      };
    }
    return setting.settings;
  },
});

/**
 * Update game settings
 */
export const updateGameSettings = mutation({
  args: {
    game: v.string(),
    settings: v.object({
      gridSize: v.number(),
      blanksPerRound: v.number(),
      bombChance: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("ella_game_settings")
      .withIndex("by_game", (q) => q.eq("game", args.game))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        settings: args.settings,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("ella_game_settings", {
        game: args.game,
        settings: args.settings,
        updatedAt: Date.now(),
      });
    }
  },
});
