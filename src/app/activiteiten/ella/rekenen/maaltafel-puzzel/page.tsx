"use client";

import Link from "next/link";
import { useAuth } from "@/app/providers";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

// ── Defaults (used when Convex has no data yet) ─────────────────────
const DEFAULT_GRID_SIZE = 10;
const DEFAULT_BLANKS_PER_ROUND = 10;
const DEFAULT_BOMB_CHANCE = 0.4;
const LOCAL_IMAGE_COUNT = 10; // fallback images 1.png … 10.png

// ── Types ────────────────────────────────────────────────────────────
interface CellState {
  value: number; // correct answer
  isBlank: boolean; // needs user input
  isSolved: boolean; // answered correctly
  isBombed: boolean; // revealed by bomb
  showBombAnim: boolean;
  showCorrectAnim: boolean;
  wrongHint: string | null;
}

// ── Helpers ──────────────────────────────────────────────────────────
function buildGrid(size: number): number[][] {
  return Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => (i + 1) * (j + 1)),
  );
}

function pickBlanks(
  count: number,
  exclude: Set<string>,
  gridSize: number,
): [number, number][] {
  const pool: [number, number][] = [];
  for (let i = 0; i < gridSize; i++)
    for (let j = 0; j < gridSize; j++)
      if (!exclude.has(`${i}_${j}`)) pool.push([i, j]);
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function pickRandomImage(convexUrls: string[] | undefined): string {
  if (convexUrls && convexUrls.length > 0) {
    return convexUrls[Math.floor(Math.random() * convexUrls.length)];
  }
  // Fallback to local images
  const n = Math.floor(Math.random() * LOCAL_IMAGE_COUNT) + 1;
  return `/ella/puzzle_images/${n}.png`;
}

// ── Sound helper (plays one-shot; creates a new Audio each time to
//    allow overlapping) ───────────────────────────────────────────────
function playSound(src: string) {
  try {
    const a = new Audio(src);
    a.play().catch(() => {});
  } catch {
    /* ignore on SSR */
  }
}

// ── Slice an image into NxN pieces (returns base64 data-urls) ───────
async function sliceImage(src: string, gridSize: number): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const pw = img.width / gridSize;
      const ph = img.height / gridSize;
      const pieces: string[][] = [];
      for (let r = 0; r < gridSize; r++) {
        const row: string[] = [];
        for (let c = 0; c < gridSize; c++) {
          const canvas = document.createElement("canvas");
          canvas.width = pw;
          canvas.height = ph;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, c * pw, r * ph, pw, ph, 0, 0, pw, ph);
          row.push(canvas.toDataURL("image/jpeg", 0.85));
        }
        pieces.push(row);
      }
      resolve(pieces);
    };
    img.onerror = reject;
    img.src = src;
  });
}

