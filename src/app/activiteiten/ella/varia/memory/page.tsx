"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/app/providers";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

// ── Types ────────────────────────────────────────────────────────────
interface Card {
  id: number;
  emoji: string;
  groupId: number; // which group this card belongs to
  isFlipped: boolean;
  isMatched: boolean;
}

type MatchCount = 2 | 3;

interface GridOption {
  label: string;
  rows: number;
  cols: number;
  description: string;
}

const GRID_OPTIONS: Record<string, GridOption[]> = {
  "2": [
    { label: "4×3", rows: 3, cols: 4, description: "6 paren" },
    { label: "4×4", rows: 4, cols: 4, description: "8 paren" },
    { label: "6×4", rows: 4, cols: 6, description: "12 paren" },
    { label: "6×5", rows: 5, cols: 6, description: "15 paren" },
    { label: "6×6", rows: 6, cols: 6, description: "18 paren" },
  ],
  "3": [
    { label: "3×3", rows: 3, cols: 3, description: "3 trio's" },
    { label: "4×3", rows: 3, cols: 4, description: "4 trio's" },
    { label: "6×3", rows: 3, cols: 6, description: "6 trio's" },
    { label: "6×4", rows: 4, cols: 6, description: "8 trio's" },
    { label: "6×5", rows: 5, cols: 6, description: "10 trio's" },
  ],
};

// ── Sound helper ─────────────────────────────────────────────────────
function playSound(src: string) {
  try {
    const a = new Audio(src);
    a.volume = 0.3;
    a.play().catch(() => {});
  } catch {
    /* ignore on SSR */
  }
}

// ── Shuffle ──────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Build cards ──────────────────────────────────────────────────────
function buildCards(
  emojis: string[],
  totalCards: number,
  matchCount: MatchCount,
): Card[] {
  const groupCount = totalCards / matchCount;
  const selectedEmojis = shuffle(emojis).slice(0, groupCount);

  const cards: Card[] = [];
  selectedEmojis.forEach((emoji, groupIdx) => {
    for (let i = 0; i < matchCount; i++) {
      cards.push({
        id: cards.length,
        emoji,
        groupId: groupIdx,
        isFlipped: false,
        isMatched: false,
      });
    }
  });

  return shuffle(cards).map((card, idx) => ({ ...card, id: idx }));
}

