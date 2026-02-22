import { internalMutation } from "./_generated/server";

/**
 * One-time migration: convert single `role` field to `roles` array.
 *
 * Run with: npx convex run migrateRoles:migrateRolesToArray --prod
 * (or without --prod for dev)
 */
export const migrateRolesToArray = internalMutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let migrated = 0;

    for (const user of users) {
      // Skip users that already have roles set
      if (user.roles && user.roles.length > 0) continue;

      const oldRole = (user as any).role;
      const roles = oldRole ? [oldRole] : ["member"];

      await ctx.db.patch(user._id, { roles });
      migrated++;
    }

    return { migrated, total: users.length };
  },
});