// ── Component ────────────────────────────────────────────────────────
export default function MaaltafelPuzzelPage() {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Convex data
  const convexImageUrls = useQuery(api.rekenen.getActivePuzzleImageUrls);
  const convexSettings = useQuery(api.rekenen.getGameSettings, {
    game: "multiplication_grid",
  });
  const saveScore = useMutation(api.ellaScores.saveScore);

  // Resolved settings (Convex or defaults)
  const gridSize = convexSettings?.gridSize ?? DEFAULT_GRID_SIZE;
  const blanksPerRound =
    convexSettings?.blanksPerRound ?? DEFAULT_BLANKS_PER_ROUND;
  const bombChance = convexSettings?.bombChance ?? DEFAULT_BOMB_CHANCE;

  const [grid, setGrid] = useState<number[][]>(() => buildGrid(gridSize));
  const [cells, setCells] = useState<CellState[][]>([]);
  const [pieces, setPieces] = useState<string[][] | null>(null);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [remaining, setRemaining] = useState(blanksPerRound);
  const [finished, setFinished] = useState(false);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const mistakesRef = useRef(0);
  const startTimeRef = useRef(0);

  // Rebuild grid when settings change
  useEffect(() => {
    setGrid(buildGrid(gridSize));
  }, [gridSize]);

  // ── Initialise game ──────────────────────────────────────────────
  const initGame = useCallback(() => {
    const currentGrid = buildGrid(gridSize);
    setGrid(currentGrid);

    const src = pickRandomImage(convexImageUrls);
    setImageSrc(src);
    setFinished(false);
    setInputValues({});
    mistakesRef.current = 0;
    startTimeRef.current = Date.now();

    // build initial cell states
    const blanks = pickBlanks(blanksPerRound, new Set(), gridSize);
    const blankSet = new Set(blanks.map(([r, c]) => `${r}_${c}`));

    const initial: CellState[][] = currentGrid.map((row, i) =>
      row.map((val, j) => ({
        value: val,
        isBlank: blankSet.has(`${i}_${j}`),
        isSolved: false,
        isBombed: false,
        showBombAnim: false,
        showCorrectAnim: false,
        wrongHint: null,
      })),
    );
    setCells(initial);
    setRemaining(blanks.length);

    // slice image
    sliceImage(src, gridSize).then(setPieces).catch(console.error);
  }, [gridSize, blanksPerRound, convexImageUrls]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // ── Handle answer submission ─────────────────────────────────────
  const checkAnswer = useCallback(
    (row: number, col: number, answer: string) => {
      const num = parseInt(answer, 10);
      if (isNaN(num)) return;

      const correct = grid[row][col];

      setCells((prev) => {
        const next = prev.map((r) => r.map((c) => ({ ...c })));
        const cell = next[row][col];

        if (num === correct) {
          // ── Correct ──
          playSound("/ella/sounds/succes.wav");
          cell.isBlank = false;
          cell.isSolved = true;
          cell.showCorrectAnim = true;
          setTimeout(() => {
            setCells((p) => {
              const n2 = p.map((r) => r.map((c) => ({ ...c })));
              n2[row][col].showCorrectAnim = false;
              return n2;
            });
          }, 2500);

          // Bomb mechanic — dynamic chance
          if (Math.random() < bombChance) {
            playSound("/ella/sounds/explosion.mp3");
            const dirs = [
              [-1, -1],
              [-1, 0],
              [-1, 1],
              [0, -1],
              [0, 1],
              [1, -1],
              [1, 0],
              [1, 1],
            ];
            for (const [dr, dc] of dirs) {
              const nr = row + dr;
              const nc = col + dc;
              if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
                const n = next[nr][nc];
                n.isBlank = false;
                n.isSolved = true;
                n.isBombed = true;
                n.showBombAnim = true;
                setTimeout(() => {
                  setCells((p) => {
                    const n3 = p.map((r) => r.map((c) => ({ ...c })));
                    n3[nr][nc].showBombAnim = false;
                    return n3;
                  });
                }, 1500);
              }
            }
          }

          // Count remaining blanks
          let blanksLeft = 0;
          for (const r of next) for (const c of r) if (c.isBlank) blanksLeft++;

          if (blanksLeft === 0) {
            // Check if all cells solved → finished
            let allSolved = true;
            for (const r of next)
              for (const c of r) if (!c.isSolved) allSolved = false;

            if (allSolved) {
              playSound("/ella/sounds/completed.mp3");
              setFinished(true);
              setRemaining(0);
              // Save score
              const timeSeconds = Math.round(
                (Date.now() - startTimeRef.current) / 1000,
              );
              if (user?.id) {
                saveScore({
                  userId: user.id as Id<"users">,
                  game: "maaltafel_puzzel",
                  timeSeconds,
                  mistakes: mistakesRef.current,
                  difficulty: `${gridSize}x${gridSize}`,
                }).catch(() => {});
              }
            } else {
              // Spawn new blanks
              const solvedSet = new Set<string>();
              for (let i = 0; i < gridSize; i++)
                for (let j = 0; j < gridSize; j++)
                  if (next[i][j].isSolved) solvedSet.add(`${i}_${j}`);

              const newBlanks = pickBlanks(blanksPerRound, solvedSet, gridSize);
              for (const [r, c] of newBlanks) {
                next[r][c].isBlank = true;
              }
              setRemaining(newBlanks.length);
            }
          } else {
            setRemaining(blanksLeft);
          }
        } else {
          // ── Wrong ──
          playSound("/ella/sounds/fail.mp3");
          mistakesRef.current += 1;
          const hint = `${row + 1} × ${col + 1} = ?`;
          cell.wrongHint = hint;
          setTimeout(() => {
            setCells((p) => {
              const n2 = p.map((r) => r.map((c) => ({ ...c })));
              n2[row][col].wrongHint = null;
              return n2;
            });
          }, 4000);
        }

        return next;
      });

      // Clear input value
      setInputValues((prev) => ({ ...prev, [`${row}_${col}`]: "" }));
    },
    [grid, bombChance, gridSize, blanksPerRound],
  );

  // ── Auth guard ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        <div className="animate-pulse text-purple-400 text-xl">Laden...</div>
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

  if (!cells.length || !pieces) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        <div className="animate-pulse text-purple-400 text-xl">
          Puzzel laden...
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 py-6 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Nav */}
        <Link
          href="/activiteiten/ella/rekenen"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-4 text-sm font-medium"
        >
          ⬅ Terug naar Rekenen
        </Link>

        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
            🧩 Maaltafel Puzzel
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Los de maaltafels op om het plaatje te onthullen!
          </p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <span className="text-sm text-gray-600">
              Nog <strong className="text-purple-600">{remaining}</strong>{" "}
              vragen
            </span>
            <button
              onClick={initGame}
              className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-full transition"
            >
              🔄 Nieuw spel
            </button>
          </div>
        </div>

        {/* Finished overlay */}
        {finished && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center mb-4 shadow-md">
            <span className="text-5xl block mb-2">🎉</span>
            <h2 className="text-2xl font-bold text-green-700 mb-1">
              Proficiat!
            </h2>
            <p className="text-green-600 text-sm mb-3">
              Je hebt het hele plaatje onthuld!
            </p>
            {/* Show full image */}
            <img
              src={imageSrc}
              alt="Puzzel compleet"
              className="mx-auto rounded-xl shadow-lg max-h-72 mb-3"
            />
            <button
              onClick={initGame}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-semibold transition"
            >
              🔄 Nog een keer!
            </button>
          </div>
        )}

        {/* Grid */}
        <div className="flex justify-center overflow-auto">
          <table
            className="border-collapse"
            style={{
              width: "min(90vmin, 640px)",
              height: "min(90vmin, 640px)",
            }}
          >
            {/* Column headers */}
            <thead>
              <tr>
                <th className="bg-purple-600 border border-purple-700 text-xs sm:text-sm font-extrabold text-white w-[9%] rounded-tl-md">
                  ×
                </th>
                {Array.from({ length: gridSize }, (_, j) => (
                  <th
                    key={j}
                    className="bg-purple-600 border border-purple-700 text-xs sm:text-sm font-extrabold text-white"
                    style={{ width: `${100 / (gridSize + 1)}%` }}
                  >
                    {j + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cells.map((row, i) => (
                <tr key={i}>
                  {/* Row header */}
                  <th className="bg-purple-600 border border-purple-700 text-xs sm:text-sm font-extrabold text-white">
                    {i + 1}
                  </th>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="border border-gray-300 relative p-0 text-center align-middle"
                      style={{ aspectRatio: "1/1" }}
                    >
                      {/* Solved / bombed cell → show puzzle piece */}
                      {cell.isSolved && (
                        <>
                          <img
                            src={pieces[i][j]}
                            alt=""
                            className={`absolute inset-0 w-full h-full object-cover ${
                              cell.isBombed
                                ? ""
                                : "animate-[popFadeIn_1s_ease-out]"
                            }`}
                          />
                          <span
                            className={`absolute top-0.5 left-0.5 text-[10px] font-bold z-10 drop-shadow-sm ${
                              cell.isBombed ? "text-red-500" : "text-green-600"
                            }`}
                          >
                            {cell.value}
                          </span>
                          {/* Bomb animation */}
                          {cell.showBombAnim && (
                            <span className="absolute inset-0 flex items-center justify-center text-3xl animate-[bombFlash_2s_ease-out_forwards] z-20 pointer-events-none">
                              💥
                            </span>
                          )}
                          {/* Correct animation */}
                          {cell.showCorrectAnim && (
                            <span className="absolute top-1 left-1/2 -translate-x-1/2 text-green-500 font-bold text-xs animate-[floatUp_3s_ease-out_forwards] z-10 pointer-events-none whitespace-nowrap">
                              Goed gedaan!
                            </span>
                          )}
                        </>
                      )}

                      {/* Blank cell → input */}
                      {cell.isBlank && !cell.isSolved && (
                        <>
                          <input
                            ref={(el) => {
                              inputRefs.current[`${i}_${j}`] = el;
                            }}
                            type="number"
                            inputMode="numeric"
                            className="w-full h-full text-center text-sm sm:text-base bg-green-500 text-white font-semibold border-none outline-none focus:bg-green-400 transition"
                            value={inputValues[`${i}_${j}`] ?? ""}
                            onChange={(e) =>
                              setInputValues((prev) => ({
                                ...prev,
                                [`${i}_${j}`]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                checkAnswer(
                                  i,
                                  j,
                                  inputValues[`${i}_${j}`] ?? "",
                                );
                              }
                            }}
                            onBlur={() =>
                              checkAnswer(i, j, inputValues[`${i}_${j}`] ?? "")
                            }
                          />
                          {/* Wrong hint tooltip */}
                          {cell.wrongHint && (
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-red-500 text-white px-2 py-0.5 rounded text-[10px] whitespace-nowrap z-30 animate-[floatUpWrong_4s_ease-out_forwards]">
                              {cell.wrongHint}
                            </div>
                          )}
                        </>
                      )}

                      {/* Normal cell → show value */}
                      {!cell.isBlank && !cell.isSolved && (
                        <span className="text-xs sm:text-sm text-gray-700 font-medium">
                          {cell.value}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Keyframe animations via style tag (Tailwind doesn't include these
          by default) */}
      <style jsx global>{`
        @keyframes popFadeIn {
          0% {
            transform: scale(0.6);
            opacity: 0;
          }
          60% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes floatUp {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          50% {
            opacity: 1;
            transform: translateX(-50%) translateY(-10px);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-40px);
          }
        }
        @keyframes floatUpWrong {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(0px);
          }
          50% {
            opacity: 1;
            transform: translateX(-50%) translateY(-10px);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-30px);
          }
        }
        @keyframes bombFlash {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          20% {
            opacity: 1;
            transform: scale(1.4);
          }
          100% {
            opacity: 0;
            transform: scale(1);
          }
        }
        /* Hide number input spinner */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}
