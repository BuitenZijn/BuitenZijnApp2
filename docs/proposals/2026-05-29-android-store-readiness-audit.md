# Android Play Store Readiness Audit

**Date:** 2026-05-29  
**Scope:** `mobile/` app + `convex/` backend  
**Goal:** Identify issues before publishing to the Google Play Store

---

## Summary

The app structure is solid and the auth flow (bcrypt hashing, SecureStore token storage) is well-implemented. However, there are **two critical security vulnerabilities** in the backend that must be fixed before going live, several missing Play Store requirements, and a handful of medium-priority issues.

---

## 🔴 CRITICAL — Fix Before Any Public Release

### 1. Stripe Webhook Signature is Never Verified

**File:** `convex/http.ts`

The webhook reads the `stripe-signature` header but then discards it and just calls `JSON.parse(body)`. This means **anyone on the internet can POST a fake `checkout.session.completed` event** to the webhook endpoint and get free credits added to any account.

```ts
// CURRENT (broken):
let event;
try {
  event = JSON.parse(body);  // ← raw parse, no verification
} catch { ... }
```

The comment in the code even acknowledges this:

> "Instead, we'll parse the event and validate the metadata" — this is **not** validation.

**Fix:** The `httpAction` runtime does not support Node.js, so `stripe.constructEvent()` can't be called directly. The correct approach is to forward the raw body + signature to a dedicated `"use node"` action and verify it there.

```ts
// In http.ts — forward to node action for verification:
const result = await ctx.runAction(internal.stripe.verifyAndProcessWebhook, {
  body,
  signature: signature ?? "",
});
```

```ts
// In stripe.ts — add a "use node" action:
export const verifyAndProcessWebhook = internalAction({
  args: { body: v.string(), signature: v.string() },
  handler: async (ctx, args) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    let event;
    try {
      event = stripe.constructEvent(
        args.body,
        args.signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err) {
      throw new Error("Invalid Stripe signature");
    }
    // ... rest of processing
  },
});
```

---

### 2. No Server-Side Authorization on Mutations — Admin Actions Unprotected

**Files:** `convex/danceSessions.ts`, `convex/users.ts`, `convex/danceCheckins.ts`

The backend has **zero role checks**. The UI does a client-side `isAdmin` check, but any API client (curl, Postman, another app) can call these mutations directly:

| Mutation / Query                            | Risk                                                                       |
| ------------------------------------------- | -------------------------------------------------------------------------- |
| `danceSessions.create`                      | Any user can create dance sessions                                         |
| `danceSessions.regenerateQr`                | Any user can invalidate QR codes                                           |
| `danceSessions.getAttendees`                | Any user can read full attendance lists with emails                        |
| `users.listUsers`                           | Any authenticated user can dump all user emails/phones                     |
| `users.updateProfile(userId, ...)`          | Any user can overwrite **another** user's profile                          |
| `danceCheckins.checkIn(userId, ...)`        | Any user can check in **as** another user, deducting that person's credits |
| `stripe.createCheckoutSession(userId, ...)` | Any user can create a payment session attributed to another user           |

**Fix pattern for admin-only mutations:**

```ts
// In convex/danceSessions.ts
export const create = mutation({
  args: { ... },
  handler: async (ctx, args) => {
    // Get session token from context — requires passing token from client
    // OR use Convex auth identity if you migrate to convex/auth
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", q => q.eq("token", args.sessionToken))
      .first();
    if (!session) throw new Error("Unauthorized");
    const user = await ctx.db.get(session.userId);
    if (!user?.roles?.includes("admin")) throw new Error("Forbidden");
    // ... rest of handler
  },
});
```

**Fix pattern for ownership-gated mutations (e.g., `updateProfile`, `checkIn`):**
Pass the session token and verify the token's `userId` matches the target `userId` before allowing the operation.

> **Note:** The cleanest long-term fix is to migrate to Convex's first-party auth (`convex/auth`) which provides `ctx.auth.getUserIdentity()` in every function. This eliminates the need to pass tokens manually.

---

## 🟠 HIGH — Fix Before Play Store Submission

### 3. QR Token Uses `Math.random()` (Not Cryptographically Secure)

**File:** `convex/danceSessions.ts` — `generateToken()`

```ts
result += chars.charAt(Math.floor(Math.random() * chars.length));
```

`Math.random()` is a pseudo-random number generator, not cryptographically secure. A motivated attacker could predict QR tokens.

**Fix:** Use the Node.js `crypto` module (available in `"use node"` actions, or use `crypto.getRandomValues` in the standard runtime):

```ts
import { randomBytes } from "crypto"; // only in "use node" context
function generateToken(): string {
  return randomBytes(24).toString("base64url");
}
```

For non-Node Convex mutations, use the Web Crypto API:

```ts
function generateToken(): string {
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}
```

---

### 4. `mobile/.gitignore` Does Not Ignore `.env`

**File:** `mobile/.gitignore`

The mobile gitignore only has `.env*.local`. If the `mobile/` folder is ever used as a standalone repo or the root `.gitignore` doesn't cascade properly, `mobile/.env` (which contains the Convex URL) would be committed.

The root `.gitignore` has `.env*` which covers it today, but it's a latent risk.

**Fix:** Add `.env` to `mobile/.gitignore`:

```
# local env files
.env
.env*.local
```

---

### 5. Convex URL Hardcoded in `app.json`

**File:** `mobile/app.json`

```json
"extra": {
  "convexUrl": "https://energetic-kudu-185.convex.cloud"
}
```

