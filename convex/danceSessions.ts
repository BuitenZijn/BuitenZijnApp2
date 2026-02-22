import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ==========================================
// QUERIES
// ==========================================

/**
 * Get a session by its QR token (used during check-in)
 */
export const getByQrToken = query({
  args: { qrToken: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dance_sessions")
      .withIndex("by_qrToken", (q) => q.eq("qrToken", args.qrToken))
      .unique();
  },
});

/**
 * Get today's session
 */
export const getToday = query({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0];
    return await ctx.db
      .query("dance_sessions")
      .withIndex("by_date", (q) => q.eq("date", today))
      .unique();
  },
});

/**
 * List sessions (optionally filter by month/year)
 */
export const list = query({
  args: {
    month: v.optional(v.number()),
    year: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    let sessions = await ctx.db
      .query("dance_sessions")
      .withIndex("by_date")
      .order("desc")
      .take(limit);

    if (args.month !== undefined && args.year !== undefined) {
      const monthStr = String(args.month).padStart(2, "0");
      const prefix = `${args.year}-${monthStr}`;
      sessions = sessions.filter((s) => s.date.startsWith(prefix));
    }

    return sessions;
  },
});

/**
 * Get a single session
 */
export const get = query({
  args: { sessionId: v.id("dance_sessions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sessionId);
  },
});

/**
 * Get check-in count for a session
 */
export const getCheckinCount = query({
  args: { sessionId: v.id("dance_sessions") },
  handler: async (ctx, args) => {
    const checkins = await ctx.db
      .query("dance_checkins")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    return checkins.length;
  },
});

/**
 * Get attendees for a session (admin)
 */
export const getAttendees = query({
  args: { sessionId: v.id("dance_sessions") },
  handler: async (ctx, args) => {
    const checkins = await ctx.db
      .query("dance_checkins")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const attendees = await Promise.all(
      checkins.map(async (c) => {
        const user = await ctx.db.get(c.userId);
        return {
          checkinId: c._id,
          userId: c.userId,
          userName: user?.name ?? user?.firstName ?? user?.email ?? "Onbekend",
          userEmail: user?.email ?? "",
          checkedInAt: c.checkedInAt,
        };
      }),
    );

    return attendees.sort((a, b) => a.checkedInAt - b.checkedInAt);
  },
});

// ==========================================
// MUTATIONS (admin only)
// ==========================================

/**
 * Generate a random token for QR
 */
function generateToken(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Create a new dance session
 */
export const create = mutation({
  args: {
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    const qrToken = generateToken();

    // QR expires at end of session day (23:59)
    const sessionDate = new Date(args.date + "T23:59:59");
    const qrExpiresAt = sessionDate.getTime();

    const id = await ctx.db.insert("dance_sessions", {
      date: args.date,
      startTime: args.startTime,
      endTime: args.endTime,
      location: args.location,
      qrToken,
      qrExpiresAt,
      createdAt: Date.now(),
    });

    return { id, qrToken };
  },
});

/**
 * Regenerate QR token for a session
 */
export const regenerateQr = mutation({
  args: { sessionId: v.id("dance_sessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Sessie niet gevonden");

    const qrToken = generateToken();
    const sessionDate = new Date(session.date + "T23:59:59");

    await ctx.db.patch(args.sessionId, {
      qrToken,
      qrExpiresAt: sessionDate.getTime(),
    });

    return { qrToken };
  },
});

/**
 * Delete a session (only if no check-ins)
 */
export const remove = mutation({
  args: { sessionId: v.id("dance_sessions") },
  handler: async (ctx, args) => {
    const checkins = await ctx.db
      .query("dance_checkins")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (checkins) {
      throw new Error("Kan sessie niet verwijderen: er zijn al check-ins");
    }

    await ctx.db.delete(args.sessionId);
    return { success: true };
  },
});
