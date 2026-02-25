"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/app/providers";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

// ── Types ────────────────────────────────────────────────────────────
interface Planet {
  _id: string;
  nummer: number;
  nederlandseNaam: string;
  wetenschappelijkeNaam: string;
  korteBeschrijving: string;
  leukWeetje: string;
  imageUrl: string | null;
}

// ── Sound helper ─────────────────────────────────────────────────────
function playSound(src: string) {
  try {
    const a = new Audio(src);
    a.play().catch(() => {});
  } catch {
    /* ignore on SSR */
  }
}

// ── Image slicer ─────────────────────────────────────────────────────
async function sliceImage(src: string, gridSize: number): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Use a square crop from the center
      const size = Math.min(img.width, img.height);
      const offsetX = (img.width - size) / 2;
      const offsetY = (img.height - size) / 2;
      const pw = size / gridSize;
      const ph = size / gridSize;
      const pieces: string[] = [];
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          const canvas = document.createElement("canvas");
          canvas.width = 200;
          canvas.height = 200;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(
            img,
            offsetX + c * pw,
            offsetY + r * ph,
            pw,
            ph,
            0,
            0,
            200,
            200,
          );
          pieces.push(canvas.toDataURL("image/jpeg", 0.9));
        }
      }
      resolve(pieces);
    };
    img.onerror = reject;
    img.src = src;
  });
}

// ── Shuffle (Fisher-Yates, ensures not already solved) ──────────────
function shuffleArray(arr: number[]): number[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  // If it ended up sorted, swap the first two
  const isSorted = a.every((v, i) => v === i);
  if (isSorted && a.length > 1) {
    [a[0], a[1]] = [a[1], a[0]];
  }
  return a;
}

