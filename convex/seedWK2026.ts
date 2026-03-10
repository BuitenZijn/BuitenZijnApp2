import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seed WK 2026 competition and all group stage + knockout matches.
 *
 * Run via Convex dashboard: `seedWK2026:seed({ createdBy: "<admin-user-id>" })`
 */

const GROUP_MATCHES = [
  // Match 1 – Groep A
  {
    n: 1,
    date: "2026-06-11",
    localTime: "13:00",
    beTime: "21:00",
    group: "Groep A",
    home: "Mexico",
    away: "Zuid-Afrika",
    hFlag: "🇲🇽",
    aFlag: "🇿🇦",
    loc: "Mexico-Stad",
  },
  {
    n: 2,
    date: "2026-06-11",
    localTime: "20:00",
    beTime: "04:00",
    group: "Groep A",
    home: "Zuid-Korea",
    away: "Play-off D",
    hFlag: "🇰🇷",
    aFlag: "🏳️",
    loc: "Guadalajara",
  },
  // Match 3-4 – Groep B & D
  {
    n: 3,
    date: "2026-06-12",
    localTime: "15:00",
    beTime: "21:00",
    group: "Groep B",
    home: "Canada",
    away: "Play-off A",
    hFlag: "🇨🇦",
    aFlag: "🏳️",
    loc: "Toronto",
  },
  {
    n: 4,
    date: "2026-06-12",
    localTime: "18:00",
    beTime: "03:00",
    group: "Groep D",
    home: "VS",
    away: "Paraguay",
    hFlag: "🇺🇸",
    aFlag: "🇵🇾",
    loc: "Los Angeles",
  },
  // Match 7-8 – Groep C & B
  {
    n: 7,
    date: "2026-06-13",
    localTime: "18:00",
    beTime: "00:00",
    group: "Groep C",
    home: "Brazilië",
    away: "Marokko",
    hFlag: "🇧🇷",
    aFlag: "🇲🇦",
    loc: "New York/NJ",
  },
  {
    n: 8,
    date: "2026-06-13",
    localTime: "12:00",
    beTime: "21:00",
    group: "Groep B",
    home: "Qatar",
    away: "Zwitserland",
    hFlag: "🇶🇦",
    aFlag: "🇨🇭",
    loc: "San Francisco",
  },
  // Match 10-11 – Groep E & F
  {
    n: 10,
    date: "2026-06-14",
    localTime: "12:00",
    beTime: "19:00",
    group: "Groep E",
    home: "Duitsland",
    away: "Curaçao",
    hFlag: "🇩🇪",
    aFlag: "🇨🇼",
    loc: "Houston",
  },
  {
    n: 11,
    date: "2026-06-14",
    localTime: "15:00",
    beTime: "22:00",
    group: "Groep F",
    home: "Nederland",
    away: "Japan",
    hFlag: "🇳🇱",
    aFlag: "🇯🇵",
    loc: "Dallas",
  },
  // Match 14 – Groep H
  {
    n: 14,
    date: "2026-06-15",
    localTime: "12:00",
    beTime: "18:00",
    group: "Groep H",
    home: "Spanje",
    away: "Kaapverdië",
    hFlag: "🇪🇸",
    aFlag: "🇨🇻",
    loc: "Atlanta",
  },
  // Match 16 – Groep G 🇧🇪
  {
    n: 16,
    date: "2026-06-15",
    localTime: "12:00",
    beTime: "21:00",
    group: "Groep G",
    home: "België",
    away: "Egypte",
    hFlag: "🇧🇪",
    aFlag: "🇪🇬",
    loc: "Seattle",
  },
  // Match 17 – Groep I
  {
    n: 17,
    date: "2026-06-16",
    localTime: "15:00",
    beTime: "21:00",
    group: "Groep I",
    home: "Frankrijk",
    away: "Senegal",
    hFlag: "🇫🇷",
    aFlag: "🇸🇳",
    loc: "New York/NJ",
  },
  // Match 19 – Groep J
  {
    n: 19,
    date: "2026-06-16",
    localTime: "20:00",
    beTime: "03:00",
    group: "Groep J",
    home: "Argentinië",
    away: "Algerije",
    hFlag: "🇦🇷",
    aFlag: "🇩🇿",
    loc: "Kansas City",
  },
  // Match 22 – Groep L
  {
    n: 22,
    date: "2026-06-17",
    localTime: "15:00",
    beTime: "22:00",
    group: "Groep L",
    home: "Engeland",
    away: "Kroatië",
    hFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    aFlag: "🇭🇷",
    loc: "Dallas",
  },
  // Match 23 – Groep K
  {
    n: 23,
    date: "2026-06-17",
    localTime: "12:00",
    beTime: "19:00",
    group: "Groep K",
    home: "Portugal",
    away: "Play-off 1",
    hFlag: "🇵🇹",
    aFlag: "🏳️",
    loc: "Houston",
  },
  // Speeldag 2
  {
    n: 28,
    date: "2026-06-18",
    localTime: "19:00",
    beTime: "03:00",
    group: "Groep A",
    home: "Mexico",
    away: "Zuid-Korea",
    hFlag: "🇲🇽",
    aFlag: "🇰🇷",
    loc: "Guadalajara",
  },
  {
    n: 32,
    date: "2026-06-19",
    localTime: "12:00",
    beTime: "21:00",
    group: "Groep D",
    home: "VS",
    away: "Australië",
    hFlag: "🇺🇸",
    aFlag: "🇦🇺",
    loc: "Seattle",
  },
  // Match 39 – Groep G 🇧🇪 Speeldag 2
  {
    n: 39,
    date: "2026-06-21",
    localTime: "12:00",
    beTime: "21:00",
    group: "Groep G",
    home: "België",
    away: "Iran",
    hFlag: "🇧🇪",
    aFlag: "🇮🇷",
    loc: "Los Angeles",
  },
  // Match 45 – Groep L
  {
    n: 45,
    date: "2026-06-23",
    localTime: "16:00",
    beTime: "22:00",
    group: "Groep L",
    home: "Engeland",
    away: "Ghana",
    hFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    aFlag: "🇬🇭",
    loc: "Boston",
  },
  // Speeldag 3
  {
    n: 54,
    date: "2026-06-24",
    localTime: "21:00",
    beTime: "05:00",
    group: "Groep A",
    home: "Play-off D",
    away: "Mexico",
    hFlag: "🏳️",
    aFlag: "🇲🇽",
    loc: "Mexico-Stad",
  },
  {
    n: 58,
    date: "2026-06-25",
    localTime: "19:00",
    beTime: "02:00",
    group: "Groep F",
    home: "Tunesië",
    away: "Nederland",
    hFlag: "🇹🇳",
    aFlag: "🇳🇱",
    loc: "Kansas City",
  },
  {
    n: 62,
    date: "2026-06-26",
    localTime: "20:00",
    beTime: "04:00",
    group: "Groep H",
    home: "Uruguay",
    away: "Spanje",
    hFlag: "🇺🇾",
    aFlag: "🇪🇸",
    loc: "Guadalajara",
  },
  // Match 64 – Groep G 🇧🇪 Speeldag 3
  {
    n: 64,
    date: "2026-06-27",
    localTime: "20:00",
    beTime: "05:00",
    group: "Groep G",
    home: "Nw-Zeeland",
    away: "België",
    hFlag: "🇳🇿",
    aFlag: "🇧🇪",
    loc: "Vancouver",
  },
  {
    n: 68,
    date: "2026-06-27",
    localTime: "17:00",
    beTime: "23:00",
    group: "Groep L",
    home: "Panama",
    away: "Engeland",
    hFlag: "🇵🇦",
    aFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    loc: "New York/NJ",
  },
  {
    n: 72,
    date: "2026-06-27",
    localTime: "22:00",
    beTime: "05:00",
    group: "Groep J",
    home: "Jordanië",
    away: "Argentinië",
    hFlag: "🇯🇴",
    aFlag: "🇦🇷",
    loc: "Dallas",
  },
] as const;

