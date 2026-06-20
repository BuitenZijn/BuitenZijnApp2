import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireSelf } from "./authUtils";

/**
 * Check in to a dance session by scanning QR code.
 * Validates token, deducts 1 credit, records check-in.
 */
export const checkIn = mutation({
  args: {
    sessionToken: v.string(),
    userId: v.id("users"),
    qrToken: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify the caller owns this userId
    await requireSelf(ctx, args.sessionToken, args.userId);
    // 1. Find session by QR token
    const session = await ctx.db
      .query("linedance_sessions")
      .withIndex("by_qrToken", (q) => q.eq("qrToken", args.qrToken))
      .unique();

    if (!session) {
      return { success: false, error: "Ongeldige QR-code" };
    }

    // 2. Check if QR has expired
    if (Date.now() > session.qrExpiresAt) {
      return { success: false, error: "Deze QR-code is verlopen" };
    }

    // 3. Check if user already checked in for this session
    const existingCheckin = await ctx.db
      .query("linedance_checkins")
      .withIndex("by_session_user", (q) =>
        q.eq("sessionId", session._id).eq("userId", args.userId),
      )
      .unique();

    if (existingCheckin) {
      return {
        success: false,
        error: "Je bent al ingecheckt voor deze les",
      };
    }

    // 4. Check credit balance
    const creditRecord = await ctx.db
      .query("linedance_credits")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    const balance = creditRecord?.balance ?? 0;

    if (balance < 1) {
      return {
        success: false,
        error: "Je hebt geen danskrediet meer. Koop eerst danskrediet aan.",
      };
    }

    // 5. Deduct credit
    await ctx.db.patch(creditRecord!._id, {
      balance: balance - 1,
      updatedAt: Date.now(),
    });

    // 6. Record check-in
    await ctx.db.insert("linedance_checkins", {
      userId: args.userId,
      sessionId: session._id,
      creditsDeducted: 1,
      checkedInAt: Date.now(),
    });

    return {
      success: true,
      newBalance: balance - 1,
      sessionDate: session.date,
      sessionTime: `${session.startTime} - ${session.endTime}`,
      sessionLocation: session.location,
    };
  },
});

/**
 * Get user's check-in history
 */
export const getHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const checkins = await ctx.db
      .query("linedance_checkins")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);

    const enriched = await Promise.all(
      checkins.map(async (c) => {
        const session = await ctx.db.get(c.sessionId);
        return {
          ...c,
          sessionDate: session?.date ?? "Onbekend",
          sessionTime: session
            ? `${session.startTime} - ${session.endTime}`
            : "",
          sessionLocation: session?.location ?? "",
        };
      }),
    );

    return enriched;
  },
});

/**
 * Check if user is already checked in for a session
 */
export const isCheckedIn = query({
  args: {
    userId: v.id("users"),
    sessionId: v.id("linedance_sessions"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("linedance_checkins")
      .withIndex("by_session_user", (q) =>
        q.eq("sessionId", args.sessionId).eq("userId", args.userId),
      )
      .unique();
    return !!existing;
  },
});
