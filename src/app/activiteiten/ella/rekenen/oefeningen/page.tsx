"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useAuth } from "@/app/providers";
import { Id } from "../../../../../../convex/_generated/dataModel";

interface Difficulty {
  id: string;
  label: string;
  emoji: string;
  minNumber: number;
  maxNumber: number;
  addition: boolean;
  subtraction: boolean;
  multiplication: boolean;
  division: boolean;
  fractions: boolean;
  questionsPerRound: number;
  timeLimitSeconds: number;
  pointsPerCorrect: number;
  speedBonus: number;
  star1Threshold: number;
  star2Threshold: number;
  star3Threshold: number;
}

interface Question {
  text: string;
  answer: number;
  displayAnswer: string;
}

function generateQuestion(diff: Difficulty): Question {
  const ops: string[] = [];
  if (diff.addition) ops.push("+");
  if (diff.subtraction) ops.push("-");
  if (diff.multiplication) ops.push("×");
  if (diff.division) ops.push("÷");
  if (diff.fractions) ops.push("frac");
  if (ops.length === 0) ops.push("+");

  const op = ops[Math.floor(Math.random() * ops.length)];

  const rand = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  if (op === "frac") {
    // Fraction: a/b + c/d or a/b - c/d
    const denom1 = rand(2, Math.min(12, diff.maxNumber));
    const denom2 = rand(2, Math.min(12, diff.maxNumber));
    const num1 = rand(1, denom1 - 1);
    const num2 = rand(1, denom2 - 1);
    const fracOp = Math.random() < 0.5 ? "+" : "-";

    const result =
      fracOp === "+"
        ? num1 / denom1 + num2 / denom2
        : num1 / denom1 - num2 / denom2;

    const roundedResult = Math.round(result * 100) / 100;
    return {
      text: `${num1}/${denom1} ${fracOp} ${num2}/${denom2}`,
      answer: roundedResult,
      displayAnswer: roundedResult.toString(),
    };
  }

  let a = rand(diff.minNumber, diff.maxNumber);
  let b = rand(diff.minNumber, diff.maxNumber);

  if (op === "-" && a < b) [a, b] = [b, a]; // no negatives
  if (op === "÷") {
    // Ensure clean division
    b = rand(1, Math.min(12, diff.maxNumber));
    a = b * rand(1, Math.floor(diff.maxNumber / Math.max(b, 1)));
  }

  let answer: number;
  switch (op) {
    case "+":
      answer = a + b;
      break;
    case "-":
      answer = a - b;
      break;
    case "×":
      answer = a * b;
      break;
    case "÷":
      answer = a / b;
      break;
    default:
      answer = a + b;
  }

  return {
    text: `${a} ${op} ${b}`,
    answer: Math.round(answer * 100) / 100,
    displayAnswer: String(Math.round(answer * 100) / 100),
  };
}

