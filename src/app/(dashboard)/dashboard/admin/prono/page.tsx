"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useAuth } from "@/app/providers";
import { Id } from "../../../../../../convex/_generated/dataModel";

export default function AdminPronoPage() {
  const { user } = useAuth();
  const competitions = useQuery(api.prono.getCompetitions);
  const createCompetition = useMutation(api.prono.createCompetition);
  const updateCompetition = useMutation(api.prono.updateCompetition);
  const createMatch = useMutation(api.prono.createMatch);
  const updateMatchResult = useMutation(api.prono.updateMatchResult);
  const deleteMatch = useMutation(api.prono.deleteMatch);

  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const matches = useQuery(
    api.prono.getMatches,
    selectedCompId
      ? { competitionId: selectedCompId as Id<"prono_competitions"> }
      : "skip",
  );

  // New competition form
  const [showNewComp, setShowNewComp] = useState(false);
  const [newComp, setNewComp] = useState({
    name: "",
    description: "",
    emoji: "⚽",
    startDate: "",
    endDate: "",
  });

  // New match form
  const [showNewMatch, setShowNewMatch] = useState(false);
  const [newMatch, setNewMatch] = useState({
    homeTeam: "",
    awayTeam: "",
    homeFlag: "",
    awayFlag: "",
    matchDate: "",
    matchTime: "",
    belgianTime: "",
    location: "",
    group: "",
    pointsExact: 3,
    pointsResult: 1,
    pointsGoalDiff: 0,
  });

  // Result form
  const [resultMatch, setResultMatch] = useState<string | null>(null);
  const [resultHome, setResultHome] = useState("");
  const [resultAway, setResultAway] = useState("");

  if (!user?.roles?.includes("admin")) {
    return <div className="text-center py-12 text-gray-500">Geen toegang</div>;
  }

  const handleCreateCompetition = async () => {
    await createCompetition({
      name: newComp.name,
      description: newComp.description || undefined,
      emoji: newComp.emoji || undefined,
      startDate: newComp.startDate || undefined,
      endDate: newComp.endDate || undefined,
      createdBy: user.id as Id<"users">,
    });
    setShowNewComp(false);
    setNewComp({
      name: "",
      description: "",
      emoji: "⚽",
      startDate: "",
      endDate: "",
    });
  };

  const handleCreateMatch = async () => {
    if (!selectedCompId) return;
    await createMatch({
      competitionId: selectedCompId as Id<"prono_competitions">,
      homeTeam: newMatch.homeTeam,
      awayTeam: newMatch.awayTeam,
      homeFlag: newMatch.homeFlag || undefined,
      awayFlag: newMatch.awayFlag || undefined,
      matchDate: newMatch.matchDate,
      matchTime: newMatch.matchTime || undefined,
      belgianTime: newMatch.belgianTime || undefined,
      location: newMatch.location || undefined,
      group: newMatch.group || undefined,
      pointsExact: newMatch.pointsExact,
      pointsResult: newMatch.pointsResult,
      pointsGoalDiff: newMatch.pointsGoalDiff || undefined,
    });
    setShowNewMatch(false);
    setNewMatch({
      homeTeam: "",
      awayTeam: "",
      homeFlag: "",
      awayFlag: "",
      matchDate: "",
      matchTime: "",
      belgianTime: "",
      location: "",
      group: "",
      pointsExact: 3,
      pointsResult: 1,
      pointsGoalDiff: 0,
    });
  };

  const handleUpdateResult = async () => {
    if (!resultMatch) return;
    const home = parseInt(resultHome);
    const away = parseInt(resultAway);
    if (isNaN(home) || isNaN(away)) return;
    await updateMatchResult({
      id: resultMatch as Id<"prono_matches">,
      homeScore: home,
      awayScore: away,
    });
    setResultMatch(null);
    setResultHome("");
    setResultAway("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">⚽ Prono Beheer</h1>
        <p className="text-gray-500 text-sm mt-1">
          Beheer competities, wedstrijden en resultaten
        </p>
      </div>

      {/* Competitions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            🏆 Competities
          </h2>
          <button
            onClick={() => setShowNewComp(!showNewComp)}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium text-sm"
          >
            + Nieuwe competitie
          </button>
        </div>

        {showNewComp && (
          <div className="border border-emerald-200 rounded-lg p-4 mb-4 bg-emerald-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                placeholder="Naam (bv. WK 2026)"
                value={newComp.name}
                onChange={(e) =>
                  setNewComp({ ...newComp, name: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                placeholder="Emoji (bv. ⚽🏆)"
                value={newComp.emoji}
                onChange={(e) =>
                  setNewComp({ ...newComp, emoji: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                placeholder="Beschrijving"
                value={newComp.description}
                onChange={(e) =>
                  setNewComp({ ...newComp, description: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm sm:col-span-2"
              />
              <input
                type="date"
                placeholder="Startdatum"
                value={newComp.startDate}
                onChange={(e) =>
                  setNewComp({ ...newComp, startDate: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="date"
                placeholder="Einddatum"
                value={newComp.endDate}
                onChange={(e) =>
                  setNewComp({ ...newComp, endDate: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <button
              onClick={handleCreateCompetition}
              disabled={!newComp.name}
              className="mt-3 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-gray-300 transition-colors font-medium text-sm"
            >
              Aanmaken
            </button>
          </div>
        )}

        <div className="space-y-2">
          {(competitions ?? []).map((comp) => (
            <div
              key={comp._id}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                selectedCompId === comp._id
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => setSelectedCompId(comp._id)}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{comp.emoji || "⚽"}</span>
                <div>
                  <span className="font-semibold text-gray-800">
                    {comp.name}
                  </span>
                  {comp.startDate && (
                    <span className="text-xs text-gray-400 ml-2">
                      {comp.startDate}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    comp.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {comp.isActive ? "Actief" : "Inactief"}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateCompetition({
                      id: comp._id,
                      isActive: !comp.isActive,
                    });
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  {comp.isActive ? "Deactiveer" : "Activeer"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Matches for selected competition */}
      {selectedCompId && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              📋 Wedstrijden
            </h2>
            <button
              onClick={() => setShowNewMatch(!showNewMatch)}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium text-sm"
            >
              + Wedstrijd toevoegen
            </button>
          </div>

          {showNewMatch && (
            <div className="border border-emerald-200 rounded-lg p-4 mb-4 bg-emerald-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  placeholder="Thuisploeg"
                  value={newMatch.homeTeam}
                  onChange={(e) =>
                    setNewMatch({ ...newMatch, homeTeam: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  placeholder="Uitploeg"
                  value={newMatch.awayTeam}
                  onChange={(e) =>
                    setNewMatch({ ...newMatch, awayTeam: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  placeholder="🇧🇪 Thuisvlag (emoji)"
                  value={newMatch.homeFlag}
                  onChange={(e) =>
                    setNewMatch({ ...newMatch, homeFlag: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  placeholder="🇩🇪 Uitvlag (emoji)"
                  value={newMatch.awayFlag}
                  onChange={(e) =>
                    setNewMatch({ ...newMatch, awayFlag: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="date"
                  value={newMatch.matchDate}
                  onChange={(e) =>
                    setNewMatch({ ...newMatch, matchDate: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="time"
                  placeholder="Lokale tijd"
                  value={newMatch.matchTime}
                  onChange={(e) =>
                    setNewMatch({ ...newMatch, matchTime: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  placeholder="Belgische tijd (bv. 21:00)"
                  value={newMatch.belgianTime}
                  onChange={(e) =>
                    setNewMatch({ ...newMatch, belgianTime: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  placeholder="Locatie (bv. Mexico-Stad)"
                  value={newMatch.location}
                  onChange={(e) =>
                    setNewMatch({ ...newMatch, location: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  placeholder="Groep/Fase (bv. Groep A)"
                  value={newMatch.group}
                  onChange={(e) =>
                    setNewMatch({ ...newMatch, group: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    placeholder="Pts exact"
                    value={newMatch.pointsExact}
                    onChange={(e) =>
                      setNewMatch({
                        ...newMatch,
                        pointsExact: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Pts resultaat"
                    value={newMatch.pointsResult}
                    onChange={(e) =>
                      setNewMatch({
                        ...newMatch,
                        pointsResult: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <button
                onClick={handleCreateMatch}
                disabled={
                  !newMatch.homeTeam ||
                  !newMatch.awayTeam ||
                  !newMatch.matchDate
                }
                className="mt-3 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-gray-300 transition-colors font-medium text-sm"
              >
                Toevoegen
              </button>
            </div>
          )}

          <div className="space-y-2">
            {(matches ?? [])
              .sort(
                (a, b) =>
                  (a.matchNumber ?? 999) - (b.matchNumber ?? 999) ||
                  a.matchDate.localeCompare(b.matchDate) ||
                  (a.matchTime ?? "").localeCompare(b.matchTime ?? ""),
              )
              .map((match) => (
                <div
                  key={match._id}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        {match.group && (
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                            {match.group}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {match.matchDate}
                          {match.belgianTime
                            ? ` ${match.belgianTime} (BE)`
                            : match.matchTime
                              ? ` ${match.matchTime}`
                              : ""}
                          {match.location && ` · ${match.location}`}
                        </span>
                      </div>
                      <div className="font-semibold text-gray-800 mt-1">
                        {match.homeFlag && `${match.homeFlag} `}
                        {match.homeTeam}
                        {match.isFinished
                          ? ` ${match.homeScore} - ${match.awayScore} `
                          : " vs "}
                        {match.awayTeam}
                        {match.awayFlag && ` ${match.awayFlag}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!match.isFinished && (
                        <>
                          {resultMatch === match._id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min={0}
                                value={resultHome}
                                onChange={(e) => setResultHome(e.target.value)}
                                className="w-12 text-center py-1 border border-gray-300 rounded text-sm"
                                placeholder="H"
                              />
                              <span className="text-gray-400">-</span>
                              <input
                                type="number"
                                min={0}
                                value={resultAway}
                                onChange={(e) => setResultAway(e.target.value)}
                                className="w-12 text-center py-1 border border-gray-300 rounded text-sm"
                                placeholder="U"
                              />
                              <button
                                onClick={handleUpdateResult}
                                className="px-2 py-1 bg-emerald-500 text-white rounded text-xs"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => setResultMatch(null)}
                                className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setResultMatch(match._id)}
                              className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Score invoeren
                            </button>
                          )}
                        </>
                      )}
                      {match.isFinished && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          ✓ Gespeeld
                        </span>
                      )}
                      <button
                        onClick={() => deleteMatch({ id: match._id })}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            {(matches ?? []).length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Nog geen wedstrijden
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
