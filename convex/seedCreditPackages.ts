import { mutation } from "./_generated/server";

/**
 * Seed the initial credit packages:
 * - Losse beurt: 1 credit for €6
 * - 5-beurtenkaart: 5 credits for €25
 *
 * Run with: npx convex run seedCreditPackages:seed
 */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if packages already exist
    const existing = await ctx.db.query("credit_packages").collect();
    if (existing.length > 0) {
      return { message: "Packages already exist, skipping seed" };
    }

    const now = Date.now();

    await ctx.db.insert("credit_packages", {
      name: "Losse beurt",
      credits: 1,
      priceInCents: 600,
      isActive: true,
      createdAt: now,
    });

    await ctx.db.insert("credit_packages", {
      name: "5-beurtenkaart",
      credits: 5,
      priceInCents: 2500,
      isActive: true,
      createdAt: now,
    });

    return {
      message:
        "Seeded 2 credit packages: Losse beurt (€6) and 5-beurtenkaart (€25)",
    };
  },
});
