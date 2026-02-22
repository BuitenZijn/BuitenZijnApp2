"use client";

import { useState, useEffect } from "react";

// ==========================================
// TYPES
// ==========================================

interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  start_date: string;
  average_speed: number;
  max_speed: number;
  type: string;
}

// ==========================================
// STRAVA RIDES COMPONENT
// ==========================================

function StravaRides() {
  const [rides, setRides] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRides() {
      try {
        const res = await fetch("/api/strava");
        if (!res.ok) throw new Error("Kon ritten niet ophalen");
        const data = await res.json();
        setRides(data.activities || []);
      } catch {
        setError("Strava ritten konden niet geladen worden.");
      } finally {
        setLoading(false);
      }
    }
    fetchRides();
  }, []);

  const formatDistance = (m: number) => (m / 1000).toFixed(1) + " km";
  const formatDuration = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}u ${m}min` : `${m}min`;
  };
  const formatSpeed = (mps: number) => (mps * 3.6).toFixed(1) + " km/u";
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("nl-BE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-md p-6 animate-pulse"
          >
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">🚴</div>
        <p className="text-orange-700 font-medium mb-2">{error}</p>
        <p className="text-orange-600 text-sm">
          Strava-integratie wordt binnenkort geconfigureerd.
        </p>
      </div>
    );
  }

  if (rides.length === 0) {
    return (
      <div className="bg-beige-100 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">🚴</div>
        <p className="text-gray-600">Nog geen ritten beschikbaar.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rides.map((ride) => (
        <div
          key={ride.id}
          className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6"
        >
          <h3 className="text-lg font-bold text-navy-800 mb-1 truncate">
            {ride.name}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {formatDate(ride.start_date)}
          </p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">
                Afstand
              </p>
              <p className="font-semibold text-navy-800">
                {formatDistance(ride.distance)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">
                Duur
              </p>
              <p className="font-semibold text-navy-800">
                {formatDuration(ride.moving_time)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">
                Gem. snelheid
              </p>
              <p className="font-semibold text-navy-800">
                {formatSpeed(ride.average_speed)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">
                Hoogtemeters
              </p>
              <p className="font-semibold text-navy-800">
                {ride.total_elevation_gain.toFixed(0)} m
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================

export default function ParelendePelotonPage() {
  return (
    <div>
      {/* Hero: Welcome message over YouTube video */}
      <section className="relative aspect-video w-full overflow-hidden bg-black">
        <iframe
          className="absolute inset-0 w-full h-full pointer-events-none"
          src="https://www.youtube.com/embed/Eax-RlNZ4HE?autoplay=1&mute=1&loop=1&playlist=Eax-RlNZ4HE&controls=0&showinfo=0&modestbranding=1&playsinline=1&rel=0&disablekb=1"
          allow="autoplay; encrypted-media"
          allowFullScreen
          style={{ transform: "scale(1.2)" }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex items-center justify-center h-full px-6">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white text-center drop-shadow-lg leading-tight max-w-4xl">
            Welkom bij het{" "}
            <span className="text-green-400">Parelende Peloton!</span>
          </h1>
        </div>
      </section>

      {/* Mission block */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-800 text-center mb-10">
            Onze Missie
          </h2>

          <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
            <div className="flex gap-4">
              <div className="shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mt-1">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p>
                Door samen te fietsen, ontdekken we de prachtige natuur van de
                Durmevallei en brengen we mensen dichter bij elkaar.
              </p>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mt-1">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <p>
                Op een gezonde manier! Onze ritten worden geselecteerd zodat
                iedereen kan deelnemen, ongeacht het niveau.
              </p>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0 w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mt-1">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p>
                Sluit je aan bij het Parelende Peloton en ontdek de voordelen
                van fietsen voor lichaam en geest. We verwelkomen je graag op
                onze volgende tocht.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="max-w-4xl mx-auto px-6">
        <hr className="border-beige-300" />
      </div>

      {/* Strava block */}
      <section className="py-20 px-6 bg-beige-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <svg
              className="w-8 h-8 text-[#FC4C02]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
            <h2 className="text-3xl md:text-4xl font-bold text-navy-800 text-center">
              Onze Ritten
            </h2>
          </div>
          <p className="text-gray-600 text-center mb-10">
            Bekijk onze recente fietstochten via Strava
          </p>

          <StravaRides />
        </div>
      </section>
    </div>
  );
}
