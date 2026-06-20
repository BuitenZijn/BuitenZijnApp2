/**
 * Shared auth utilities for Convex mutations and queries.
 * Use requireAdmin / requireSelf to protect sensitive handlers.
 */
import { Id } from "./_generated/dataModel";

// Minimal subset of ctx needed by helpers
// Using `any` for the table parameter so this works with both
// GenericQueryCtx and GenericMutationCtx without re-exporting DataModel.
type DbCtx = {
  db: {
    query: (table: any) => any;
    get: (id: any) => Promise<any>;
  };
};

/**
 * Validates a session token and returns the authenticated user.
 * Throws if the token is missing, expired, or the user is inactive.
 */
export async function getAuthenticatedUser(ctx: DbCtx, sessionToken: string) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", sessionToken))
    .first();

  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Niet ingelogd of sessie verlopen");
  }

  const user = await ctx.db.get(session.userId);
  if (!user || !user.isActive) {
    throw new Error("Account niet actief");
  }

  return user as {
    _id: Id<"users">;
    email: string;
    roles?: string[];
    role?: string;
    isActive: boolean;
    [key: string]: any;
  };
}

/**
 * Validates the session and asserts the user has the admin role.
 * Throws otherwise.
 */
export async function requireAdmin(ctx: DbCtx, sessionToken: string) {
  const user = await getAuthenticatedUser(ctx, sessionToken);
  const roles: string[] = user.roles ?? (user.role ? [user.role] : ["member"]);
  if (!roles.includes("admin")) {
    throw new Error("Geen toegang: admin rechten vereist");
  }
  return user;
}

/**
 * Validates the session and asserts the authenticated user's id matches
 * the given userId (i.e. the user can only act on their own data).
 */
export async function requireSelf(
  ctx: DbCtx,
  sessionToken: string,
  userId: Id<"users">,
) {
  const user = await getAuthenticatedUser(ctx, sessionToken);
  // Admins may also act on behalf of any user
  const roles: string[] = user.roles ?? (user.role ? [user.role] : ["member"]);
  if (user._id !== userId && !roles.includes("admin")) {
    throw new Error("Geen toegang: je kan alleen je eigen gegevens wijzigen");
  }
  return user;
}