const KNOCKOUT_MATCHES = [
  // Zestiende Finales (Round of 32)
  {
    group: "Zestiende Finales",
    dateRange: "28 juni – 3 juli",
    loc: "Alle speelsteden",
  },
  // Achtste Finales (Round of 16)
  {
    group: "Achtste Finales",
    dateRange: "4 – 7 juli",
    loc: "Mexico-Stad, Philadelphia, Vancouver",
  },
  // Kwartfinales
  {
    group: "Kwartfinales",
    dateRange: "9 – 11 juli",
    loc: "Los Angeles, Kansas City, Miami, Boston",
  },
  // Halve Finales
  { group: "Halve Finales", dateRange: "14 & 15 juli", loc: "Dallas, Atlanta" },
  // Troostfinale
  { group: "Troostfinale", dateRange: "18 juli", loc: "Miami" },
  // Finale
  {
    group: "Finale",
    dateRange: "19 juli",
    loc: "New York/NJ (MetLife Stadium)",
  },
] as const;

export const cleanup = mutation({
  args: {},
  handler: async (ctx) => {
    const comp = await ctx.db
      .query("prono_competitions")
      .filter((q) => q.eq(q.field("name"), "WK 2026"))
      .first();
    if (!comp) throw new Error("WK 2026 not found");

    // Delete predictions for matches in this competition
    const matches = await ctx.db
      .query("prono_matches")
      .withIndex("by_competition", (q) => q.eq("competitionId", comp._id))
      .collect();

    for (const match of matches) {
      const preds = await ctx.db
        .query("prono_predictions")
        .withIndex("by_match", (q) => q.eq("matchId", match._id))
        .collect();
      for (const pred of preds) await ctx.db.delete(pred._id);
      await ctx.db.delete(match._id);
    }

    // Delete leaderboard entries
    const leaderboard = await ctx.db
      .query("prono_leaderboard")
      .withIndex("by_competition", (q) => q.eq("competitionId", comp._id))
      .collect();
    for (const entry of leaderboard) await ctx.db.delete(entry._id);

    await ctx.db.delete(comp._id);
    return { deleted: true, matchesRemoved: matches.length };
  },
});

