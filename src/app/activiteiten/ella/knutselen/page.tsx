"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuth } from "@/app/providers";

type Categorie =
  | "tekenen"
  | "vouwen"
  | "schilderen"
  | "verven"
  | "slijm maken"
  | "boetseren"
  | "stempelen";

const categories: {
  name: Categorie;
  label: string;
  emoji: string;
  color: string;
}[] = [
  {
    name: "tekenen",
    label: "Tekenen",
    emoji: "✏️",
    color: "from-pink-300 to-rose-400",
  },
  {
    name: "vouwen",
    label: "Vouwen",
    emoji: "🦢",
    color: "from-purple-300 to-violet-400",
  },
  {
    name: "schilderen",
    label: "Schilderen",
    emoji: "🎨",
    color: "from-fuchsia-300 to-pink-400",
  },
  {
    name: "verven",
    label: "Verven",
    emoji: "🖌️",
    color: "from-rose-300 to-red-400",
  },
  {
    name: "slijm maken",
    label: "Slijm Maken",
    emoji: "🧪",
    color: "from-emerald-300 to-teal-400",
  },
  {
    name: "boetseren",
    label: "Boetseren",
    emoji: "🏺",
    color: "from-amber-300 to-orange-400",
  },
  {
    name: "stempelen",
    label: "Stempelen",
    emoji: "⭐",
    color: "from-indigo-300 to-purple-400",
  },
];

export default function KnutselenPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const counts = useQuery(api.knutselen.getCategoryCounts) ?? {};

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
      <div className="max-w-5xl mx-auto">
        {/* Back + Header */}
        <div className="mb-10">
          <Link
            href="/activiteiten/ella"
            className="inline-flex items-center gap-1 text-pink-500 hover:text-pink-700 text-sm font-medium mb-4"
          >
            ← Terug naar ELLA
          </Link>
          <div className="text-center">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-2">
              ✂️ Knutselen
            </h1>
            <p className="text-gray-500">Kies een categorie!</p>
          </div>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {categories.map((cat) => {
            const count = counts[cat.name] ?? 0;
            return (
              <Link
                key={cat.name}
                href={`/activiteiten/ella/knutselen/${encodeURIComponent(cat.name)}`}
              >
                <div
                  className={`bg-gradient-to-br ${cat.color} rounded-2xl p-5 text-white shadow-md hover:shadow-xl hover:scale-[1.04] transition-all duration-300 cursor-pointer text-center`}
                >
                  <div className="text-5xl mb-3">{cat.emoji}</div>
                  <h3 className="text-lg font-bold mb-1">{cat.label}</h3>
                  <p className="text-white/70 text-xs">
                    {count} filmpje{count !== 1 ? "s" : ""}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
