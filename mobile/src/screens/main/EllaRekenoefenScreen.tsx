import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "../../contexts/AuthContext";
import { colors, fontSize, spacing, borderRadius } from "../../styles/theme";
import type { MainStackParamList } from "../../navigation/types";

type Nav = NativeStackNavigationProp<MainStackParamList>;

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
    const denom1 = rand(2, Math.min(12, diff.maxNumber));
    const denom2 = rand(2, Math.min(12, diff.maxNumber));
    const num1 = rand(1, denom1 - 1);
    const num2 = rand(1, denom2 - 1);
    const fracOp = Math.random() < 0.5 ? "+" : "-";
    const result =
      fracOp === "+"
        ? num1 / denom1 + num2 / denom2
        : num1 / denom1 - num2 / denom2;
    const rounded = Math.round(result * 100) / 100;
    return {
      text: `${num1}/${denom1} ${fracOp} ${num2}/${denom2}`,
      answer: rounded,
      displayAnswer: rounded.toString(),
    };
  }

  let a = rand(diff.minNumber, diff.maxNumber);
  let b = rand(diff.minNumber, diff.maxNumber);

  if (op === "-" && a < b) [a, b] = [b, a];
  if (op === "÷") {
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

export default function EllaRekenoefenScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const settings = useQuery(api.rekenoefeningen.getSettings);
  const saveScore = useMutation(api.ellaScores.saveScore);

  const [selectedDiff, setSelectedDiff] = useState<Difficulty | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);

  const startTimeRef = useRef(0);
  const questionStartRef = useRef(0);
  const inputRef = useRef<TextInput>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const hasAccess =
    user?.roles?.includes("admin") || user?.roles?.includes("ella");

  const startGame = useCallback((diff: Difficulty) => {
    setSelectedDiff(diff);
    const qs = Array.from({ length: diff.questionsPerRound }, () =>
      generateQuestion(diff),
    );
    setQuestions(qs);
    setCurrentIdx(0);
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
    if (!selectedDiff || finished) return;
    if (selectedDiff.timeLimitSeconds <= 0) return;

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - questionStartRef.current) / 1000,
      );
      const remaining = selectedDiff.timeLimitSeconds - elapsed;
      setTimeLeft(Math.max(0, remaining));
      if (remaining <= 0) {
        handleAnswer(true);
      }
    }, 250);

    return () => clearInterval(timerRef.current);
  }, [selectedDiff, currentIdx, finished]);

  const handleAnswer = useCallback(
    (timedOut = false) => {
      if (!selectedDiff || finished) return;
      const q = questions[currentIdx];
      if (!q) return;

      clearInterval(timerRef.current);
      const parsed = parseFloat(userAnswer);
      const isCorrect = !timedOut && Math.abs(parsed - q.answer) < 0.01;

      if (isCorrect) {
        const elapsed = (Date.now() - questionStartRef.current) / 1000;
        const halfTime = selectedDiff.timeLimitSeconds / 2;
        const bonus =
          selectedDiff.timeLimitSeconds > 0 && elapsed <= halfTime
            ? selectedDiff.speedBonus
            : 0;
        setScore((s) => s + selectedDiff.pointsPerCorrect + bonus);
        setCorrect((c) => c + 1);
        setFeedback("correct");
        // Pulse animation
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        setWrong((w) => w + 1);
        setFeedback("wrong");
        // Shake animation
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
        ]).start();
      }

      setTimeout(() => {
        setFeedback(null);
        const next = currentIdx + 1;
        if (next >= questions.length) {
          setFinished(true);
        } else {
          setCurrentIdx(next);
          setUserAnswer("");
          questionStartRef.current = Date.now();
          if (selectedDiff.timeLimitSeconds > 0) {
            setTimeLeft(selectedDiff.timeLimitSeconds);
          }
          inputRef.current?.focus();
        }
      }, 800);
    },
    [selectedDiff, questions, currentIdx, userAnswer, finished],
  );

  // Auto-focus input when moving to next question
  useEffect(() => {
    if (selectedDiff && !finished && questions.length > 0) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [currentIdx]);

  // Save score
  useEffect(() => {
    if (!finished || !selectedDiff || !user?._id) return;
    const totalTime = Math.round((Date.now() - startTimeRef.current) / 1000);
    const pct = (correct / questions.length) * 100;
    const stars =
      pct >= selectedDiff.star3Threshold
        ? 3
        : pct >= selectedDiff.star2Threshold
          ? 2
          : pct >= selectedDiff.star1Threshold
            ? 1
            : 0;

    saveScore({
      userId: user._id,
      game: "rekenoefeningen",
      timeSeconds: totalTime,
      correctAnswers: correct,
      totalQuestions: questions.length,
      stars,
      difficulty: selectedDiff.id,
    });
  }, [finished]);

  if (!hasAccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={{ fontSize: 48 }}>🔒</Text>
          <Text style={styles.noAccessText}>Geen toegang</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Finished ──────────────────────────────────────────────────
  if (finished && selectedDiff) {
    const pct = Math.round((correct / questions.length) * 100);
    const totalTime = Math.round((Date.now() - startTimeRef.current) / 1000);
    const stars =
      pct >= selectedDiff.star3Threshold
        ? 3
        : pct >= selectedDiff.star2Threshold
          ? 2
          : pct >= selectedDiff.star1Threshold
            ? 1
            : 0;

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.finishedCard}>
            <Text style={{ fontSize: 56, textAlign: "center" }}>
              {stars >= 3 ? "🌟" : stars >= 2 ? "⭐" : stars >= 1 ? "✨" : "💪"}
            </Text>
            <Text style={styles.finishedTitle}>Klaar!</Text>
            <Text style={styles.finishedSubtitle}>
              {selectedDiff.emoji} {selectedDiff.label}
            </Text>

            <View style={styles.statsGrid}>
              <View style={[styles.statBox, { backgroundColor: "#dcfce7" }]}>
                <Text style={[styles.statValue, { color: "#16a34a" }]}>
                  {correct}/{questions.length}
                </Text>
                <Text style={[styles.statLabel, { color: "#22c55e" }]}>
                  Juist
                </Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: "#dbeafe" }]}>
                <Text style={[styles.statValue, { color: "#2563eb" }]}>
                  {score}
                </Text>
                <Text style={[styles.statLabel, { color: "#3b82f6" }]}>
                  Punten
                </Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: "#f3e8ff" }]}>
                <Text style={[styles.statValue, { color: "#7c3aed" }]}>
                  {totalTime}s
                </Text>
                <Text style={[styles.statLabel, { color: "#8b5cf6" }]}>
                  Tijd
                </Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: "#fef3c7" }]}>
                <Text style={[styles.statValue, { color: "#d97706" }]}>
                  {"⭐".repeat(stars)}
                  {"☆".repeat(3 - stars)}
                </Text>
                <Text style={[styles.statLabel, { color: "#f59e0b" }]}>
                  Sterren
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => startGame(selectedDiff)}
            >
              <Text style={styles.primaryBtnText}>🔄 Opnieuw</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => {
                setSelectedDiff(null);
                setFinished(false);
              }}
            >
              <Text style={styles.secondaryBtnText}>Ander niveau</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Game in progress ──────────────────────────────────────────
  if (selectedDiff && questions.length > 0 && !finished) {
    const q = questions[currentIdx];
    const progress = ((currentIdx + 1) / questions.length) * 100;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.gameContainer}>
          {/* Header */}
          <View style={styles.gameHeader}>
            <Text style={styles.progressText}>
              Vraag {currentIdx + 1}/{questions.length}
            </Text>
            <Text style={styles.scoreText}>Score: {score}</Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>

          {/* Timer */}
          {selectedDiff.timeLimitSeconds > 0 && (
            <Text style={[styles.timer, timeLeft <= 5 && { color: "#ef4444" }]}>
              {timeLeft}s
            </Text>
          )}

          {/* Question */}
          <Animated.View
            style={[
              styles.questionBox,
              feedback === "correct" && { backgroundColor: "#dcfce7" },
              feedback === "wrong" && { backgroundColor: "#fee2e2" },
              {
                transform: [{ translateX: shakeAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.questionText}>{q.text} = ?</Text>
            {feedback === "wrong" && (
              <Text style={styles.correctAnswer}>
                Antwoord: {q.displayAnswer}
              </Text>
            )}
          </Animated.View>

          {/* Input */}
          <TextInput
            ref={inputRef}
            style={styles.input}
            keyboardType="decimal-pad"
            value={userAnswer}
            onChangeText={setUserAnswer}
            placeholder="Typ je antwoord..."
            editable={feedback === null}
            autoFocus
            onSubmitEditing={() => handleAnswer(false)}
          />

          <TouchableOpacity
            style={[
              styles.checkBtn,
              (!userAnswer || feedback !== null) && styles.checkBtnDisabled,
            ]}
            disabled={!userAnswer || feedback !== null}
            onPress={() => handleAnswer(false)}
          >
            <Text style={styles.checkBtnText}>Controleer</Text>
          </TouchableOpacity>

          {/* Quick stats */}
          <View style={styles.quickStats}>
            <Text style={styles.quickStatCorrect}>✓ {correct}</Text>
            <Text style={styles.quickStatWrong}>✗ {wrong}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Difficulty selection ───────────────────────────────────────
  const difficulties = settings?.difficulties ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Terug</Text>
          </TouchableOpacity>
          <Text style={styles.title}>➕ Rekenoefeningen</Text>
          <Text style={styles.subtitle}>Kies je niveau!</Text>
        </View>

        {difficulties.length === 0 ? (
          <View style={styles.centered}>
            <Text style={{ color: "#9ca3af" }}>Laden...</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {difficulties.map((diff) => (
              <TouchableOpacity
                key={diff.id}
                style={styles.diffCard}
                onPress={() => startGame(diff as Difficulty)}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 48 }}>{diff.emoji}</Text>
                <Text style={styles.diffLabel}>{diff.label}</Text>
                <Text style={styles.diffInfo}>
                  {diff.questionsPerRound} vragen • {diff.minNumber}-
                  {diff.maxNumber}
                </Text>
                <Text style={styles.diffOps}>
                  {[
                    diff.addition && "+",
                    diff.subtraction && "−",
                    diff.multiplication && "×",
                    diff.division && "÷",
                    diff.fractions && "½",
                  ]
                    .filter(Boolean)
                    .join("  ")}
                </Text>
                {diff.timeLimitSeconds > 0 && (
                  <Text style={styles.diffTime}>
                    ⏱ {diff.timeLimitSeconds}s per vraag
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef2ff" },
  scrollContent: { padding: spacing.lg },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  noAccessText: {
    fontSize: fontSize.lg,
    color: colors.textLight,
    marginTop: spacing.md,
  },

  // Header
  header: { marginBottom: spacing.xl },
  backBtn: {
    fontSize: fontSize.sm,
    color: "#4f46e5",
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#3730a3",
    textAlign: "center",
  },
  subtitle: {
    fontSize: fontSize.base,
    color: "#4338ca",
    textAlign: "center",
    marginTop: spacing.xs,
    opacity: 0.7,
  },

  // Difficulty grid
  grid: { gap: spacing.md },
  diffCard: {
    backgroundColor: "#fff",
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#c7d2fe",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  diffLabel: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: "#312e81",
    marginTop: spacing.sm,
  },
  diffInfo: {
    fontSize: fontSize.sm,
    color: "#4338ca",
    marginTop: spacing.xs,
    opacity: 0.7,
  },
  diffOps: {
    fontSize: fontSize.lg,
    color: "#4338ca",
    marginTop: spacing.xs,
    letterSpacing: 4,
  },
  diffTime: { fontSize: fontSize.xs, color: "#6366f1", marginTop: spacing.xs },

  // Game
  gameContainer: { flex: 1, padding: spacing.lg },
  gameHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  progressText: { fontSize: fontSize.sm, color: "#6b7280" },
  scoreText: { fontSize: fontSize.sm, fontWeight: "600", color: "#4f46e5" },
  progressBar: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    marginBottom: spacing.lg,
  },
  progressFill: { height: 6, backgroundColor: "#6366f1", borderRadius: 3 },
  timer: {
    fontSize: 32,
    fontWeight: "700",
    color: "#374151",
    textAlign: "center",
    marginBottom: spacing.md,
  },
  questionBox: {
    backgroundColor: "#f9fafb",
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  questionText: { fontSize: 28, fontWeight: "700", color: "#1f2937" },
  correctAnswer: {
    fontSize: fontSize.sm,
    color: "#ef4444",
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderRadius: borderRadius.xl,
    fontSize: 24,
    textAlign: "center",
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  checkBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: "center",
  },
  checkBtnDisabled: { backgroundColor: "#d1d5db" },
  checkBtnText: { color: "#fff", fontSize: fontSize.lg, fontWeight: "700" },
  quickStats: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: spacing.md,
  },
  quickStatCorrect: {
    fontSize: fontSize.base,
    color: "#16a34a",
    fontWeight: "600",
  },
  quickStatWrong: {
    fontSize: fontSize.base,
    color: "#ef4444",
    fontWeight: "600",
  },

  // Finished
  finishedCard: {
    backgroundColor: "#fff",
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginTop: spacing.xl,
  },
  finishedTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1f2937",
    marginTop: spacing.md,
  },
  finishedSubtitle: {
    fontSize: fontSize.base,
    color: "#6b7280",
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  statBox: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: "center",
    minWidth: 130,
  },
  statValue: { fontSize: fontSize.xl, fontWeight: "700" },
  statLabel: { fontSize: fontSize.xs, marginTop: 2 },
  primaryBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
    width: "100%",
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontSize: fontSize.lg, fontWeight: "700" },
  secondaryBtn: {
    backgroundColor: "#f3f4f6",
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    width: "100%",
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#374151",
    fontSize: fontSize.base,
    fontWeight: "600",
  },
});
