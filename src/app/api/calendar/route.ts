import { NextResponse } from "next/server";

const ICAL_URL =
  "https://calendar.google.com/calendar/ical/9ef0a6fbfc25f5fcdd5b23ed3afd9cc245f3b2d67e6398d88ab3b1be27a80d02%40group.calendar.google.com/private-072b47e44bb5fc643946ccb35de02102/basic.ics";

interface CalendarEvent {
  summary: string;
  description: string;
  location: string;
  start: string;
  end: string;
  uid: string;
}

function parseICS(icsText: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const vevents = icsText.split("BEGIN:VEVENT");

  for (let i = 1; i < vevents.length; i++) {
    const block = vevents[i].split("END:VEVENT")[0];

    const get = (key: string): string => {
      // Handle folded lines (lines that start with a space are continuations)
      const unfolded = block.replace(/\r?\n[ \t]/g, "");
      const regex = new RegExp(`^${key}[^:]*:(.*)$`, "m");
      const match = unfolded.match(regex);
      return match
        ? match[1]
            .trim()
            .replace(/\\n/g, "\n")
            .replace(/\\,/g, ",")
            .replace(/\\\\/g, "\\")
        : "";
    };

    const parseDate = (raw: string): string => {
      if (!raw) return "";
      // Format: 20260301T140000Z or 20260301
      const clean = raw.replace(/[^0-9T]/g, "");
      if (clean.length >= 8) {
        const y = clean.slice(0, 4);
        const m = clean.slice(4, 6);
        const d = clean.slice(6, 8);
        const h = clean.length >= 11 ? clean.slice(9, 11) : "00";
        const min = clean.length >= 13 ? clean.slice(11, 13) : "00";
        return `${y}-${m}-${d}T${h}:${min}:00Z`;
      }
      return raw;
    };

    events.push({
      summary: get("SUMMARY"),
      description: get("DESCRIPTION"),
      location: get("LOCATION"),
      start: parseDate(get("DTSTART")),
      end: parseDate(get("DTEND")),
      uid: get("UID"),
    });
  }

  return events;
}

export async function GET() {
  try {
    const res = await fetch(ICAL_URL, {
      next: { revalidate: 600 }, // cache 10 min
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch calendar" },
        { status: 502 },
      );
    }

    const icsText = await res.text();
    const events = parseICS(icsText);

    // Filter to upcoming events (today and future), sorted by start date
    const now = new Date().toISOString();
    const upcoming = events
      .filter((e) => e.start >= now && e.summary)
      .sort((a, b) => a.start.localeCompare(b.start))
      .slice(0, 6);

    return NextResponse.json({ events: upcoming });
  } catch {
    return NextResponse.json(
      { error: "Failed to load calendar events" },
      { status: 500 },
    );
  }
}
