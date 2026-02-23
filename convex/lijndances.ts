import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query to get all dances
export const getAllDances = query(async (ctx) => {
  return await ctx.db.query("linedance_dances").order("desc").collect();
});

// Query to get dances by period and year
export const getDancesByPeriodYear = query({
  args: {
    lesson_period: v.string(),
    lesson_year: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("linedance_dances")
      .withIndex("by_lesson_period_year", (q) =>
        q
          .eq("lesson_period", args.lesson_period)
          .eq("lesson_year", args.lesson_year),
      )
      .collect();
  },
});

// Mutation to add a new dance
export const addDance = mutation({
  args: {
    lesson_period: v.string(),
    lesson_year: v.number(),
    dance_name: v.string(),
    song_artist: v.optional(v.string()),
    song_name: v.string(),
    video_url: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const id = await ctx.db.insert("linedance_dances", {
      lesson_period: args.lesson_period,
      lesson_year: args.lesson_year,
      dance_name: args.dance_name,
      song_artist: args.song_artist,
      song_name: args.song_name,
      video_url: args.video_url,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

// Mutation to update a dance
export const updateDance = mutation({
  args: {
    id: v.id("linedance_dances"),
    lesson_period: v.string(),
    lesson_year: v.number(),
    dance_name: v.string(),
    song_artist: v.optional(v.string()),
    song_name: v.string(),
    video_url: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;

    await ctx.db.patch(id, {
      ...updateData,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Mutation to delete a dance
export const deleteDance = mutation({
  args: {
    id: v.id("linedance_dances"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});
