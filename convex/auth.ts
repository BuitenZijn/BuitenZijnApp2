import {
  mutation,
  query,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

/**
 * BuitenZijn App - Authentication Functions
 *
 * Backend functions for user authentication.
 * Password hashing is handled by bcrypt in authActions.ts (Node.js runtime).
 */

// ==========================================
// QUERIES
// ==========================================

/**
 * Get user by email
 */
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) return null;

    // Don't return password hash
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
});

/**
 * Get user by ID
 */
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) return null;

    // Don't return password hash
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
});

/**
 * Validate session token
 */
export const validateSession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session) return null;

    // Check if expired
    if (session.expiresAt < Date.now()) {
      return null;
    }

    // Get user
    const user = await ctx.db.get(session.userId);
    if (!user || !user.isActive) return null;

    // Don't return password hash
    const { passwordHash, ...userWithoutPassword } = user;
    return { session, user: userWithoutPassword };
  },
});

// ==========================================
// MUTATIONS
// ==========================================

/**
 * Register a new user
 */
export const register = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    name: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase();

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const now = Date.now();

    // Create user
    const userId = await ctx.db.insert("users", {
      email,
      passwordHash: args.passwordHash,
      emailVerified: false,
      name: args.name,
      firstName: args.firstName,
      lastName: args.lastName,
      role: "member",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

/**
 * Create email verification token and send verification email
 */
export const createEmailVerificationToken = mutation({
  args: {
    userId: v.id("users"),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours

    // Get user to send email
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.insert("emailVerificationTokens", {
      userId: args.userId,
      token: args.token,
      expiresAt,
      used: false,
      createdAt: now,
    });

    // Schedule email to be sent
    await ctx.scheduler.runAfter(0, internal.email.sendVerificationEmail, {
      to: user.email,
      token: args.token,
    });
  },
});

/**
 * Verify email with token
 */
export const verifyEmail = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const tokenDoc = await ctx.db
      .query("emailVerificationTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!tokenDoc) {
      throw new Error("Invalid verification token");
    }

    if (tokenDoc.used) {
      throw new Error("Token has already been used");
    }

    if (tokenDoc.expiresAt < Date.now()) {
      throw new Error("Token has expired");
    }

    // Mark token as used
    await ctx.db.patch(tokenDoc._id, { used: true });

    // Verify user's email
    await ctx.db.patch(tokenDoc.userId, {
      emailVerified: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Create password reset token and send reset email
 */
export const createPasswordResetToken = mutation({
  args: {
    email: v.string(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase();
    const now = Date.now();
    const expiresAt = now + 60 * 60 * 1000; // 1 hour

    await ctx.db.insert("passwordResetTokens", {
      email,
      token: args.token,
      expiresAt,
      used: false,
      createdAt: now,
    });

    // Schedule email to be sent
    await ctx.scheduler.runAfter(0, internal.email.sendPasswordResetEmail, {
      to: email,
      token: args.token,
    });
  },
});

/**
 * Reset password with token
 */
export const resetPassword = mutation({
  args: {
    token: v.string(),
    newPasswordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const tokenDoc = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!tokenDoc) {
      throw new Error("Invalid reset token");
    }

    if (tokenDoc.used) {
      throw new Error("Token has already been used");
    }

    if (tokenDoc.expiresAt < Date.now()) {
      throw new Error("Token has expired");
    }

    // Find user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", tokenDoc.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Mark token as used
    await ctx.db.patch(tokenDoc._id, { used: true });

    // Update password
    await ctx.db.patch(user._id, {
      passwordHash: args.newPasswordHash,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Create session
 */
export const createSession = mutation({
  args: {
    userId: v.id("users"),
    token: v.string(),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    rememberMe: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    // 30 days if remember me, otherwise 24 hours
    const expiresAt = args.rememberMe
      ? now + 30 * 24 * 60 * 60 * 1000
      : now + 24 * 60 * 60 * 1000;

    const sessionId = await ctx.db.insert("sessions", {
      userId: args.userId,
      token: args.token,
      expiresAt,
      userAgent: args.userAgent,
      ipAddress: args.ipAddress,
      createdAt: now,
      lastActiveAt: now,
    });

    // Update user's last login
    await ctx.db.patch(args.userId, {
      lastLoginAt: now,
      updatedAt: now,
    });

    return sessionId;
  },
});

/**
 * Delete session (logout)
 */
export const deleteSession = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return { success: true };
  },
});

/**
 * Login - verify credentials and create session
 */
export const login = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase();

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    if (!user.isActive) {
      return { success: false, error: "Account is deactivated" };
    }

    // Compare password (in production use proper bcrypt comparison via an action)
    if (user.passwordHash !== args.passwordHash) {
      return { success: false, error: "Invalid email or password" };
    }

    // Create session token
    const token = generateToken();
    const now = Date.now();
    const expiresAt = now + 30 * 24 * 60 * 60 * 1000; // 30 days

    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt,
      createdAt: now,
      lastActiveAt: now,
    });

    // Update last login
    await ctx.db.patch(user._id, {
      lastLoginAt: now,
      updatedAt: now,
    });

    return { success: true, sessionToken: token };
  },
});

/**
 * Logout - delete session by token
 */
export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return { success: true };
  },
});

