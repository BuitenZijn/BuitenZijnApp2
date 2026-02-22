"use node";

/**
 * BuitenZijn App - Password & Auth Actions
 *
 * These Convex actions run in a Node.js environment and handle:
 * - Password hashing with bcrypt
 * - Secure registration (hash + store)
 * - Secure login (verify + session)
 * - Secure password reset (hash + store)
 */
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import bcrypt from "bcryptjs";
import { Id } from "./_generated/dataModel";

const SALT_ROUNDS = 12;

// ==========================================
// PUBLIC ACTIONS (called from frontend)
// ==========================================

/**
 * Secure Register - hashes password with bcrypt, then stores user
 */
export const secureRegister = action({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Id<"users">> => {
    const passwordHash = await bcrypt.hash(args.password, SALT_ROUNDS);

    const userId: Id<"users"> = await ctx.runMutation(
      internal.auth.internalRegister,
      {
        email: args.email,
        passwordHash,
        name: args.name,
        firstName: args.firstName,
        lastName: args.lastName,
      },
    );

    return userId;
  },
});

/**
 * Secure Login - verifies password with bcrypt, then creates session
 */
export const secureLogin = action({
  args: {
    email: v.string(),
    password: v.string(),
    rememberMe: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<
    | {
        success: true;
        sessionToken: string;
        user: {
          id: string;
          email: string;
          name?: string;
          firstName?: string;
          lastName?: string;
          role: string;
          emailVerified: boolean;
        };
      }
    | { success: false; error: string }
  > => {
    const user: any = await ctx.runQuery(
      internal.auth.internalGetUserWithPassword,
      {
        email: args.email,
      },
    );

    if (!user) {
      return { success: false, error: "Ongeldig e-mailadres of wachtwoord" };
    }

    if (!user.isActive) {
      return { success: false, error: "Account is gedeactiveerd" };
    }

    // Verify password with bcrypt
    const isValid = await bcrypt.compare(args.password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: "Ongeldig e-mailadres of wachtwoord" };
    }

    // Create session
    const sessionToken: string = await ctx.runMutation(
      internal.auth.internalCreateSession,
      {
        userId: user._id,
        rememberMe: args.rememberMe,
      },
    );

    // Update last login
    await ctx.runMutation(internal.auth.internalUpdateLastLogin, {
      userId: user._id,
    });

    return {
      success: true,
      sessionToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    };
  },
});

/**
 * Secure Register with Session - hashes password, stores user, creates session
 */
export const secureRegisterWithSession = action({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<
    | { success: true; sessionToken: string; userId: Id<"users"> }
    | { success: false; error: string }
  > => {
    const passwordHash = await bcrypt.hash(args.password, SALT_ROUNDS);

    const result: any = await ctx.runMutation(
      internal.auth.internalRegisterWithSession,
      {
        email: args.email,
        passwordHash,
        name: args.name,
        firstName: args.firstName,
        lastName: args.lastName,
      },
    );

    return result;
  },
});

/**
 * Secure Reset Password - hashes new password, then stores it
 */
export const secureResetPassword = action({
  args: {
    token: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const passwordHash = await bcrypt.hash(args.newPassword, SALT_ROUNDS);

    const result: { success: boolean } = await ctx.runMutation(
      internal.auth.internalResetPassword,
      {
        token: args.token,
        newPasswordHash: passwordHash,
      },
    );

    return result;
  },
});