This URL is baked into the APK bundle and visible to anyone who decompiles the app. While `EXPO_PUBLIC_` variables are intentionally public, having the deployment URL hardcoded in two places (`.env` and `app.json`) creates drift and makes environment management harder.

**Fix:** Remove the `extra.convexUrl` field from `app.json` and rely solely on `EXPO_PUBLIC_CONVEX_URL` from the `.env` file (the `ConvexProvider.tsx` already has a fallback chain that handles this).

---

## 🟡 MEDIUM — Should Fix Before or Shortly After Launch

### 6. Missing Android `versionCode` in `app.json`

The Play Store requires an integer `versionCode` that increments with every release.

**Fix:**

```json
"android": {
  "package": "com.buitenzijn.app",
  "versionCode": 1,
  "adaptiveIcon": { ... }
}
```

### 7. Missing Android Permissions Declaration in `app.json`

The app uses `expo-camera` for QR scanning. This requires the `CAMERA` permission to be declared.

**Fix:**

```json
"android": {
  "permissions": ["android.permission.CAMERA"]
}
```

Without this, the QR scanner screen will silently fail on some Android devices.

### 8. Misleading Comment in `LoginScreen.tsx`

**File:** `mobile/src/screens/auth/LoginScreen.tsx` line 43:

```ts
// In production, hash the password properly before sending
```

This is **incorrect guidance**. Passwords are sent over TLS to Convex and hashed server-side with bcrypt (SALT_ROUNDS=12), which is the correct approach. Hashing client-side before sending would be a security anti-pattern (it would make the hash itself the credential).

**Fix:** Remove or replace the comment:

```ts
// Password is hashed server-side with bcrypt (see authActions.ts)
```

### 9. `EMAIL_TEST_MODE` Must Not Be `true` in Production

**File:** `convex/email.ts`

If `EMAIL_TEST_MODE=true` is set in the Convex production environment, email verification and password reset emails will never be sent — they'll just be logged to the console.

**Fix:** Verify this is `false` or unset in the Convex production dashboard under **Environment Variables**.

### 10. Password Minimum Length Inconsistency

- `LoginScreen.tsx` rejects passwords shorter than **6** characters
- `RegisterScreen.tsx` requires at least **8** characters

A user who registered through the web app with a 7-character password would be blocked from logging in on mobile.

**Fix:** Align both screens to 8 characters minimum (matching registration).

---

## 🔵 LOW / Play Store Process Steps

### 11. Required Assets

Check these exist and meet Play Store requirements:

| Asset                    | Required Size      | File                                      |
| ------------------------ | ------------------ | ----------------------------------------- |
| App Icon                 | 512×512 px PNG     | `assets/icon.png`                         |
| Adaptive Icon Foreground | 1024×1024 px PNG   | `assets/adaptive-icon.png`                |
| Feature Graphic          | 1024×500 px        | (missing — needed for Play Store listing) |
| Splash Screen            | At least 1242×2436 | `assets/splash-icon.png`                  |

### 12. Privacy Policy Required

The app collects: email, name, phone number, location data (check-in times). Google Play **requires** a privacy policy URL if any personal data is collected.

**Action:** Write a privacy policy page (can be a simple page on `buitenzijnvzw.be`) and link it in the Play Store listing.

### 13. Data Safety Form (Play Console)

When submitting to the Play Store, you must fill out the **Data Safety** section. Based on the app:

- **Data collected:** Email address, Name, Phone number
- **Data shared:** Payment info (via Stripe, external)
- **Encryption in transit:** Yes (HTTPS/WSS to Convex)
- **Users can request deletion:** Must provide a mechanism

### 14. Target SDK / Permissions Review

Expo SDK 55 targets a recent Android API level. Verify in `eas.json` or `app.json` that `android.targetSdkVersion` meets Play Store's minimum (currently API 34 as of 2024).

---

## Play Store Submission Checklist

```
PRE-SUBMISSION (must complete):
[ ] Fix Stripe webhook signature verification (Critical #1)
[ ] Add server-side role checks to admin mutations (Critical #2)
[ ] Replace Math.random() with crypto.getRandomValues() in QR generation
[ ] Add .env to mobile/.gitignore
[ ] Add android.versionCode to app.json
[ ] Add android.permissions (CAMERA) to app.json
[ ] Verify EMAIL_TEST_MODE is not true in Convex production env
[ ] Align login/register password minimum length to 8 chars
[ ] Create a feature graphic (1024×500 px)
[ ] Write and publish a Privacy Policy

PLAY CONSOLE SETUP:
[ ] Create a Google Play Developer account ($25 one-time fee)
[ ] Create the app listing in Play Console
[ ] Fill out the Data Safety questionnaire
[ ] Set content rating (PEGI or equivalent)
[ ] Set up a closed/internal test track first (recommended)

BUILD & DEPLOY:
[ ] Run: eas build --platform android --profile production
[ ] This produces an .aab (Android App Bundle) — upload this to Play Console
[ ] Set release notes (what's new)
[ ] Submit for review (typically 1-3 days for first submission)
```

---

## Notes on What's Done Well

- **Password hashing**: bcrypt with SALT_ROUNDS=12 on the server ✅
- **Session storage**: `expo-secure-store` (not AsyncStorage) for tokens ✅
- **Password not returned**: `passwordHash` is stripped from all query responses ✅
- **Session expiry**: Sessions have `expiresAt` and are validated on every load ✅
- **Account deactivation**: `isActive` check in login flow ✅
- **Stripe integration**: Checkout sessions use server-side actions (not client-side keys) ✅
- **Duplicate payment protection**: `isPurchaseProcessed` check prevents double-crediting ✅