export const seed = mutation({
  args: {
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if WK 2026 competition already exists
    const existing = await ctx.db
      .query("prono_competitions")
      .filter((q) => q.eq(q.field("name"), "WK 2026"))
      .first();

    if (existing) {
      throw new Error(
        "WK 2026 competition already exists. Delete it first if you want to re-seed.",
      );
    }

    // Create competition
    const competitionId = await ctx.db.insert("prono_competitions", {
      name: "WK 2026",
      description:
        "FIFA Wereldkampioenschap 2026 – Verenigde Staten, Mexico & Canada",
      emoji: "🏆",
      isActive: true,
      startDate: "2026-06-11",
      endDate: "2026-07-19",
      createdBy: args.createdBy,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Insert all group stage matches
    for (const m of GROUP_MATCHES) {
      await ctx.db.insert("prono_matches", {
        competitionId,
        matchNumber: m.n,
        homeTeam: m.home,
        awayTeam: m.away,
        homeFlag: m.hFlag,
        awayFlag: m.aFlag,
        matchDate: m.date,
        matchTime: m.localTime,
        belgianTime: m.beTime,
        location: m.loc,
        group: m.group,
        isFinished: false,
        pointsExact: 5,
        pointsResult: 2,
        pointsGoalDiff: 1,
        createdAt: Date.now(),
      });
    }

    // Insert placeholder knockout round info (matches TBD after group stage)
    // These are placeholders – admins will fill in teams when known
    const knockoutDates: Record<string, string> = {
      "Zestiende Finales": "2026-06-28",
      "Achtste Finales": "2026-07-04",
      Kwartfinales: "2026-07-09",
      "Halve Finales": "2026-07-14",
      Troostfinale: "2026-07-18",
      Finale: "2026-07-19",
    };

    const knockoutPoints: Record<
      string,
      { exact: number; result: number; goalDiff: number }
    > = {
      "Zestiende Finales": { exact: 5, result: 2, goalDiff: 1 },
      "Achtste Finales": { exact: 6, result: 3, goalDiff: 1 },
      Kwartfinales: { exact: 8, result: 4, goalDiff: 2 },
      "Halve Finales": { exact: 10, result: 5, goalDiff: 2 },
      Troostfinale: { exact: 8, result: 4, goalDiff: 2 },
      Finale: { exact: 15, result: 7, goalDiff: 3 },
    };

    for (const ko of KNOCKOUT_MATCHES) {
      const pts = knockoutPoints[ko.group]!;
      await ctx.db.insert("prono_matches", {
        competitionId,
        homeTeam: "NNB",
        awayTeam: "NNB",
        homeFlag: "🏳️",
        awayFlag: "🏳️",
        matchDate: knockoutDates[ko.group]!,
        location: ko.loc,
        group: ko.group,
        isFinished: false,
        pointsExact: pts.exact,
        pointsResult: pts.result,
        pointsGoalDiff: pts.goalDiff,
        createdAt: Date.now(),
      });
    }

    return {
      competitionId,
      groupMatchesInserted: GROUP_MATCHES.length,
      knockoutPlaceholders: KNOCKOUT_MATCHES.length,
    };
  },
});
