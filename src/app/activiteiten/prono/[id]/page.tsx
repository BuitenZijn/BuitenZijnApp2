"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuth } from "@/app/providers";
import { useState } from "react";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function PronoCompetitionPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const competitionId = id as Id<"prono_competitions">;

  const competition = useQuery(api.prono.getCompetition, {
    id: competitionId,
  });
  const matches = useQuery(api.prono.getMatches, {
    competitionId,
  });
  const myPredictions = useQuery(
    api.prono.getMyPredictions,
    user?.id ? { userId: user.id as Id<"users">, competitionId } : "skip",
  );
  const leaderboard = useQuery(api.prono.getLeaderboard, {
    competitionId,
  });
  const savePrediction = useMutation(api.prono.savePrediction);

  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [homeInput, setHomeInput] = useState("");
  const [awayInput, setAwayInput] = useState("");
  const [activeTab, setActiveTab] = useState<"matches" | "ranking">("matches");

  if (!competition) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <div className="animate-pulse text-emerald-400 text-xl">Laden...</div>
      </div>
    );
  }

  const predictionMap = new Map(
    (myPredictions ?? []).map((p) => [p.matchId, p]),
  );

  const handleSavePrediction = async (matchId: string) => {
    if (!user?.id) return;
    const home = parseInt(homeInput);
    const away = parseInt(awayInput);
    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) return;

    await savePrediction({
      userId: user.id as Id<"users">,
      matchId: matchId as Id<"prono_matches">,
      homeScore: home,
      awayScore: away,
    });
    setEditingMatch(null);
    setHomeInput("");
    setAwayInput("");
  };

  // Group matches by group/phase
  const groupedMatches = new Map<string, typeof matches>();
  for (const match of matches ?? []) {
    const group = match.group || "Overig";
    if (!groupedMatches.has(group)) groupedMatches.set(group, []);
    groupedMatches.get(group)!.push(match);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/activiteiten/prono"
          className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-800 mb-8 text-sm font-medium"
        >
          ⬅ Terug naar Prono
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
            {competition.emoji || "⚽"} {competition.name}
          </h1>
          {competition.description && (
            <p className="text-gray-500">{competition.description}</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("matches")}
            className={`px-6 py-2 rounded-full font-semibold text-sm transition ${
              activeTab === "matches"
                ? "bg-emerald-500 text-white shadow"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            ⚽ Wedstrijden
          </button>
          <button
            onClick={() => setActiveTab("ranking")}
            className={`px-6 py-2 rounded-full font-semibold text-sm transition ${
              activeTab === "ranking"
                ? "bg-emerald-500 text-white shadow"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            🏆 Klassement
          </button>
        </div>

        {/* Matches tab */}
        {activeTab === "matches" && (
          <div className="space-y-8">
            {[...groupedMatches.entries()].map(([group, groupMatches]) => (
              <div key={group}>
                <h3 className="text-lg font-bold text-gray-700 mb-3">
                  {group}
                </h3>
                <div className="space-y-3">
                  {groupMatches!
                    .sort(
                      (a, b) =>
                        (a.matchNumber ?? 999) - (b.matchNumber ?? 999) ||
                        a.matchDate.localeCompare(b.matchDate) ||
                        (a.matchTime ?? "").localeCompare(b.matchTime ?? ""),
                    )
                    .map((match) => {
                      const pred = predictionMap.get(match._id);
                      const isEditing = editingMatch === match._id;

                      return (
                        <div
                          key={match._id}
                          className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400">
                              {match.matchDate}
                              {match.belgianTime
                                ? ` – ${match.belgianTime} (BE)`
                                : match.matchTime
                                  ? ` – ${match.matchTime}`
                                  : ""}
                              {match.location && ` · 📍 ${match.location}`}
                            </span>
                            {match.isFinished && (
                              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">
                                Gespeeld
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-center gap-4">
                            <span className="text-right font-semibold text-gray-800 flex-1">
                              {match.homeFlag && (
                                <span className="mr-1">{match.homeFlag}</span>
                              )}
                              {match.homeTeam}
                            </span>

                            {match.isFinished ? (
                              <span className="text-xl font-bold text-gray-800 bg-gray-100 px-4 py-1 rounded-lg">
                                {match.homeScore} - {match.awayScore}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400 px-4">
                                vs
                              </span>
                            )}

                            <span className="text-left font-semibold text-gray-800 flex-1">
                              {match.awayTeam}
                              {match.awayFlag && (
                                <span className="ml-1">{match.awayFlag}</span>
                              )}
                            </span>
                          </div>

                          {/* Prediction */}
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            {pred && !isEditing ? (
                              <div className="flex items-center justify-between">
                                <div className="text-sm">
                                  <span className="text-gray-500">
                                    Jouw voorspelling:{" "}
                                  </span>
                                  <span className="font-semibold text-emerald-600">
                                    {pred.homeScore} - {pred.awayScore}
                                  </span>
                                  {pred.pointsAwarded !== undefined && (
                                    <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                      +{pred.pointsAwarded} pts
                                    </span>
                                  )}
                                </div>
                                {!match.isFinished && (
                                  <button
                                    onClick={() => {
                                      setEditingMatch(match._id);
                                      setHomeInput(String(pred.homeScore));
                                      setAwayInput(String(pred.awayScore));
                                    }}
                                    className="text-xs text-emerald-500 hover:text-emerald-700"
                                  >
                                    Wijzigen
                                  </button>
                                )}
                              </div>
                            ) : !match.isFinished ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min={0}
                                  max={99}
                                  value={isEditing ? homeInput : ""}
                                  onChange={(e) => setHomeInput(e.target.value)}
                                  onFocus={() => {
                                    if (!isEditing) {
                                      setEditingMatch(match._id);
                                    }
                                  }}
                                  placeholder="0"
                                  className="w-16 text-center py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 outline-none"
                                />
                                <span className="text-gray-400 text-sm">-</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={99}
                                  value={isEditing ? awayInput : ""}
                                  onChange={(e) => setAwayInput(e.target.value)}
                                  onFocus={() => {
                                    if (!isEditing) {
                                      setEditingMatch(match._id);
                                    }
                                  }}
                                  placeholder="0"
                                  className="w-16 text-center py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 outline-none"
                                />
                                <button
                                  onClick={() =>
                                    handleSavePrediction(match._id)
                                  }
                                  className="ml-2 px-3 py-1 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition"
                                >
                                  Opslaan
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}

            {(matches ?? []).length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <span className="text-4xl block mb-2">🏟️</span>
                Nog geen wedstrijden gepland
              </div>
            )}
          </div>
        )}

        {/* Ranking tab */}
        {activeTab === "ranking" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                    Speler
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                    Punten
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                    Exact
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                    Voorspellingen
                  </th>
                </tr>
              </thead>
              <tbody>
                {(leaderboard ?? []).map((entry, idx) => (
                  <tr
                    key={entry.userId}
                    className={`border-t border-gray-100 ${
                      entry.userId === user?.id ? "bg-emerald-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-semibold">
                      {idx === 0
                        ? "🥇"
                        : idx === 1
                          ? "🥈"
                          : idx === 2
                            ? "🥉"
                            : idx + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {entry.playerName}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-emerald-600 text-right">
                      {entry.totalPoints}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">
                      {entry.exactPredictions}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 text-right">
                      {entry.totalPredictions}
                    </td>
                  </tr>
                ))}
                {(leaderboard ?? []).length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-gray-400"
                    >
                      Nog geen scores beschikbaar
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