export default function MemoryGamePage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const themes = useQuery(api.memoryGame.getActiveThemes);
  const saveScore = useMutation(api.ellaScores.saveScore);

  // ── Game config state ────────────────────────────────────────────
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [matchCount, setMatchCount] = useState<MatchCount>(2);
  const [selectedGrid, setSelectedGrid] = useState<GridOption | null>(null);
  const [configStep, setConfigStep] = useState<
    "theme" | "matchCount" | "grid" | "playing" | "finished"
  >("theme");

  // ── Game state ───────────────────────────────────────────────────
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [totalGroups, setTotalGroups] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (configStep === "playing" && startTime > 0) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [configStep, startTime]);

  // ── Start game ──────────────────────────────────────────────────
  const doStartGame = useCallback(
    (grid: GridOption) => {
      if (!selectedTheme || !themes) return;

      const theme = themes.find((t) => t._id === selectedTheme);
      if (!theme) return;

      const totalCards = grid.rows * grid.cols;
      const newCards = buildCards(theme.emojis, totalCards, matchCount);
      const groups = totalCards / matchCount;

      setCards(newCards);
      setFlippedIds([]);
      setAttempts(0);
      setMatchedCount(0);
      setTotalGroups(groups);
      setStartTime(Date.now());
      setElapsed(0);
      setScoreSaved(false);
      setSelectedGrid(grid);
      setConfigStep("playing");
    },
    [selectedTheme, themes, matchCount],
  );

  // ── Handle card click ──────────────────────────────────────────
  const handleCardClick = useCallback(
    (cardId: number) => {
      if (isChecking) return;

      const card = cards[cardId];
      if (!card || card.isFlipped || card.isMatched) return;

      const newFlipped = [...flippedIds, cardId];
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)),
      );
      setFlippedIds(newFlipped);

      // Check if we have enough cards flipped
      if (newFlipped.length === matchCount) {
        setIsChecking(true);
        setAttempts((prev) => prev + 1);

        const flippedCards = newFlipped.map((id) => cards[id]);
        const allMatch = flippedCards.every(
          (c) => c.groupId === flippedCards[0].groupId,
        );

        setTimeout(() => {
          if (allMatch) {
            // Match found
            setCards((prev) =>
              prev.map((c) =>
                newFlipped.includes(c.id)
                  ? { ...c, isMatched: true, isFlipped: true }
                  : c,
              ),
            );
            setMatchedCount((prev) => {
              const newCount = prev + 1;
              return newCount;
            });
          } else {
            // No match - flip back
            setCards((prev) =>
              prev.map((c) =>
                newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c,
              ),
            );
          }
          setFlippedIds([]);
          setIsChecking(false);
        }, 800);
      }
    },
    [cards, flippedIds, isChecking, matchCount],
  );

  // ── Check win condition ────────────────────────────────────────
  useEffect(() => {
    if (
      configStep === "playing" &&
      totalGroups > 0 &&
      matchedCount === totalGroups
    ) {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
      setConfigStep("finished");
    }
  }, [matchedCount, totalGroups, configStep, startTime]);

  // ── Save score on finish ───────────────────────────────────────
  useEffect(() => {
    if (configStep === "finished" && user && !scoreSaved) {
      setScoreSaved(true);
      const theme = themes?.find((t) => t._id === selectedTheme);
      saveScore({
        userId: user.id as Id<"users">,
        game: "memory_game",
        timeSeconds: elapsed,
        moves: attempts,
        difficulty: `${selectedGrid?.label}_x${matchCount}`,
        subjectName: theme?.name ?? "Onbekend",
      }).catch(() => {});
    }
  }, [
    configStep,
    user,
    scoreSaved,
    elapsed,
    attempts,
    selectedGrid,
    matchCount,
    selectedTheme,
    themes,
    saveScore,
  ]);

  // ── Format time ────────────────────────────────────────────────
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // ── Loading / Auth ─────────────────────────────────────────────
  if (authLoading) {
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
            Je hebt geen rechten om dit spel te spelen.
          </p>
        </div>
      </div>
    );
  }

  // ── THEME SELECTION ────────────────────────────────────────────
  if (configStep === "theme") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-pink-50 to-purple-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/activiteiten/ella/varia"
            className="text-fuchsia-500 hover:text-fuchsia-700 text-sm mb-6 inline-block"
          >
            ← Terug naar Varia
          </Link>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent mb-2">
              🧠 Memory
            </h1>
            <p className="text-gray-500">Kies een thema</p>
          </div>

          {!themes ? (
            <div className="text-center text-gray-400 animate-pulse">
              Thema&apos;s laden...
            </div>
          ) : themes.length === 0 ? (
            <div className="text-center text-gray-400">
              Geen thema&apos;s beschikbaar. Vraag een beheerder om thema&apos;s
              toe te voegen.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {themes.map((theme) => (
                <button
                  key={theme._id}
                  onClick={() => {
                    setSelectedTheme(theme._id);
                    setConfigStep("matchCount");
                  }}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-200 text-center border-2 border-transparent hover:border-fuchsia-300"
                >
                  <div className="text-5xl mb-3">{theme.emoji}</div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {theme.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {theme.emojis.length} emoji&apos;s
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── MATCH COUNT SELECTION ──────────────────────────────────────
  if (configStep === "matchCount") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-pink-50 to-purple-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setConfigStep("theme")}
            className="text-fuchsia-500 hover:text-fuchsia-700 text-sm mb-6 inline-block"
          >
            ← Terug
          </button>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent mb-2">
              🧠 Memory
            </h1>
            <p className="text-gray-500">
              Hoeveel dezelfde kaarten wil je zoeken?
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
            <button
              onClick={() => {
                setMatchCount(2);
                setSelectedGrid(null);
                setConfigStep("grid");
              }}
              className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-200 text-center border-2 border-transparent hover:border-fuchsia-300"
            >
              <div className="text-5xl mb-3">👯</div>
              <h3 className="text-xl font-bold text-gray-800">Paren</h3>
              <p className="text-sm text-gray-400 mt-1">
                Vind 2 dezelfde kaarten
              </p>
            </button>
            <button
              onClick={() => {
                setMatchCount(3);
                setSelectedGrid(null);
                setConfigStep("grid");
              }}
              className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-200 text-center border-2 border-transparent hover:border-fuchsia-300"
            >
              <div className="text-5xl mb-3">👯‍♂️</div>
              <h3 className="text-xl font-bold text-gray-800">Trio&apos;s</h3>
              <p className="text-sm text-gray-400 mt-1">
                Vind 3 dezelfde kaarten
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── GRID SIZE SELECTION ────────────────────────────────────────
  if (configStep === "grid") {
    const options = GRID_OPTIONS[String(matchCount)];
    const theme = themes?.find((t) => t._id === selectedTheme);
    const availableEmojis = theme?.emojis.length ?? 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-pink-50 to-purple-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setConfigStep("matchCount")}
            className="text-fuchsia-500 hover:text-fuchsia-700 text-sm mb-6 inline-block"
          >
            ← Terug
          </button>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent mb-2">
              🧠 Memory
            </h1>
            <p className="text-gray-500">Kies de grootte van het speelveld</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-lg mx-auto">
            {options.map((opt) => {
              const totalCards = opt.rows * opt.cols;
              const neededEmojis = totalCards / matchCount;
              const disabled = neededEmojis > availableEmojis;

              return (
                <button
                  key={opt.label}
                  disabled={disabled}
                  onClick={() => doStartGame(opt)}
                  className={`rounded-2xl p-6 shadow-md text-center transition-all duration-200 ${
                    disabled
                      ? "bg-gray-100 cursor-not-allowed opacity-50"
                      : "bg-white hover:shadow-xl hover:scale-[1.03] border-2 border-transparent hover:border-fuchsia-300"
                  }`}
                >
                  <div className="text-3xl font-bold text-fuchsia-600 mb-2">
                    {opt.label}
                  </div>
                  <p className="text-sm text-gray-500">{opt.description}</p>
                  {disabled && (
                    <p className="text-xs text-red-400 mt-1">
                      Te weinig emoji&apos;s
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── FINISHED SCREEN ────────────────────────────────────────────
  if (configStep === "finished") {
    const theme = themes?.find((t) => t._id === selectedTheme);
    return (
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-pink-50 to-purple-50 py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-3xl shadow-xl p-10">
            <div className="text-7xl mb-4">🎉</div>
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
              Gewonnen!
            </h1>
            <p className="text-gray-500 mb-6">
              Je hebt alle {matchCount === 2 ? "paren" : "trio's"} gevonden!
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-fuchsia-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-fuchsia-600">
                  {attempts}
                </div>
                <div className="text-xs text-gray-500">Pogingen</div>
              </div>
              <div className="bg-pink-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-pink-600">
                  {formatTime(elapsed)}
                </div>
                <div className="text-xs text-gray-500">Tijd</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {selectedGrid?.label}
                </div>
                <div className="text-xs text-gray-500">Speelveld</div>
              </div>
              <div className="bg-violet-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-violet-600">
                  {theme?.emoji} {theme?.name}
                </div>
                <div className="text-xs text-gray-500">Thema</div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => selectedGrid && doStartGame(selectedGrid)}
                className="w-full py-3 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                🔄 Opnieuw spelen
              </button>
              <button
                onClick={() => {
                  setConfigStep("theme");
                  setSelectedTheme(null);
                  setSelectedGrid(null);
                }}
                className="w-full py-3 bg-white border-2 border-fuchsia-200 text-fuchsia-600 font-bold rounded-xl hover:bg-fuchsia-50 transition-all"
              >
                🎯 Andere instellingen
              </button>
              <Link
                href="/activiteiten/ella/varia"
                className="text-sm text-gray-400 hover:text-fuchsia-500 mt-2"
              >
                ← Terug naar Varia
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── GAME BOARD ─────────────────────────────────────────────────
  const gridCols =
    selectedGrid?.cols === 3
      ? "grid-cols-3"
      : selectedGrid?.cols === 4
        ? "grid-cols-4"
        : selectedGrid?.cols === 5
          ? "grid-cols-5"
          : "grid-cols-6";

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-pink-50 to-purple-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header / Stats bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              setConfigStep("theme");
              setSelectedTheme(null);
              setSelectedGrid(null);
            }}
            className="text-fuchsia-500 hover:text-fuchsia-700 text-sm font-medium"
          >
            ✕ Stoppen
          </button>
          <h1 className="text-xl font-bold text-fuchsia-600">🧠 Memory</h1>
          <div className="text-sm text-gray-400">
            {themes?.find((t) => t._id === selectedTheme)?.emoji}{" "}
            {themes?.find((t) => t._id === selectedTheme)?.name}
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 mb-6">
          <div className="bg-white rounded-xl px-5 py-2 shadow-sm text-center">
            <div className="text-lg font-bold text-fuchsia-600">{attempts}</div>
            <div className="text-xs text-gray-400">Pogingen</div>
          </div>
          <div className="bg-white rounded-xl px-5 py-2 shadow-sm text-center">
            <div className="text-lg font-bold text-pink-600">
              {matchedCount}/{totalGroups}
            </div>
            <div className="text-xs text-gray-400">Gevonden</div>
          </div>
          <div className="bg-white rounded-xl px-5 py-2 shadow-sm text-center">
            <div className="text-lg font-bold text-purple-600">
              {formatTime(elapsed)}
            </div>
            <div className="text-xs text-gray-400">Tijd</div>
          </div>
        </div>

        {/* Game Grid */}
        <div className={`grid ${gridCols} gap-2 md:gap-3`}>
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isFlipped || card.isMatched || isChecking}
              className={`aspect-square rounded-xl text-3xl md:text-4xl flex items-center justify-center transition-all duration-300 select-none ${
                card.isMatched
                  ? "bg-green-100 border-2 border-green-300 scale-95"
                  : card.isFlipped
                    ? "bg-white border-2 border-fuchsia-300 shadow-lg scale-105"
                    : "bg-gradient-to-br from-fuchsia-400 to-pink-500 hover:from-fuchsia-500 hover:to-pink-600 cursor-pointer shadow-md hover:shadow-lg hover:scale-[1.02]"
              }`}
            >
              {card.isFlipped || card.isMatched ? (
                <span className={card.isMatched ? "opacity-70" : ""}>
                  {card.emoji}
                </span>
              ) : (
                <span className="text-white/60 text-2xl">❓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
