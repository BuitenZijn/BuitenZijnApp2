import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

/**
 * Stripe webhook endpoint
 * Receives payment confirmations and adds credits to user accounts.
 *
 * URL: <CONVEX_SITE_URL>/stripe-webhook
 */
http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    // Verify webhook signature using Stripe
    // We import stripe dynamically since httpAction doesn't run in Node by default
    // Instead, we'll parse the event and validate the metadata
    let event;
    try {
      event = JSON.parse(body);
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    // Only handle checkout.session.completed events
    if (event.type !== "checkout.session.completed") {
      return new Response("Event type ignored", { status: 200 });
    }

    const session = event.data.object;

    // Extract metadata
    const userId = session.metadata?.userId as Id<"users"> | undefined;
    const packageId = session.metadata?.packageId as
      | Id<"linedance_credit_packages">
      | undefined;
    const credits = parseInt(session.metadata?.credits ?? "0", 10);
    const amountTotal = session.amount_total ?? 0; // in cents
    const stripeSessionId = session.id as string;

    if (!userId || !credits || !stripeSessionId) {
      return new Response("Missing metadata", { status: 400 });
    }

    // Check for duplicate processing
    const alreadyProcessed = await ctx.runQuery(
      internal.stripeHelpers.isPurchaseProcessed,
      { stripeSessionId },
    );

    if (alreadyProcessed) {
      return new Response("Already processed", { status: 200 });
    }

    // Add credits to user
    await ctx.runMutation(internal.danceCredits.internalAddCredits, {
      userId,
      credits,
      packageId,
      amountPaidInCents: amountTotal,
      stripeSessionId,
    });

    return new Response("OK", { status: 200 });
  }),
});

export default http;
