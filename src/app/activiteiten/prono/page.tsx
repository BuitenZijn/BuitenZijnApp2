"use client";

import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@/app/providers";
import { useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";

export default function PronoPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const competitions = useQuery(api.prono.getActiveCompetitions);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <div className="animate-pulse text-emerald-400 text-xl">Laden...</div>
      </div>
    );
  }

  if (
    !isAuthenticated ||
    !(user?.roles?.includes("admin") || user?.roles?.includes("prono"))
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm">
          <span className="text-5xl block mb-4">🔒</span>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Toegang geweigerd
          </h2>
          <p className="text-gray-500 text-sm">
            Je hebt geen rechten om Prono te bekijken.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-emerald-500 hover:text-emerald-700 underline text-sm"
          >
            Terug naar home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 bg-clip-text text-transparent mb-3">
            ⚽ Prono
          </h1>
          <p className="text-gray-500 text-lg">
            Voorspel de uitslagen en word kampioen!
          </p>
        </div>

        {/* Competitions */}
        {competitions === undefined ? (
          <div className="text-center py-12 text-gray-400">Laden...</div>
        ) : competitions.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-6xl block mb-4">🏟️</span>
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              Nog geen competities
            </h2>
            <p className="text-gray-500">
              Er zijn momenteel geen actieve prono-competities.
              <br />
              Zodra een admin een competitie aanmaakt, verschijnt die hier!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {competitions.map((comp) => (
              <Link key={comp._id} href={`/activiteiten/prono/${comp._id}`}>
                <div className="relative rounded-2xl p-6 text-white shadow-lg transition-all duration-300 bg-gradient-to-br from-emerald-400 to-teal-500 hover:shadow-xl hover:scale-[1.03] cursor-pointer">
                  <div className="text-5xl mb-4">{comp.emoji || "⚽"}</div>
                  <h2 className="text-2xl font-bold mb-2">{comp.name}</h2>
                  {comp.description && (
                    <p className="text-white/80 text-sm">{comp.description}</p>
                  )}
                  {comp.startDate && (
                    <p className="text-white/60 text-xs mt-2">
                      📅 {comp.startDate}
                      {comp.endDate && ` – ${comp.endDate}`}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