// ── Confetti particle ────────────────────────────────────────────────
function Confetti() {
  const particles = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 2,
        size: 6 + Math.random() * 8,
        color: [
          "#FFD700",
          "#FF6B6B",
          "#4ECDC4",
          "#A78BFA",
          "#F472B6",
          "#34D399",
          "#60A5FA",
          "#FBBF24",
        ][i % 8],
        rotation: Math.random() * 360,
      })),
    [],
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.left}%`,
            top: "-20px",
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            borderRadius: "2px",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// ── Grid size options ────────────────────────────────────────────────
const GRID_OPTIONS = [
  { value: 3, label: "3×3 (Makkelijk)", emoji: "⭐" },
  { value: 4, label: "4×4 (Normaal)", emoji: "⭐⭐" },
  { value: 5, label: "5×5 (Moeilijk)", emoji: "⭐⭐⭐" },
  { value: 6, label: "6×6 (Expert)", emoji: "🌟🌟🌟" },
];

// ── Planet emoji based on nummer ─────────────────────────────────────
const PLANET_EMOJIS: Record<number, string> = {
  1: "☿️", // Mercurius
  2: "♀️", // Venus
  3: "🌍", // Aarde
  4: "🔴", // Mars
  5: "🟠", // Jupiter
  6: "🪐", // Saturnus
  7: "🔵", // Uranus
  8: "💙", // Neptunus
  9: "⚪", // Pluto
};

// ══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════
export default function PlanetenPuzzelPage() {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Convex data
  const planets = useQuery(api.planets.getAll) as Planet[] | undefined;
  const puzzleSettings = useQuery(api.planets.getPuzzleSettings);
  const updateSettings = useMutation(api.planets.updatePuzzleSettings);

  // State
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [gridSize, setGridSize] = useState<number>(4);
  const [pieces, setPieces] = useState<string[]>([]);
  const [board, setBoard] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [moves, setMoves] = useState(0);
  const [loadingPuzzle, setLoadingPuzzle] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [completedPlanets, setCompletedPlanets] = useState<Set<string>>(
    new Set(),
  );
  const [swappingPair, setSwappingPair] = useState<[number, number] | null>(
    null,
  );

  const isAdmin = user?.roles?.includes("admin");

  // Sync grid size from Convex settings
  useEffect(() => {
    if (puzzleSettings) {
      setGridSize(puzzleSettings.piecesPerSide);
    }
  }, [puzzleSettings]);

  // Load completed planets from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("completedPlanets");
      if (saved) setCompletedPlanets(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  const markCompleted = useCallback((planetId: string) => {
    setCompletedPlanets((prev) => {
      const next = new Set(prev);
      next.add(planetId);
      localStorage.setItem("completedPlanets", JSON.stringify([...next]));
      return next;
    });
  }, []);

  // ── Start puzzle for a planet ──────────────────────────────────────
  const startPuzzle = useCallback(
    async (planet: Planet) => {
      if (!planet.imageUrl) return;
      setSelectedPlanet(planet);
      setCompleted(false);
      setShowInfo(false);
      setMoves(0);
      setSelected(null);
      setSwappingPair(null);
      setLoadingPuzzle(true);

      try {
        const slicedPieces = await sliceImage(planet.imageUrl, gridSize);
        setPieces(slicedPieces);
        const indices = Array.from(
          { length: gridSize * gridSize },
          (_, i) => i,
        );
        setBoard(shuffleArray(indices));
      } catch (e) {
        console.error("Failed to slice image:", e);
      } finally {
        setLoadingPuzzle(false);
      }
    },
    [gridSize],
  );

  // ── Handle piece click (swap mechanic) ─────────────────────────────
  const handlePieceClick = useCallback(
    (index: number) => {
      if (completed) return;

      if (selected === null) {
        // First selection
        setSelected(index);
        playSound("/ella/sounds/succes.wav");
      } else if (selected === index) {
        // Deselect
        setSelected(null);
      } else {
        // Swap
        setSwappingPair([selected, index]);

        setTimeout(() => {
          setBoard((prev) => {
            const next = [...prev];
            [next[selected], next[index]] = [next[index], next[selected]];

            // Check if solved
            const isSolved = next.every((v, i) => v === i);
            if (isSolved) {
              setTimeout(() => {
                playSound("/ella/sounds/completed.mp3");
                setCompleted(true);
                if (selectedPlanet) markCompleted(selectedPlanet._id);
                // Show info after a short delay
                setTimeout(() => setShowInfo(true), 1500);
              }, 300);
            }

            return next;
          });
          setSelected(null);
          setSwappingPair(null);
          setMoves((m) => m + 1);
        }, 250);
      }
    },
    [selected, completed, selectedPlanet, markCompleted],
  );

  // ── Change grid size ───────────────────────────────────────────────
  const handleGridSizeChange = useCallback(
    async (newSize: number) => {
      setGridSize(newSize);
      if (isAdmin) {
        try {
          await updateSettings({ piecesPerSide: newSize });
        } catch {}
      }
      // If currently in a puzzle, restart it
      if (selectedPlanet) {
        // Re-start with new size after a tick
        setTimeout(() => {
          startPuzzle(selectedPlanet);
        }, 100);
      }
    },
    [isAdmin, updateSettings, selectedPlanet, startPuzzle],
  );

  // ── Go to next planet ──────────────────────────────────────────────
  const goToNextPlanet = useCallback(() => {
    if (!selectedPlanet || !planets) return;
    const currentIdx = planets.findIndex((p) => p._id === selectedPlanet._id);
    const nextIdx = (currentIdx + 1) % planets.length;
    const next = planets[nextIdx];
    if (next?.imageUrl) {
      startPuzzle(next);
    }
  }, [selectedPlanet, planets, startPuzzle]);

  // ── Star rating based on moves ─────────────────────────────────────
  const getStars = useCallback(
    (moveCount: number) => {
      const totalPieces = gridSize * gridSize;
      if (moveCount <= totalPieces) return 3;
      if (moveCount <= totalPieces * 2) return 2;
      return 1;
    },
    [gridSize],
  );

  // ── AUTH GUARD ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950">
        <div className="animate-pulse text-purple-400 text-xl">Laden...</div>
      </div>
    );
  }

  if (
    !isAuthenticated ||
    !(user?.roles?.includes("admin") || user?.roles?.includes("ella"))
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-8 text-center max-w-sm border border-white/20">
          <span className="text-5xl block mb-4">🔒</span>
          <h2 className="text-xl font-bold text-white mb-2">
            Toegang geweigerd
          </h2>
          <p className="text-gray-300 text-sm">
            Je hebt geen rechten om dit te bekijken.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-purple-300 hover:text-purple-100 underline text-sm"
          >
            Terug naar home
          </Link>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // PUZZLE VIEW
  // ══════════════════════════════════════════════════════════════════════
  if (selectedPlanet) {
    if (loadingPuzzle) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🪐</div>
            <div className="text-purple-300 text-lg animate-pulse">
              Puzzel voorbereiden...
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 py-4 px-2 sm:px-4 relative overflow-hidden">
        {/* Stars background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: 0.3 + Math.random() * 0.7,
              }}
            />
          ))}
        </div>

        {/* Confetti on completion */}
        {completed && <Confetti />}

        <div className="max-w-3xl mx-auto relative z-10">
          {/* Nav */}
          <button
            onClick={() => setSelectedPlanet(null)}
            className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-100 mb-3 text-sm font-medium transition"
          >
            ⬅ Terug naar planeten
          </button>

          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {PLANET_EMOJIS[selectedPlanet.nummer] || "🪐"}{" "}
              {selectedPlanet.nederlandseNaam}
            </h1>
            <p className="text-purple-300 text-sm mt-1">
              Wissel de stukjes om het plaatje te maken!
            </p>
            <div className="mt-2 flex items-center justify-center gap-4 flex-wrap">
              <span className="text-sm text-purple-200">
                Zetten: <strong className="text-yellow-300">{moves}</strong>
              </span>
              <span className="text-sm text-purple-200">
                Stukjes:{" "}
                <strong className="text-yellow-300">
                  {gridSize}×{gridSize}
                </strong>
              </span>
              <button
                onClick={() => startPuzzle(selectedPlanet)}
                className="text-xs bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 px-3 py-1 rounded-full transition border border-purple-400/30"
              >
                🔄 Opnieuw
              </button>
            </div>
          </div>

          {/* Completion overlay */}
          {completed && (
            <div
              className={`bg-gradient-to-br from-yellow-500/20 to-purple-500/20 backdrop-blur-md border border-yellow-400/30 rounded-2xl p-6 text-center mb-4 shadow-2xl transition-all duration-700 ${showInfo ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <div className="text-5xl mb-2">
                {getStars(moves) === 3
                  ? "🌟🌟🌟"
                  : getStars(moves) === 2
                    ? "⭐⭐"
                    : "⭐"}
              </div>
              <h2 className="text-2xl font-bold text-yellow-300 mb-1">
                Proficiat! 🎉
              </h2>
              <p className="text-purple-200 text-sm mb-4">
                Opgelost in <strong>{moves}</strong> zetten!
              </p>

              {/* Full planet image */}
              {selectedPlanet.imageUrl && (
                <div className="relative inline-block mb-4">
                  <img
                    src={selectedPlanet.imageUrl}
                    alt={selectedPlanet.nederlandseNaam}
                    className="mx-auto rounded-xl shadow-2xl max-h-48 sm:max-h-56 border-2 border-yellow-400/40 animate-revealImage"
                  />
                  <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-yellow-400/20 to-purple-500/20 -z-10 blur-md" />
                </div>
              )}

              {/* Planet info */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left max-w-md mx-auto border border-white/10">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {PLANET_EMOJIS[selectedPlanet.nummer] || "🪐"}{" "}
                  {selectedPlanet.nederlandseNaam}
                  <span className="text-xs text-purple-300 font-normal italic">
                    ({selectedPlanet.wetenschappelijkeNaam})
                  </span>
                </h3>
                <p className="text-purple-200 text-sm mt-2 leading-relaxed">
                  {selectedPlanet.korteBeschrijving}
                </p>
                <div className="mt-3 bg-yellow-500/10 border border-yellow-400/20 rounded-lg p-3">
                  <p className="text-yellow-200 text-sm">
                    <span className="font-semibold">💡 Wist je dat?</span>{" "}
                    {selectedPlanet.leukWeetje}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                <button
                  onClick={() => startPuzzle(selectedPlanet)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-2 rounded-full font-semibold transition text-sm shadow-lg"
                >
                  🔄 Nog een keer
                </button>
                {planets && (
                  <button
                    onClick={goToNextPlanet}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-full font-semibold transition text-sm shadow-lg"
                  >
                    ➡️ Volgende planeet
                  </button>
                )}
                <button
                  onClick={() => setSelectedPlanet(null)}
                  className="bg-white/10 hover:bg-white/20 text-purple-200 px-5 py-2 rounded-full font-semibold transition text-sm border border-white/20"
                >
                  📋 Alle planeten
                </button>
              </div>
            </div>
          )}

          {/* Puzzle grid + reference image */}
          <div className="flex flex-col items-center gap-4">
            {/* Reference thumbnail */}
            {!completed && selectedPlanet.imageUrl && (
              <div className="flex items-center gap-2">
                <span className="text-purple-300 text-xs">Voorbeeld:</span>
                <img
                  src={selectedPlanet.imageUrl}
                  alt="Voorbeeld"
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border-2 border-purple-400/40 shadow-lg"
                />
              </div>
            )}

            {/* Puzzle grid */}
            <div
              className="grid gap-1 sm:gap-1.5 mx-auto"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                width: "min(85vmin, 500px)",
                height: "min(85vmin, 500px)",
              }}
            >
              {board.map((pieceIdx, boardPos) => {
                const isSelected = selected === boardPos;
                const isSwapping =
                  swappingPair !== null &&
                  (swappingPair[0] === boardPos ||
                    swappingPair[1] === boardPos);
                const isCorrect = pieceIdx === boardPos;

                return (
                  <button
                    key={boardPos}
                    onClick={() => handlePieceClick(boardPos)}
                    disabled={completed}
                    className={`
                      relative rounded-md sm:rounded-lg overflow-hidden transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-yellow-400
                      ${isSelected ? "ring-3 ring-yellow-400 scale-105 z-10 shadow-xl shadow-yellow-500/30" : ""}
                      ${isSwapping ? "scale-95 opacity-80" : ""}
                      ${completed && isCorrect ? "animate-popIn" : ""}
                      ${!completed ? "hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer active:scale-95" : ""}
                    `}
                    style={{ aspectRatio: "1/1" }}
                  >
                    {pieces[pieceIdx] && (
                      <img
                        src={pieces[pieceIdx]}
                        alt={`Puzzelstuk ${boardPos + 1}`}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    )}
                    {/* Piece number hint (small, bottom-right) */}
                    {!completed && (
                      <span className="absolute bottom-0.5 right-0.5 text-[8px] bg-black/40 text-white/70 px-1 rounded">
                        {boardPos + 1}
                      </span>
                    )}
                    {/* Selected highlight overlay */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-yellow-400/20 border-2 border-yellow-400 rounded-md sm:rounded-lg" />
                    )}
                    {/* Correct position indicator */}
                    {isCorrect && !completed && (
                      <div className="absolute top-0.5 left-0.5">
                        <span className="text-[10px]">✅</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Animations */}
        <style jsx global>{`
          @keyframes twinkle {
            0%,
            100% {
              opacity: 0.3;
            }
            50% {
              opacity: 1;
            }
          }
          .animate-twinkle {
            animation: twinkle 3s ease-in-out infinite;
          }

          @keyframes confetti {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
          .animate-confetti {
            animation: confetti 3s ease-out forwards;
          }

          @keyframes popIn {
            0% {
              transform: scale(0.8);
              opacity: 0.5;
            }
            50% {
              transform: scale(1.05);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          .animate-popIn {
            animation: popIn 0.5s ease-out;
          }

          @keyframes revealImage {
            0% {
              transform: scale(0.5) rotateY(90deg);
              opacity: 0;
            }
            50% {
              transform: scale(1.1) rotateY(0deg);
              opacity: 1;
            }
            100% {
              transform: scale(1) rotateY(0deg);
            }
          }
          .animate-revealImage {
            animation: revealImage 0.8s ease-out;
          }
        `}</style>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // PLANET SELECTION VIEW
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 py-8 px-4 relative overflow-hidden">
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 80 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0.3 + Math.random() * 0.7,
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Nav */}
        <Link
          href="/activiteiten/ella"
          className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-100 mb-6 text-sm font-medium transition"
        >
          ⬅ Terug naar ELLA
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-yellow-300 via-purple-300 to-blue-300 bg-clip-text text-transparent mb-2">
            🪐 Planeten Puzzels
          </h1>
          <p className="text-purple-300 text-base">
            Kies een planeet en los de puzzel op!
          </p>
        </div>

        {/* Grid size selector */}
        <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
          <span className="text-purple-300 text-sm font-medium">
            Moeilijkheid:
          </span>
          {GRID_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleGridSizeChange(opt.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                gridSize === opt.value
                  ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/30 scale-105"
                  : "bg-white/10 text-purple-200 hover:bg-white/20 border border-white/10"
              }`}
            >
              {opt.emoji} {opt.label}
            </button>
          ))}
          {isAdmin && (
            <span className="text-xs text-yellow-400/60 ml-2">
              ⚙ Admin: keuze wordt opgeslagen als standaard
            </span>
          )}
        </div>

        {/* Planet cards */}
        {!planets ? (
          <div className="text-center text-purple-400 animate-pulse text-lg py-12">
            Planeten laden...
          </div>
        ) : planets.length === 0 ? (
          <div className="text-center text-purple-400 py-12">
            <span className="text-5xl block mb-4">🌌</span>
            <p>Nog geen planeten gevonden.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {planets.map((planet) => {
              const hasImage = !!planet.imageUrl;
              const isDone = completedPlanets.has(planet._id);

              return (
                <button
                  key={planet._id}
                  onClick={() => hasImage && startPuzzle(planet)}
                  disabled={!hasImage}
                  className={`
                    relative rounded-2xl overflow-hidden text-left transition-all duration-300 group
                    ${
                      hasImage
                        ? "hover:scale-[1.03] hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer"
                        : "opacity-50 cursor-not-allowed"
                    }
                  `}
                >
                  {/* Background image or placeholder */}
                  <div className="aspect-[4/3] relative">
                    {planet.imageUrl ? (
                      <img
                        src={planet.imageUrl}
                        alt={planet.nederlandseNaam}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-800 to-indigo-900 flex items-center justify-center">
                        <span className="text-6xl opacity-30">🪐</span>
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

                    {/* Completed badge */}
                    {isDone && (
                      <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg pointer-events-none">
                        ✅ Voltooid
                      </div>
                    )}

                    {/* No image badge */}
                    {!hasImage && (
                      <div className="absolute top-3 right-3 bg-red-500/80 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-semibold pointer-events-none">
                        Geen afbeelding
                      </div>
                    )}

                    {/* Planet info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {PLANET_EMOJIS[planet.nummer] || "🪐"}
                        </span>
                        <div>
                          <h3 className="text-white font-bold text-lg leading-tight">
                            {planet.nederlandseNaam}
                          </h3>
                          <p className="text-purple-200 text-xs italic">
                            {planet.wetenschappelijkeNaam}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-xs mt-1 line-clamp-2">
                        {planet.korteBeschrijving}
                      </p>
                    </div>

                    {/* Hover overlay for clickable cards */}
                    {hasImage && (
                      <div className="absolute inset-0 bg-yellow-400/0 group-hover:bg-yellow-400/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                        <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-semibold text-sm border border-white/30 shadow-xl">
                          🧩 Start puzzel
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Progress indicator */}
        {planets && planets.length > 0 && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-full px-6 py-3 border border-white/10">
              <span className="text-purple-300 text-sm">Voortgang:</span>
              <span className="text-yellow-300 font-bold">
                {completedPlanets.size} / {planets.length}
              </span>
              <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${(completedPlanets.size / planets.length) * 100}%`,
                  }}
                />
              </div>
              {completedPlanets.size === planets.length &&
                planets.length > 0 && <span className="text-sm">🏆</span>}
            </div>
          </div>
        )}
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
