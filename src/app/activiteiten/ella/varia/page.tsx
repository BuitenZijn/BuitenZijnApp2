"use client";

import Link from "next/link";
import { useAuth } from "@/app/providers";

const games = [
  {
    name: "Memory",
    slug: "memory",
    description: "Vind alle paren! Kies een thema en moeilijkheid.",
    emoji: "🧠",
    available: true,
    gradient: "from-fuchsia-400 to-pink-500",
  },
];

export default function VariaPage() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-fuchsia-50 via-pink-50 to-purple-50">
        <div className="animate-pulse text-fuchsia-400 text-xl">Laden...</div>
      </div>
    );
  }

  if (
    !isAuthenticated ||
    !(user?.roles?.includes("admin") || user?.roles?.includes("ella"))
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-fuchsia-50 via-pink-50 to-purple-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm">
          <span className="text-5xl block mb-4">🔒</span>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Toegang geweigerd
          </h2>
          <p className="text-gray-500 text-sm">
            Je hebt geen rechten om deze pagina te bekijken.
          </p>
          <Link
            href="/activiteiten/ella"
            className="mt-4 inline-block text-fuchsia-500 hover:text-fuchsia-700 underline text-sm"
          >
            Terug naar ELLA
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/activiteiten/ella"
            className="text-fuchsia-500 hover:text-fuchsia-700 text-sm mb-4 inline-block"
          >
            ← Terug naar ELLA
          </Link>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-fuchsia-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-3">
            🌈 Varia 🌈
          </h1>
          <p className="text-gray-500 text-lg">
            Allerlei leuke spelletjes en activiteiten!
          </p>
        </div>

        {/* Game Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                href={`/activiteiten/ella/varia/${game.slug}`}
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
