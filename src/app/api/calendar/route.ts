import { NextResponse } from "next/server";
import { RRule, rrulestr } from "rrule";

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

interface ParsedVEvent {
  summary: string;
  description: string;
  location: string;
  dtstart: string;
  dtend: string;
  uid: string;
  rrule: string;
  exdates: string[];
  duration: number; // milliseconds between start and end
}

/**
 * Parse an ICS date string into a Date object.
 * Handles formats: 20260301T140000Z, 20260301T140000, 20260301
 */
function parseICSDate(raw: string): Date | null {
  if (!raw) return null;
  const clean = raw.replace(/[^0-9T]/g, "");
  if (clean.length >= 8) {
    const y = parseInt(clean.slice(0, 4));
    const m = parseInt(clean.slice(4, 6)) - 1;
    const d = parseInt(clean.slice(6, 8));
    const h = clean.length >= 11 ? parseInt(clean.slice(9, 11)) : 0;
    const min = clean.length >= 13 ? parseInt(clean.slice(11, 13)) : 0;
    const s = clean.length >= 15 ? parseInt(clean.slice(13, 15)) : 0;
    // If the original string ends with Z, treat as UTC
    if (raw.endsWith("Z")) {
      return new Date(Date.UTC(y, m, d, h, min, s));
    }
    // Non-UTC: treat as Europe/Brussels local time.
    // Compute the Brussels→UTC offset for this datetime by checking
    // what Brussels would display for the same numbers interpreted as UTC.
    const guessUTC = new Date(Date.UTC(y, m, d, h, min, s));
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Brussels",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).formatToParts(guessUTC);
    const brusselsH = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
    const brusselsMin = Number(
      parts.find((p) => p.type === "minute")?.value ?? 0,
    );
    let offsetMs = (brusselsH * 60 + brusselsMin - (h * 60 + min)) * 60 * 1000;
    if (offsetMs > 12 * 3600000) offsetMs -= 24 * 3600000;
    if (offsetMs < -12 * 3600000) offsetMs += 24 * 3600000;
    // Input is Brussels local → UTC = guessUTC − offset
    return new Date(guessUTC.getTime() - offsetMs);
  }
  return null;
}

function formatDateISO(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function parseVEvents(icsText: string): ParsedVEvent[] {
  const vevents: ParsedVEvent[] = [];
  const blocks = icsText.split("BEGIN:VEVENT");

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].split("END:VEVENT")[0];
    // Unfold continuation lines (RFC 5545: lines starting with space/tab)
    const unfolded = block.replace(/\r?\n[ \t]/g, "");

    const get = (key: string): string => {
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

    const getRRule = (): string => {
      const match = unfolded.match(/^RRULE:(.*)$/m);
      return match ? match[1].trim() : "";
    };

    const getExDates = (): string[] => {
      const dates: string[] = [];
      const regex = /^EXDATE[^:]*:(.*)$/gm;
      let match;
      while ((match = regex.exec(unfolded)) !== null) {
        // EXDATE can contain comma-separated dates
        match[1]
          .trim()
          .split(",")
          .forEach((d) => dates.push(d.trim()));
      }
      return dates;
    };

    const dtstart = get("DTSTART");
    const dtend = get("DTEND");
    const startDate = parseICSDate(dtstart);
    const endDate = parseICSDate(dtend);
    const duration =
      startDate && endDate ? endDate.getTime() - startDate.getTime() : 0;

    vevents.push({
      summary: get("SUMMARY"),
      description: get("DESCRIPTION"),
      location: get("LOCATION"),
      dtstart,
      dtend,
      uid: get("UID"),
      rrule: getRRule(),
      exdates: getExDates(),
      duration,
    });
  }

  return vevents;
}

/**
 * Expand recurring events into individual occurrences within a time window.
 */
function expandEvents(
  vevents: ParsedVEvent[],
  windowStart: Date,
  windowEnd: Date,
): CalendarEvent[] {
  const allEvents: CalendarEvent[] = [];

  for (const vevent of vevents) {
    if (!vevent.summary) continue;

    const startDate = parseICSDate(vevent.dtstart);
    if (!startDate) continue;

    if (!vevent.rrule) {
      // Non-recurring event: only include if it falls within the window
      if (startDate >= windowStart && startDate <= windowEnd) {
        allEvents.push({
          summary: vevent.summary,
          description: vevent.description,
          location: vevent.location,
          start: formatDateISO(startDate),
          end: parseICSDate(vevent.dtend)
            ? formatDateISO(parseICSDate(vevent.dtend)!)
            : "",
          uid: vevent.uid,
        });
      }
      continue;
    }

    // Recurring event: expand using rrule
    try {
      // Build the RRULE with DTSTART for rrulestr
      const rruleString = `DTSTART:${vevent.dtstart.replace(/[^0-9TZ]/g, "")}\nRRULE:${vevent.rrule}`;
      const rule = rrulestr(rruleString, { forceset: false });

      // Parse exception dates
      const exdateSet = new Set<string>();
      for (const exd of vevent.exdates) {
        const exDate = parseICSDate(exd);
        if (exDate) exdateSet.add(exDate.toISOString());
      }

      // Get occurrences within our window
      const occurrences = rule.between(windowStart, windowEnd, true);

      for (const occurrence of occurrences) {
        // Skip exception dates
        if (exdateSet.has(occurrence.toISOString())) continue;

        const occEnd = new Date(occurrence.getTime() + vevent.duration);

        allEvents.push({
          summary: vevent.summary,
          description: vevent.description,
          location: vevent.location,
          start: formatDateISO(occurrence),
          end: formatDateISO(occEnd),
          uid: `${vevent.uid}_${occurrence.toISOString()}`,
        });
      }
    } catch {
      // If RRULE parsing fails, fall back to the single original event
      allEvents.push({
        summary: vevent.summary,
        description: vevent.description,
        location: vevent.location,
        start: formatDateISO(startDate),
        end: parseICSDate(vevent.dtend)
          ? formatDateISO(parseICSDate(vevent.dtend)!)
          : "",
        uid: vevent.uid,
      });
    }
  }

  return allEvents;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const now = new Date();

    // Accept optional month (1-12) and year query params
    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");

    const year = yearParam ? parseInt(yearParam) : now.getUTCFullYear();
    const month = monthParam ? parseInt(monthParam) - 1 : now.getUTCMonth(); // 0-indexed

    // Window = first day of month → last day of month (UTC)
    const windowStart = new Date(Date.UTC(year, month, 1, 0, 0, 0));
    const windowEnd = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));

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
    const vevents = parseVEvents(icsText);

    const events = expandEvents(vevents, windowStart, windowEnd);

    // Sort by start date, return all events for the month
    const sorted = events
      .filter((e) => e.start && e.summary)
      .sort((a, b) => a.start.localeCompare(b.start));

    return NextResponse.json({ events: sorted, month: month + 1, year });
  } catch {
    return NextResponse.json(
      { error: "Failed to load calendar events" },
      { status: 500 },
    );
  }
}
