"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/providers";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

// ── Game metadata ────────────────────────────────────────────────────
const GAMES = [
  {
    id: "planeten_puzzel" as const,
    name: "Planeten Puzzel",
    emoji: "🪐",
    scoreLabel: "Zetten",
    scoreLower: true, // lower is better
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    id: "maaltafel_puzzel" as const,
    name: "Maaltafel Puzzel",
    emoji: "🔢",
    scoreLabel: "Fouten",
    scoreLower: true,
    gradient: "from-purple-400 to-violet-500",
  },
  {
    id: "dino_quiz" as const,
    name: "Dino Quiz",
    emoji: "🦕",
    scoreLabel: "Juist",
    scoreLower: false, // higher is better
    gradient: "from-emerald-500 to-green-600",
  },
] as const;

type GameId = (typeof GAMES)[number]["id"];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("nl-BE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════
export default function MijnResultatenPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "results" | "leaderboard" | "admin"
  >("results");
  const [selectedGame, setSelectedGame] = useState<GameId>("planeten_puzzel");

  const userId = user?.id as Id<"users"> | undefined;

  const myStats = useQuery(
    api.ellaScores.getMyStats,
    userId ? { userId } : "skip",
  );
  const myScores = useQuery(
    api.ellaScores.getMyScores,
    userId ? { userId, game: selectedGame } : "skip",
  );
  const leaderboard = useQuery(api.ellaScores.getLeaderboard, {
    game: selectedGame,
  });
  const isAdmin = user?.roles?.includes("admin");
  const allScores = useQuery(
    api.ellaScores.getAllScoresForGame,
    isAdmin ? { game: selectedGame } : "skip",
  );

  // ── Auth guard ─────────────────────────────────────────────────────
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

  const gameMeta = GAMES.find((g) => g.id === selectedGame)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/activiteiten/ella"
            className="text-purple-500 hover:text-purple-700 font-medium text-sm"
          >
            ← Terug naar ELLA
          </Link>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 bg-clip-text text-transparent">
            📊 Mijn Resultaten
          </h1>
          <div className="w-20" />
        </div>

        {/* Stats overview cards */}
        {myStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {GAMES.map((game) => {
              const stat = myStats[game.id];
              return (
                <div
                  key={game.id}
                  className={`bg-gradient-to-br ${game.gradient} rounded-2xl p-5 text-white shadow-lg cursor-pointer transition-all hover:scale-[1.02] ${
                    selectedGame === game.id
                      ? "ring-4 ring-white/50 scale-[1.02]"
                      : ""
                  }`}
                  onClick={() => setSelectedGame(game.id)}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{game.emoji}</span>
                    <span className="font-bold text-lg">{game.name}</span>
                  </div>
                  {stat && stat.timesPlayed > 0 ? (
                    <div className="space-y-1 text-sm text-white/90">
                      <div className="flex justify-between">
                        <span>Gespeeld:</span>
                        <span className="font-semibold">
                          {stat.timesPlayed}×
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Beste tijd:</span>
                        <span className="font-semibold">
                          {formatTime(stat.bestTime!)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gem. tijd:</span>
                        <span className="font-semibold">
                          {formatTime(stat.avgTime!)}
                        </span>
                      </div>
                      {stat.bestScore !== null && (
                        <div className="flex justify-between">
                          <span>Beste {game.scoreLabel.toLowerCase()}:</span>
                          <span className="font-semibold">
                            {stat.bestScore}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-white/70 text-sm italic">
                      Nog niet gespeeld
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${
              activeTab === "results"
                ? "bg-purple-500 text-white shadow-lg"
                : "bg-white text-purple-500 hover:bg-purple-50"
            }`}
            onClick={() => setActiveTab("results")}
          >
            📋 Mijn Scores
          </button>
          <button
            className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${
              activeTab === "leaderboard"
                ? "bg-purple-500 text-white shadow-lg"
                : "bg-white text-purple-500 hover:bg-purple-50"
            }`}
            onClick={() => setActiveTab("leaderboard")}
          >
            🏆 Top 10
          </button>
          {isAdmin && (
            <button
              className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${
                activeTab === "admin"
                  ? "bg-red-500 text-white shadow-lg"
                  : "bg-white text-red-500 hover:bg-red-50"
              }`}
              onClick={() => setActiveTab("admin")}
            >
              👑 Alle Spelers
            </button>
          )}
        </div>

        {/* Game selector pills */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {GAMES.map((game) => (
            <button
              key={game.id}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedGame === game.id
                  ? "bg-gradient-to-r " +
                    game.gradient +
                    " text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
              onClick={() => setSelectedGame(game.id)}
            >
              {game.emoji} {game.name}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "results" ? (
          <MyScoresTable scores={myScores} gameMeta={gameMeta} />
        ) : activeTab === "leaderboard" ? (
          <LeaderboardTable
            leaderboard={leaderboard}
            gameMeta={gameMeta}
            currentUserId={userId}
          />
        ) : (
          <AllScoresTable scores={allScores} gameMeta={gameMeta} />
        )}
      </div>
    </div>
  );
}

// ── My Scores Table ──────────────────────────────────────────────────
function MyScoresTable({
  scores,
  gameMeta,
}: {
  scores: any[] | undefined;
  gameMeta: (typeof GAMES)[number];
}) {
  if (!scores) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="animate-pulse text-lg">Laden...</div>
      </div>
    );
  }

  if (scores.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <span className="text-5xl block mb-4">{gameMeta.emoji}</span>
        <p className="text-gray-500">
          Je hebt {gameMeta.name} nog niet gespeeld.
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Speel een spelletje om je resultaten te zien!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div
        className={`bg-gradient-to-r ${gameMeta.gradient} px-6 py-4 text-white`}
      >
        <h2 className="font-bold text-lg">
          {gameMeta.emoji} {gameMeta.name} — Mijn Scores
        </h2>
        <p className="text-white/80 text-sm">
          {scores.length} {scores.length === 1 ? "spel" : "spellen"} gespeeld
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
              <th className="text-left px-6 py-3 font-medium">#</th>
              <th className="text-left px-6 py-3 font-medium">Datum</th>
              <th className="text-right px-6 py-3 font-medium">Tijd</th>
              <th className="text-right px-6 py-3 font-medium">
                {gameMeta.scoreLabel}
              </th>
              {gameMeta.id === "planeten_puzzel" && (
                <th className="text-right px-6 py-3 font-medium">Sterren</th>
              )}
              <th className="text-right px-6 py-3 font-medium">Moeilijkheid</th>
              {gameMeta.id === "planeten_puzzel" && (
                <th className="text-left px-6 py-3 font-medium">Planeet</th>
              )}
            </tr>
          </thead>
          <tbody>
            {scores.map((score: any, i: number) => (
              <tr
                key={score._id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-3 text-gray-400">{i + 1}</td>
                <td className="px-6 py-3">{formatDate(score.completedAt)}</td>
                <td className="px-6 py-3 text-right font-mono">
                  {formatTime(score.timeSeconds)}
                </td>
                <td className="px-6 py-3 text-right font-semibold">
                  {gameMeta.id === "planeten_puzzel" && score.moves}
                  {gameMeta.id === "maaltafel_puzzel" && score.mistakes}
                  {gameMeta.id === "dino_quiz" &&
                    `${score.correctAnswers}/${score.totalQuestions}`}
                </td>
                {gameMeta.id === "planeten_puzzel" && (
                  <td className="px-6 py-3 text-right">
                    {"⭐".repeat(score.stars || 0)}
                  </td>
                )}
                <td className="px-6 py-3 text-right text-gray-500">
                  {score.difficulty || "—"}
                </td>
                {gameMeta.id === "planeten_puzzel" && (
                  <td className="px-6 py-3 text-gray-600">
                    {score.subjectName || "—"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Leaderboard Table ────────────────────────────────────────────────
function LeaderboardTable({
  leaderboard,
  gameMeta,
  currentUserId,
}: {
  leaderboard: any[] | undefined;
  gameMeta: (typeof GAMES)[number];
  currentUserId: Id<"users"> | undefined;
}) {
  if (!leaderboard) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="animate-pulse text-lg">Laden...</div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <span className="text-5xl block mb-4">🏆</span>
        <p className="text-gray-500">Nog geen scores voor {gameMeta.name}.</p>
        <p className="text-gray-400 text-sm mt-1">
          Wees de eerste om te spelen!
        </p>
      </div>
    );
  }

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div
        className={`bg-gradient-to-r ${gameMeta.gradient} px-6 py-4 text-white`}
      >
        <h2 className="font-bold text-lg">🏆 Top 10 — {gameMeta.name}</h2>
        <p className="text-white/80 text-sm">Beste score per speler</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
              <th className="text-left px-6 py-3 font-medium w-12">Rang</th>
              <th className="text-left px-6 py-3 font-medium">Speler</th>
              <th className="text-right px-6 py-3 font-medium">
                {gameMeta.scoreLabel}
              </th>
              <th className="text-right px-6 py-3 font-medium">Tijd</th>
              <th className="text-right px-6 py-3 font-medium">Moeilijkheid</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry: any, i: number) => {
              const isMe = currentUserId === entry.userId;
              return (
                <tr
                  key={entry._id}
                  className={`border-b border-gray-50 transition-colors ${
                    isMe ? "bg-purple-50 font-semibold" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-6 py-3">
                    {i < 3 ? (
                      <span className="text-xl">{medals[i]}</span>
                    ) : (
                      <span className="text-gray-400 font-mono">{i + 1}</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    {entry.playerName}
                    {isMe && (
                      <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                        Jij
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right font-semibold">
                    {gameMeta.id === "planeten_puzzel" && entry.moves}
                    {gameMeta.id === "maaltafel_puzzel" && entry.mistakes}
                    {gameMeta.id === "dino_quiz" &&
                      `${entry.correctAnswers}/${entry.totalQuestions}`}
                  </td>
                  <td className="px-6 py-3 text-right font-mono">
                    {formatTime(entry.timeSeconds)}
                  </td>
                  <td className="px-6 py-3 text-right text-gray-500">
                    {entry.difficulty || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── All Scores Table (Admin) ─────────────────────────────────────────
function AllScoresTable({
  scores,
  gameMeta,
}: {
  scores: any[] | undefined;
  gameMeta: (typeof GAMES)[number];
}) {
  if (!scores) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="animate-pulse text-lg">Laden...</div>
      </div>
    );
  }

  if (scores.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <span className="text-5xl block mb-4">👑</span>
        <p className="text-gray-500">Nog geen scores voor {gameMeta.name}.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-4 text-white">
        <h2 className="font-bold text-lg">👑 Alle Spelers — {gameMeta.name}</h2>
        <p className="text-white/80 text-sm">
          {scores.length} {scores.length === 1 ? "score" : "scores"} totaal
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
              <th className="text-left px-6 py-3 font-medium">#</th>
              <th className="text-left px-6 py-3 font-medium">Speler</th>
              <th className="text-left px-6 py-3 font-medium">Datum</th>
              <th className="text-right px-6 py-3 font-medium">Tijd</th>
              <th className="text-right px-6 py-3 font-medium">
                {gameMeta.scoreLabel}
              </th>
              <th className="text-right px-6 py-3 font-medium">Moeilijkheid</th>
              {gameMeta.id === "planeten_puzzel" && (
                <th className="text-right px-6 py-3 font-medium">Sterren</th>
              )}
              {gameMeta.id === "planeten_puzzel" && (
                <th className="text-left px-6 py-3 font-medium">Planeet</th>
              )}
            </tr>
          </thead>
          <tbody>
            {scores.map((score: any, i: number) => (
              <tr
                key={score._id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-3 text-gray-400">{i + 1}</td>
                <td className="px-6 py-3 font-medium">{score.playerName}</td>
                <td className="px-6 py-3">{formatDate(score.completedAt)}</td>
                <td className="px-6 py-3 text-right font-mono">
                  {formatTime(score.timeSeconds)}
                </td>
                <td className="px-6 py-3 text-right font-semibold">
                  {gameMeta.id === "planeten_puzzel" && score.moves}
                  {gameMeta.id === "maaltafel_puzzel" && score.mistakes}
                  {gameMeta.id === "dino_quiz" &&
                    `${score.correctAnswers}/${score.totalQuestions}`}
                </td>
                <td className="px-6 py-3 text-right text-gray-500">
                  {score.difficulty || "—"}
                </td>
                {gameMeta.id === "planeten_puzzel" && (
                  <td className="px-6 py-3 text-right">
                    {"⭐".repeat(score.stars || 0)}
                  </td>
                )}
                {gameMeta.id === "planeten_puzzel" && (
                  <td className="px-6 py-3 text-gray-600">
                    {score.subjectName || "—"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
