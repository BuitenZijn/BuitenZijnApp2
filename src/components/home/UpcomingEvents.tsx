"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDaysIcon, MapPinIcon } from "@heroicons/react/24/outline";

interface CalendarEvent {
  summary: string;
  description: string;
  location: string;
  start: string;
  end: string;
  uid: string;
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("nl-BE", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("nl-BE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function UpcomingEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/calendar")
      .then((r) => r.json())
      .then((data) => {
        setEvents(data.events || []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
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
    );
  }

  if (error || events.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm text-center">
        <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">
          {error
            ? "Kon agenda niet laden."
            : "Geen aankomende evenementen gevonden."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
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
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPinIcon className="w-4 h-4 text-blue-600" />
                {event.location}
              </span>
            )}
          </div>
          {event.description && (
            <p className="mt-2 text-sm text-gray-500 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>
      ))}

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
