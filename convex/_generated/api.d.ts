/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as authActions from "../authActions.js";
import type * as contact from "../contact.js";
import type * as creditPackages from "../creditPackages.js";
import type * as danceCheckins from "../danceCheckins.js";
import type * as danceCredits from "../danceCredits.js";
import type * as danceSessions from "../danceSessions.js";
import type * as email from "../email.js";
import type * as http from "../http.js";
import type * as knutselen from "../knutselen.js";
import type * as lijndances from "../lijndances.js";
import type * as migrateRoles from "../migrateRoles.js";
import type * as populate_knutselen from "../populate_knutselen.js";
import type * as populate_lijndances from "../populate_lijndances.js";
import type * as seedCreditPackages from "../seedCreditPackages.js";
import type * as stripe from "../stripe.js";
import type * as stripeHelpers from "../stripeHelpers.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  authActions: typeof authActions;
  contact: typeof contact;
  creditPackages: typeof creditPackages;
  danceCheckins: typeof danceCheckins;
  danceCredits: typeof danceCredits;
  danceSessions: typeof danceSessions;
  email: typeof email;
  http: typeof http;
  knutselen: typeof knutselen;
  lijndances: typeof lijndances;
  migrateRoles: typeof migrateRoles;
  populate_knutselen: typeof populate_knutselen;
  populate_lijndances: typeof populate_lijndances;
  seedCreditPackages: typeof seedCreditPackages;
  stripe: typeof stripe;
  stripeHelpers: typeof stripeHelpers;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
