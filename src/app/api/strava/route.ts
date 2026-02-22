import { NextResponse } from "next/server";

/**
 * Strava API Route
 *
 * Fetches club activities from the BuitenZijn Strava account.
 * Uses OAuth2 with a refresh token to get a fresh access token each time.
 *
 * Required environment variables:
 *   STRAVA_CLIENT_ID      - Your Strava API application Client ID
 *   STRAVA_CLIENT_SECRET   - Your Strava API application Client Secret
 *   STRAVA_REFRESH_TOKEN   - A refresh token obtained via OAuth2 authorization
 *   STRAVA_CLUB_ID         - The numeric Strava Club ID (optional, falls back to athlete activities)
 */

interface StravaTokenResponse {
  access_token: string;
  expires_at: number;
  refresh_token: string;
  token_type: string;
}

// In-memory token cache
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() / 1000 + 60) {
    return cachedToken.token;
  }

  const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN } =
    process.env;

  if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_REFRESH_TOKEN) {
    throw new Error("Strava credentials not configured");
  }

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      refresh_token: STRAVA_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to refresh Strava token: ${res.status}`);
  }

  const data: StravaTokenResponse = await res.json();

  cachedToken = {
    token: data.access_token,
    expiresAt: data.expires_at,
  };

  return data.access_token;
}

export async function GET() {
  try {
    const accessToken = await getAccessToken();
    const clubId = process.env.STRAVA_CLUB_ID;

    let url: string;
    if (clubId) {
      // Fetch club activities
      url = `https://www.strava.com/api/v3/clubs/${clubId}/activities?per_page=30`;
    } else {
      // Fallback: fetch athlete's own activities (Ride type only)
      url =
        "https://www.strava.com/api/v3/athlete/activities?per_page=30&type=Ride";
    }

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 600 }, // Cache for 10 minutes
    });

    if (!res.ok) {
      throw new Error(`Strava API error: ${res.status}`);
    }

    const activities = await res.json();

    // Filter to Ride activities only (in case of mixed types)
    const rides = Array.isArray(activities)
      ? activities.filter(
          (a: { type?: string; sport_type?: string }) =>
            a.type === "Ride" || a.sport_type === "Ride",
        )
      : [];

    return NextResponse.json(
      { activities: rides },
      {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("Strava API error:", error);
    return NextResponse.json(
      {
        error: "Could not fetch Strava activities",
        activities: [],
      },
      { status: 500 },
    );
  }
}
