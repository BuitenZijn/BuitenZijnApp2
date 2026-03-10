"use client";

import Link from "next/link";
import { useAuth } from "@/app/providers";

const games = [
  {
    name: "Maaltafel Puzzel",
    slug: "maaltafel-puzzel",
    description: "Los de maaltafels op en onthul het plaatje!",
    emoji: "🧩",
    available: true,
    gradient: "from-violet-400 to-purple-500",
  },
  {
    name: "Rekenoefeningen",
    slug: "oefeningen",
    description: "Oefen met optellen, aftrekken, vermenigvuldigen en delen!",
    emoji: "➕",
    available: true,
    gradient: "from-blue-400 to-indigo-500",
  },
];

export default function RekenenPage() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        <div className="animate-pulse text-purple-400 text-xl">Laden...</div>
      </div>
    );
  }

  if (
    !isAuthenticated ||
    !(user?.roles?.includes("admin") || user?.roles?.includes("ella"))
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm">
          <span className="text-5xl block mb-4">🔒</span>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Toegang geweigerd
          </h2>
          <p className="text-gray-500 text-sm">
            Je hebt geen rechten om dit te bekijken.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-pink-500 hover:text-pink-700 underline text-sm"
          >
            Terug naar home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/activiteiten/ella"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-8 text-sm font-medium"
        >
          ⬅ Terug naar ELLA
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 bg-clip-text text-transparent mb-3">
            🔢 Rekenen
          </h1>
          <p className="text-gray-500 text-lg">
            Kies een rekenspel om te spelen!
          </p>
        </div>

        {/* Game Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {games.map((game) => {
            const content = (
              <div
                className={`relative rounded-2xl p-6 text-white shadow-lg transition-all duration-300 ${
                  game.available
                    ? `bg-gradient-to-br ${game.gradient} hover:shadow-xl hover:scale-[1.03] cursor-pointer`
                    : "bg-gray-300 cursor-not-allowed opacity-70"
                }`}
              >
                <div className="text-5xl mb-4">{game.emoji}</div>
                <h2 className="text-2xl font-bold mb-2">{game.name}</h2>
                <p className="text-white/80 text-sm">{game.description}</p>
                {!game.available && (
                  <div className="absolute top-3 right-3 bg-white/30 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                    Binnenkort
                  </div>
                )}
              </div>
            );

            return game.available ? (
              <Link
                key={game.slug}
                href={`/activiteiten/ella/rekenen/${game.slug}`}
              >
                {content}
              </Link>
            ) : (
              <div key={game.slug}>{content}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
