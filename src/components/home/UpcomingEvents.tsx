"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  CalendarDaysIcon,
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

interface CalendarEvent {
  summary: string;
  description: string;
  location: string;
  start: string;
  end: string;
  uid: string;
}

const MONTH_NAMES = [
  "januari",
  "februari",
  "maart",
  "april",
  "mei",
  "juni",
  "juli",
  "augustus",
  "september",
  "oktober",
  "november",
  "december",
];

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("nl-BE", {
    weekday: "short",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Brussels",
  });
}

function formatTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("nl-BE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Brussels",
  });
}

/**
 * Strip HTML tags and decode HTML entities from a description string.
 * Also removes Google redirect wrapper URLs, leaving just the clean text.
 */
function cleanDescription(raw: string): string {
  if (!raw) return "";
  // Remove HTML tags
  let text = raw.replace(/<[^>]*>/g, "");
  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
  // Remove Google redirect URLs entirely (they just link back to our own site)
  text = text.replace(/https?:\/\/www\.google\.com\/url\?[^\s]*/g, "");
  // Clean up leftover whitespace
  text = text.replace(/\s+/g, " ").trim();
  // Remove "Meer" or "Meer info" if it's left orphaned at the end
  text = text.replace(/\s*Meer\s*(info)?\s*$/i, "").trim();
  return text;
}

/**
 * Shorten a full address to just the venue/place name.
 * e.g. "Vrijetijdscentrum De Meermin, Abdij van Roosenberglaan 6, 9250 Waasmunster, België"
 *   → "Vrijetijdscentrum De Meermin, Waasmunster"
 */
function shortenLocation(raw: string): string {
  if (!raw) return "";
  const parts = raw.split(",").map((p) => p.trim());
  if (parts.length <= 1) return raw;

  const venueName = parts[0];

  // Try to find a city name: look for a part that starts with a postal code (4 digits)
  // and extract the city after it, or just take the second-to-last part
  for (let i = 1; i < parts.length; i++) {
    const match = parts[i].match(/^\d{4}\s+(.+)$/);
    if (match) {
      return `${venueName}, ${match[1]}`;
    }
  }

  // Fallback: venue + second-to-last part (skip country)
  if (parts.length >= 3) {
    return `${venueName}, ${parts[parts.length - 2]}`;
  }
  return raw;
}

export function UpcomingEvents() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12
  const [year, setYear] = useState(now.getFullYear());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchEvents = useCallback(async (m: number, y: number) => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/calendar?month=${m}&year=${y}`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(month, year);
  }, [month, year, fetchEvents]);

  const goToPreviousMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const isCurrentMonth =
    month === now.getMonth() + 1 && year === now.getFullYear();

  return (
    <div className="space-y-4">
      {/* Month navigation header */}
      <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-600 hover:text-gray-900"
          aria-label="Vorige maand"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h3 className="font-semibold text-navy-800 text-lg capitalize">
            {MONTH_NAMES[month - 1]} {year}
          </h3>
          {!isCurrentMonth && (
            <button
              onClick={() => {
                setMonth(now.getMonth() + 1);
                setYear(now.getFullYear());
              }}
              className="text-xs text-green-600 hover:text-green-800 font-medium"
            >
              Terug naar vandaag
            </button>
          )}
        </div>

        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-600 hover:text-gray-900"
          aria-label="Volgende maand"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-5 shadow-sm animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Kon agenda niet laden.</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && events.length === 0 && (
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            Geen activiteiten in {MONTH_NAMES[month - 1]}.
          </p>
        </div>
      )}

      {/* Events list */}
      {!loading &&
        !error &&
        events.map((event) => {
          const description = cleanDescription(event.description);
          const location = shortenLocation(event.location);

          return (
            <div
              key={event.uid}
              className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition border-l-4 border-green-500"
            >
              <h4 className="font-semibold text-navy-800 text-lg">
                {event.summary}
              </h4>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <CalendarDaysIcon className="w-4 h-4 text-green-600" />
                  {formatDate(event.start)}
                  {event.start && ` — ${formatTime(event.start)}`}
                  {event.end && ` tot ${formatTime(event.end)}`}
                </span>
                {location && (
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4 text-blue-600" />
                    {location}
                  </span>
                )}
              </div>
              {description && (
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                  {description}
                </p>
              )}
            </div>
          );
        })}

      <div className="text-center pt-2">
        <Link
          href="/activiteiten"
          className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 font-medium text-sm"
        >
          Bekijk alle activiteiten →
        </Link>
      </div>
    </div>
  );
}