/**
 * Request password reset - creates a token and sends reset email
 */
export const requestPasswordReset = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase();
    const now = Date.now();
    const expiresAt = now + 60 * 60 * 1000; // 1 hour
    const token = generateToken();

    // Always succeed (don't reveal if email exists)
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (user) {
      await ctx.db.insert("passwordResetTokens", {
        email,
        token,
        expiresAt,
        used: false,
        createdAt: now,
      });

      // Schedule email to be sent
      await ctx.scheduler.runAfter(0, internal.email.sendPasswordResetEmail, {
        to: email,
        token,
      });
    }

    return { success: true };
  },
});

/**
 * Register and create session
 */
export const registerWithSession = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    name: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase();

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingUser) {
      return { success: false, error: "User with this email already exists" };
    }

    const now = Date.now();

    const userId = await ctx.db.insert("users", {
      email,
      passwordHash: args.passwordHash,
      emailVerified: false,
      name: args.name,
      firstName: args.firstName,
      lastName: args.lastName,
      role: "member",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // Create session
    const token = generateToken();
    const expiresAt = now + 30 * 24 * 60 * 60 * 1000; // 30 days

    await ctx.db.insert("sessions", {
      userId,
      token,
      expiresAt,
      createdAt: now,
      lastActiveAt: now,
    });

    return { success: true, sessionToken: token };
  },
});

/** Generate a random token */
function generateToken(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Update session activity
 */
export const updateSessionActivity = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.patch(session._id, {
        lastActiveAt: Date.now(),
      });
    }
  },
});

// ==========================================
// INTERNAL FUNCTIONS (called by authActions.ts)
// ==========================================

/**
 * Internal: Get user with password hash (for login verification)
 */
export const internalGetUserWithPassword = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
    return user; // includes passwordHash
  },
});

/**
 * Internal: Register user (with pre-hashed password)
 */
export const internalRegister = internalMutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    name: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase();

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingUser) {
      throw new Error("Er bestaat al een account met dit e-mailadres");
    }

    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      email,
      passwordHash: args.passwordHash,
      emailVerified: false,
      name: args.name,
      firstName: args.firstName,
      lastName: args.lastName,
      role: "member",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

/**
 * Internal: Register with session (with pre-hashed password)
 */
export const internalRegisterWithSession = internalMutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    name: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase();

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingUser) {
      return {
        success: false as const,
        error: "Er bestaat al een account met dit e-mailadres",
      };
    }

    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      email,
      passwordHash: args.passwordHash,
      emailVerified: false,
      name: args.name,
      firstName: args.firstName,
      lastName: args.lastName,
      role: "member",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const token = generateToken();
    const expiresAt = now + 30 * 24 * 60 * 60 * 1000;

    await ctx.db.insert("sessions", {
      userId,
      token,
      expiresAt,
      createdAt: now,
      lastActiveAt: now,
    });

    return { success: true as const, sessionToken: token, userId };
  },
});

/**
 * Internal: Create session (called after password verification)
 */
export const internalCreateSession = internalMutation({
  args: {
    userId: v.id("users"),
    rememberMe: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = args.rememberMe
      ? now + 30 * 24 * 60 * 60 * 1000 // 30 days
      : now + 24 * 60 * 60 * 1000; // 24 hours

    const token = generateToken();

    await ctx.db.insert("sessions", {
      userId: args.userId,
      token,
      expiresAt,
      createdAt: now,
      lastActiveAt: now,
    });

    return token;
  },
});

/**
 * Internal: Update last login timestamp
 */
export const internalUpdateLastLogin = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.userId, {
      lastLoginAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Internal: Reset password (with pre-hashed password)
 */
export const internalResetPassword = internalMutation({
  args: {
    token: v.string(),
    newPasswordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const tokenDoc = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!tokenDoc) {
      throw new Error("Ongeldige reset link");
    }
    if (tokenDoc.used) {
      throw new Error("Deze link is al gebruikt");
    }
    if (tokenDoc.expiresAt < Date.now()) {
      throw new Error("Deze link is verlopen");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", tokenDoc.email))
      .first();

    if (!user) {
      throw new Error("Gebruiker niet gevonden");
    }

    await ctx.db.patch(tokenDoc._id, { used: true });
    await ctx.db.patch(user._id, {
      passwordHash: args.newPasswordHash,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
