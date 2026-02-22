"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useAuth } from "@/app/providers";

type Categorie =
  | "tekenen"
  | "vouwen"
  | "schilderen"
  | "verven"
  | "slijm maken"
  | "boetseren"
  | "stempelen";

const CATEGORY_INFO: Record<string, { label: string; emoji: string }> = {
  tekenen: { label: "Tekenen", emoji: "✏️" },
  vouwen: { label: "Vouwen", emoji: "🦢" },
  schilderen: { label: "Schilderen", emoji: "🎨" },
  verven: { label: "Verven", emoji: "🖌️" },
  "slijm maken": { label: "Slijm Maken", emoji: "🧪" },
  boetseren: { label: "Boetseren", emoji: "🏺" },
  stempelen: { label: "Stempelen", emoji: "⭐" },
};

/**
 * Extract YouTube video ID from various URL formats
 */
function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
    /(?:youtu\.be\/)([^?\s]+)/,
    /(?:youtube\.com\/embed\/)([^?\s]+)/,
    /(?:youtube\.com\/shorts\/)([^?\s]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function getYouTubeThumbnail(url: string): string {
  const id = getYouTubeId(url);
  if (id) return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
  return "";
}

export default function CategoriePage({
  params,
}: {
  params: Promise<{ categorie: string }>;
}) {
  const { categorie: rawCategorie } = use(params);
  const categorie = decodeURIComponent(rawCategorie) as Categorie;
  const { user, isLoading, isAuthenticated } = useAuth();

  const videos = useQuery(api.knutselen.getByCategorie, {
    categorie,
  });

  const info = CATEGORY_INFO[categorie];

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

  if (!info) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm">
          <span className="text-5xl block mb-4">❓</span>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Categorie niet gevonden
          </h2>
          <Link
            href="/activiteiten/ella/knutselen"
            className="mt-4 inline-block text-pink-500 hover:text-pink-700 underline text-sm"
          >
            Terug naar categorieën
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
            href="/activiteiten/ella/knutselen"
            className="inline-flex items-center gap-1 text-pink-500 hover:text-pink-700 text-sm font-medium mb-4"
          >
            ← Terug naar categorieën
          </Link>
          <div className="text-center">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-2">
              {info.emoji} {info.label}
            </h1>
            <p className="text-gray-500">
              {videos?.length ?? 0} filmpje
              {(videos?.length ?? 0) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Video Cards */}
        {videos === undefined ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-pink-400">Laden...</div>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-6xl block mb-4">🎬</span>
            <p className="text-gray-400 text-lg">
              Nog geen filmpjes in deze categorie
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => {
              const thumbnail =
                video.thumbnail || getYouTubeThumbnail(video.youtube_url);
              const videoId = getYouTubeId(video.youtube_url);

              return (
                <a
                  key={video._id}
                  href={video.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-gray-100">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={video.titel}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <span className="text-4xl">🎥</span>
                        </div>
                      )}
                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                        <div className="w-14 h-14 bg-pink-500/90 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity scale-90 group-hover:scale-100">
                          <svg
                            className="w-6 h-6 text-white ml-1"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 group-hover:text-pink-600 transition-colors line-clamp-2">
                        {video.titel}
                      </h3>
                      {video.beschrijving && (
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                          {video.beschrijving}
                        </p>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
