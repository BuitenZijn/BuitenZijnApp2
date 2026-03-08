"use client";

import Link from "next/link";
import { useAuth } from "@/app/providers";

const sections = [
  {
    name: "Knutselen",
    slug: "knutselen",
    description: "Leuke knutselfilmpjes per categorie!",
    emoji: "✂️",
    available: true,
    gradient: "from-pink-400 to-rose-500",
  },
  {
    name: "Rekenen",
    slug: "rekenen",
    description: "Leuk oefenen met rekenen!",
    emoji: "🔢",
    available: true,
    gradient: "from-purple-400 to-violet-500",
  },
  {
    name: "Planeten Puzzels",
    slug: "planeten",
    description: "Puzzel de planeten en ontdek het zonnestelsel!",
    emoji: "🪐",
    available: true,
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    name: "Mijn Resultaten",
    slug: "resultaten",
    description: "Bekijk je scores, statistieken en de top 10!",
    emoji: "📊",
    available: true,
    gradient: "from-amber-400 to-orange-500",
  },
  {
    name: "Varia",
    slug: "varia",
    description: "Allerlei leuke activiteiten!",
    emoji: "🌈",
    available: false,
    gradient: "from-fuchsia-400 to-pink-500",
  },
];

export default function EllaPage() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        <div className="animate-pulse text-pink-400 text-xl">Laden...</div>
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
            Je hebt geen rechten om ELLA te bekijken.
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
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 bg-clip-text text-transparent mb-3">
            ✨ ELLA ✨
          </h1>
          <p className="text-gray-500 text-lg">
            Kies een activiteit om te beginnen!
          </p>
        </div>

        {/* Section Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sections.map((section) => {
            const content = (
              <div
                className={`relative rounded-2xl p-6 text-white shadow-lg transition-all duration-300 ${
                  section.available
                    ? `bg-gradient-to-br ${section.gradient} hover:shadow-xl hover:scale-[1.03] cursor-pointer`
                    : "bg-gray-300 cursor-not-allowed opacity-70"
                }`}
              >
                <div className="text-5xl mb-4">{section.emoji}</div>
                <h2 className="text-2xl font-bold mb-2">{section.name}</h2>
                <p className="text-white/80 text-sm">{section.description}</p>
                {!section.available && (
                  <div className="absolute top-3 right-3 bg-white/30 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                    Binnenkort
                  </div>
                )}
              </div>
            );

            return section.available ? (
              <Link
                key={section.slug}
                href={`/activiteiten/ella/${section.slug}`}
              >
                {content}
              </Link>
            ) : (
              <div key={section.slug}>{content}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