export default function RekenoefenPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const settings = useQuery(api.rekenoefeningen.getSettings);
  const saveScore = useMutation(api.ellaScores.saveScore);

  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const startTimeRef = useRef<number>(0);
  const questionStartRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const startGame = useCallback((diff: Difficulty) => {
    setSelectedDifficulty(diff);
    const qs = Array.from({ length: diff.questionsPerRound }, () =>
      generateQuestion(diff),
    );
    setQuestions(qs);
    setCurrentIndex(0);
    setUserAnswer("");
    setScore(0);
    setCorrect(0);
    setWrong(0);
    setFeedback(null);
    setFinished(false);
    startTimeRef.current = Date.now();
    questionStartRef.current = Date.now();
    if (diff.timeLimitSeconds > 0) {
      setTimeLeft(diff.timeLimitSeconds);
    }
  }, []);

  // Timer
  useEffect(() => {
    if (!selectedDifficulty || finished) return;
    if (selectedDifficulty.timeLimitSeconds <= 0) return;

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - questionStartRef.current) / 1000,
      );
      const remaining = selectedDifficulty.timeLimitSeconds - elapsed;
      setTimeLeft(Math.max(0, remaining));
      if (remaining <= 0) {
        // Time's up for this question
        handleAnswer(true);
      }
    }, 250);

    return () => clearInterval(timerRef.current);
  }, [selectedDifficulty, currentIndex, finished]);

  const handleAnswer = useCallback(
    (timedOut = false) => {
      if (!selectedDifficulty || finished) return;
      const q = questions[currentIndex];
      if (!q) return;

      clearInterval(timerRef.current);

      const parsed = parseFloat(userAnswer);
      const isCorrect = !timedOut && Math.abs(parsed - q.answer) < 0.01;

      if (isCorrect) {
        const elapsed = (Date.now() - questionStartRef.current) / 1000;
        const halfTime = selectedDifficulty.timeLimitSeconds / 2;
        const bonus =
          selectedDifficulty.timeLimitSeconds > 0 && elapsed <= halfTime
            ? selectedDifficulty.speedBonus
            : 0;
        setScore((s) => s + selectedDifficulty.pointsPerCorrect + bonus);
        setCorrect((c) => c + 1);
        setFeedback("correct");
      } else {
        setWrong((w) => w + 1);
        setFeedback("wrong");
      }

      setTimeout(() => {
        setFeedback(null);
        const next = currentIndex + 1;
        if (next >= questions.length) {
          setFinished(true);
        } else {
          setCurrentIndex(next);
          setUserAnswer("");
          questionStartRef.current = Date.now();
          if (selectedDifficulty.timeLimitSeconds > 0) {
            setTimeLeft(selectedDifficulty.timeLimitSeconds);
          }
          inputRef.current?.focus();
        }
      }, 800);
    },
    [selectedDifficulty, questions, currentIndex, userAnswer, finished],
  );

  // Auto-focus input when moving to next question
  useEffect(() => {
    if (selectedDifficulty && !finished && questions.length > 0) {
      // Wait for React to re-render with feedback cleared and input re-enabled
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [currentIndex]);

  // Save score when finished
  useEffect(() => {
    if (!finished || !selectedDifficulty || !user) return;
    const totalTime = Math.round((Date.now() - startTimeRef.current) / 1000);
    const pct = (correct / questions.length) * 100;
    const stars =
      pct >= selectedDifficulty.star3Threshold
        ? 3
        : pct >= selectedDifficulty.star2Threshold
          ? 2
          : pct >= selectedDifficulty.star1Threshold
            ? 1
            : 0;

    saveScore({
      userId: user.id as Id<"users">,
      game: "rekenoefeningen",
      timeSeconds: totalTime,
      correctAnswers: correct,
      totalQuestions: questions.length,
      stars,
      difficulty: selectedDifficulty.id,
    });
  }, [finished]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="animate-pulse text-blue-400 text-xl">Laden...</div>
      </div>
    );
  }

  if (
    !isAuthenticated ||
    !(user?.roles?.includes("admin") || user?.roles?.includes("ella"))
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm">
          <span className="text-5xl block mb-4">🔒</span>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Toegang geweigerd
          </h2>
          <Link
            href="/"
            className="mt-4 inline-block text-blue-500 hover:text-blue-700 underline text-sm"
          >
            Terug naar home
          </Link>
        </div>
      </div>
    );
  }

  // ── Finished screen ─────────────────────────────────────────────
  if (finished && selectedDifficulty) {
    const pct = Math.round((correct / questions.length) * 100);
    const totalTime = Math.round((Date.now() - startTimeRef.current) / 1000);
    const stars =
      pct >= selectedDifficulty.star3Threshold
        ? 3
        : pct >= selectedDifficulty.star2Threshold
          ? 2
          : pct >= selectedDifficulty.star1Threshold
            ? 1
            : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-6xl mb-4">
              {stars >= 3 ? "🌟" : stars >= 2 ? "⭐" : stars >= 1 ? "✨" : "💪"}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Klaar!</h2>
            <p className="text-gray-500 mb-6">
              {selectedDifficulty.emoji} {selectedDifficulty.label}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600">
                  {correct}/{questions.length}
                </div>
                <div className="text-xs text-green-500">Juist</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-600">{score}</div>
                <div className="text-xs text-blue-500">Punten</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {totalTime}s
                </div>
                <div className="text-xs text-purple-500">Tijd</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-amber-600">
                  {"⭐".repeat(stars)}
                  {"☆".repeat(3 - stars)}
                </div>
                <div className="text-xs text-amber-500">Sterren</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => startGame(selectedDifficulty)}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition"
              >
                Opnieuw
              </button>
              <button
                onClick={() => {
                  setSelectedDifficulty(null);
                  setFinished(false);
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Ander niveau
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Game in progress ────────────────────────────────────────────
  if (selectedDifficulty && questions.length > 0 && !finished) {
    const q = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Progress */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">
                Vraag {currentIndex + 1}/{questions.length}
              </span>
              <span className="text-sm font-semibold text-blue-600">
                Score: {score}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
              <div
                className="h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Timer */}
            {selectedDifficulty.timeLimitSeconds > 0 && (
              <div className="text-center mb-4">
                <span
                  className={`text-3xl font-bold ${timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-gray-700"}`}
                >
                  {timeLeft}s
                </span>
              </div>
            )}

            {/* Question */}
            <div
              className={`text-center py-8 rounded-xl mb-6 transition-all ${
                feedback === "correct"
                  ? "bg-green-100"
                  : feedback === "wrong"
                    ? "bg-red-100"
                    : "bg-gray-50"
              }`}
            >
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {q.text} = ?
              </div>
              {feedback === "wrong" && (
                <div className="text-red-500 text-sm mt-2">
                  Antwoord: {q.displayAnswer}
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAnswer(false);
              }}
            >
              <input
                ref={inputRef}
                type="number"
                step="any"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Typ je antwoord..."
                disabled={feedback !== null}
                autoFocus
                className="w-full text-center text-2xl py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={!userAnswer || feedback !== null}
                className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-300 disabled:to-gray-300 transition"
              >
                Controleer
              </button>
            </form>

            {/* Stats */}
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <span className="text-green-600">✓ {correct}</span>
              <span className="text-red-500">✗ {wrong}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Difficulty selection ────────────────────────────────────────
  const difficulties = settings?.difficulties ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/activiteiten/ella/rekenen"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8 text-sm font-medium"
        >
          ⬅ Terug naar Rekenen
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent mb-3">
            ➕ Rekenoefeningen
          </h1>
          <p className="text-gray-500 text-lg">Kies je niveau!</p>
        </div>

        {difficulties.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Laden...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {difficulties.map((diff) => (
              <button
                key={diff.id}
                onClick={() => startGame(diff)}
                className="relative rounded-2xl p-6 text-white shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-400 to-indigo-500 hover:shadow-xl hover:scale-[1.03] cursor-pointer text-left"
              >
                <div className="text-5xl mb-4">{diff.emoji}</div>
                <h2 className="text-2xl font-bold mb-2">{diff.label}</h2>
                <div className="text-white/80 text-sm space-y-1">
                  <p>
                    {diff.questionsPerRound} vragen • Getallen {diff.minNumber}-
                    {diff.maxNumber}
                  </p>
                  <p>
                    {[
                      diff.addition && "+",
                      diff.subtraction && "−",
                      diff.multiplication && "×",
                      diff.division && "÷",
                      diff.fractions && "½",
                    ]
                      .filter(Boolean)
                      .join("  ")}
                  </p>
                  {diff.timeLimitSeconds > 0 && (
                    <p>⏱ {diff.timeLimitSeconds}s per vraag</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
