import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery, useMutation } from "convex/react";
import { createAudioPlayer } from "expo-audio";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "../../contexts/AuthContext";
import { colors, fontSize, spacing, borderRadius } from "../../styles/theme";
import type { MainStackParamList } from "../../navigation/types";

type Nav = NativeStackNavigationProp<MainStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SOUND_BASE = "https://buitenzijnvzw.be/ella/sounds";

// ── Types ───────────────────────────────────────────────────────────
interface Card {
  id: number;
  emoji: string;
  groupId: number;
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

interface Theme {
  _id: string;
  name: string;
  emoji: string;
  emojis: string[];
  active: boolean;
}

type ConfigStep = "theme" | "matchCount" | "grid" | "playing" | "finished";

// ── Grid options per match count ────────────────────────────────────
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

// ── Helpers ──────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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

async function playSound(name: string) {
  try {
    const player = createAudioPlayer({ uri: `${SOUND_BASE}/${name}` });
    player.play();
  } catch {
    /* sounds are optional */
  }
}

function formatTime(s: number) {
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// ── Component ───────────────────────────────────────────────────────
export default function EllaMemoryScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const themes = useQuery(api.memoryGame.getActiveThemes) as
    | Theme[]
    | undefined;
  const saveScore = useMutation(api.ellaScores.saveScore);

  const hasAccess =
    user?.roles?.includes("admin") || user?.roles?.includes("ella");

  // Config state
  const [configStep, setConfigStep] = useState<ConfigStep>("theme");
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [matchCount, setMatchCount] = useState<MatchCount>(2);
  const [selectedGrid, setSelectedGrid] = useState<GridOption | null>(null);

  // Game state
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [totalGroups, setTotalGroups] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Card flip animations
  const flipAnims = useRef<Animated.Value[]>([]);

  // Timer
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

  // Start game
  const doStartGame = useCallback(
    (grid: GridOption) => {
      if (!selectedTheme || !themes) return;

      const theme = themes.find((t) => t._id === selectedTheme);
      if (!theme) return;

      const totalCards = grid.rows * grid.cols;
      const newCards = buildCards(theme.emojis, totalCards, matchCount);
      const groups = totalCards / matchCount;

      // Init flip animations
      flipAnims.current = newCards.map(() => new Animated.Value(0));

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

  // Handle card click
  const handleCardClick = useCallback(
    (cardId: number) => {
      if (isChecking) return;

      const card = cards[cardId];
      if (!card || card.isFlipped || card.isMatched) return;

      // Animate flip
      Animated.spring(flipAnims.current[cardId], {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 10,
      }).start();

      const newFlipped = [...flippedIds, cardId];
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)),
      );
      setFlippedIds(newFlipped);

      if (newFlipped.length === matchCount) {
        setIsChecking(true);
        setAttempts((prev) => prev + 1);

        const flippedCards = newFlipped.map((id) => cards[id]);
        const allMatch = flippedCards.every(
          (c) => c.groupId === flippedCards[0].groupId,
        );

        setTimeout(() => {
          if (allMatch) {
            playSound("succes.wav");
            setCards((prev) =>
              prev.map((c) =>
                newFlipped.includes(c.id)
                  ? { ...c, isMatched: true, isFlipped: true }
                  : c,
              ),
            );
            setMatchedCount((prev) => prev + 1);
          } else {
            playSound("fail.mp3");
            // Flip back animation
            for (const id of newFlipped) {
              Animated.spring(flipAnims.current[id], {
                toValue: 0,
                useNativeDriver: true,
                friction: 8,
                tension: 10,
              }).start();
            }
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

  // Win condition
  useEffect(() => {
    if (
      configStep === "playing" &&
      totalGroups > 0 &&
      matchedCount === totalGroups
    ) {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
      playSound("completed.mp3");
      setConfigStep("finished");
    }
  }, [matchedCount, totalGroups, configStep, startTime]);

  // Save score
  useEffect(() => {
    if (configStep === "finished" && user && !scoreSaved) {
      setScoreSaved(true);
      const theme = themes?.find((t) => t._id === selectedTheme);
      saveScore({
        userId: user._id,
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

  // ── No access ─────────────────────────────────────────────────────
  if (!hasAccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={{ fontSize: 48 }}>🔒</Text>
          <Text style={styles.noAccessText}>Geen toegang</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── THEME SELECTION ───────────────────────────────────────────────
  if (configStep === "theme") {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Terug</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>🧠 Memory</Text>
          <Text style={styles.pageSubtitle}>Kies een thema</Text>

          {!themes ? (
            <Text style={styles.loadingText}>Thema's laden...</Text>
          ) : themes.length === 0 ? (
            <Text style={styles.loadingText}>Geen thema's beschikbaar.</Text>
          ) : (
            <View style={styles.optionsGrid}>
              {themes.map((theme) => (
                <TouchableOpacity
                  key={theme._id}
                  style={styles.optionCard}
                  onPress={() => {
                    setSelectedTheme(theme._id);
                    setConfigStep("matchCount");
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionEmoji}>{theme.emoji}</Text>
                  <Text style={styles.optionTitle}>{theme.name}</Text>
                  <Text style={styles.optionSubtext}>
                    {theme.emojis.length} emoji's
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── MATCH COUNT SELECTION ─────────────────────────────────────────
  if (configStep === "matchCount") {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity onPress={() => setConfigStep("theme")}>
            <Text style={styles.backBtn}>← Terug</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>🧠 Memory</Text>
          <Text style={styles.pageSubtitle}>
            Hoeveel dezelfde kaarten zoeken?
          </Text>

          <View style={styles.matchRow}>
            <TouchableOpacity
              style={styles.matchCard}
              onPress={() => {
                setMatchCount(2);
                setSelectedGrid(null);
                setConfigStep("grid");
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.optionEmoji}>👯</Text>
              <Text style={styles.optionTitle}>Paren</Text>
              <Text style={styles.optionSubtext}>Vind 2 dezelfde kaarten</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.matchCard}
              onPress={() => {
                setMatchCount(3);
                setSelectedGrid(null);
                setConfigStep("grid");
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.optionEmoji}>👯‍♂️</Text>
              <Text style={styles.optionTitle}>Trio's</Text>
              <Text style={styles.optionSubtext}>Vind 3 dezelfde kaarten</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── GRID SIZE SELECTION ───────────────────────────────────────────
  if (configStep === "grid") {
    const options = GRID_OPTIONS[String(matchCount)];
    const theme = themes?.find((t) => t._id === selectedTheme);
    const availableEmojis = theme?.emojis.length ?? 0;

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity onPress={() => setConfigStep("matchCount")}>
            <Text style={styles.backBtn}>← Terug</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>🧠 Memory</Text>
          <Text style={styles.pageSubtitle}>Kies de grootte</Text>

          <View style={styles.optionsGrid}>
            {options.map((opt) => {
              const totalCards = opt.rows * opt.cols;
              const neededEmojis = totalCards / matchCount;
              const disabled = neededEmojis > availableEmojis;

              return (
                <TouchableOpacity
                  key={opt.label}
                  style={[
                    styles.optionCard,
                    disabled && styles.optionCardDisabled,
                  ]}
                  disabled={disabled}
                  onPress={() => doStartGame(opt)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.gridLabel, disabled && { color: "#ccc" }]}
                  >
                    {opt.label}
                  </Text>
                  <Text style={styles.optionSubtext}>{opt.description}</Text>
                  {disabled && (
                    <Text style={styles.disabledText}>Te weinig emoji's</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── FINISHED SCREEN ───────────────────────────────────────────────
  if (configStep === "finished") {
    const theme = themes?.find((t) => t._id === selectedTheme);
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.finishedCard}>
            <Text style={{ fontSize: 64 }}>🎉</Text>
            <Text style={styles.finishedTitle}>Gewonnen!</Text>
            <Text style={styles.finishedSubtext}>
              Je hebt alle {matchCount === 2 ? "paren" : "trio's"} gevonden!
            </Text>

            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: "#fdf2f8" }]}>
                <Text style={[styles.statValue, { color: "#db2777" }]}>
                  {attempts}
                </Text>
                <Text style={styles.statLabel}>Pogingen</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: "#faf5ff" }]}>
                <Text style={[styles.statValue, { color: "#9333ea" }]}>
                  {formatTime(elapsed)}
                </Text>
                <Text style={styles.statLabel}>Tijd</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: "#f5f3ff" }]}>
                <Text style={[styles.statValue, { color: "#7c3aed" }]}>
                  {selectedGrid?.label}
                </Text>
                <Text style={styles.statLabel}>Speelveld</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: "#fdf4ff" }]}>
                <Text style={[styles.statValue, { color: "#a855f7" }]}>
                  {theme?.emoji} {theme?.name}
                </Text>
                <Text style={styles.statLabel}>Thema</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => selectedGrid && doStartGame(selectedGrid)}
            >
              <Text style={styles.primaryBtnText}>🔄 Opnieuw spelen</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => {
                setConfigStep("theme");
                setSelectedTheme(null);
                setSelectedGrid(null);
              }}
            >
              <Text style={styles.secondaryBtnText}>
                🎯 Andere instellingen
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backLink}>← Terug naar Varia</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── GAME BOARD ────────────────────────────────────────────────────
  const cols = selectedGrid?.cols ?? 4;
  const gap = 6;
  const cardSize = (SCREEN_WIDTH - spacing.lg * 2 - gap * (cols - 1)) / cols;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header bar */}
      <View style={styles.gameHeader}>
        <TouchableOpacity
          onPress={() => {
            if (timerRef.current) clearInterval(timerRef.current);
            setConfigStep("theme");
            setSelectedTheme(null);
            setSelectedGrid(null);
          }}
        >
          <Text style={styles.stopBtn}>✕ Stop</Text>
        </TouchableOpacity>
        <Text style={styles.gameTitle}>🧠 Memory</Text>
        <Text style={styles.themeLabel}>
          {themes?.find((t) => t._id === selectedTheme)?.emoji}{" "}
          {themes?.find((t) => t._id === selectedTheme)?.name}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.gameStats}>
        <View style={styles.gameStat}>
          <Text style={[styles.gameStatValue, { color: "#db2777" }]}>
            {attempts}
          </Text>
          <Text style={styles.gameStatLabel}>Pogingen</Text>
        </View>
        <View style={styles.gameStat}>
          <Text style={[styles.gameStatValue, { color: "#ec4899" }]}>
            {matchedCount}/{totalGroups}
          </Text>
          <Text style={styles.gameStatLabel}>Gevonden</Text>
        </View>
        <View style={styles.gameStat}>
          <Text style={[styles.gameStatValue, { color: "#9333ea" }]}>
            {formatTime(elapsed)}
          </Text>
          <Text style={styles.gameStatLabel}>Tijd</Text>
        </View>
      </View>

      {/* Card Grid */}
      <ScrollView contentContainerStyle={styles.gridContainer}>
        <View style={[styles.grid, { gap }]}>
          {cards.map((card) => {
            const flipAnim = flipAnims.current[card.id];
            const frontRotation = flipAnim
              ? flipAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "180deg"],
                })
              : "0deg";
            const backRotation = flipAnim
              ? flipAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["180deg", "360deg"],
                })
              : "180deg";

            return (
              <TouchableOpacity
                key={card.id}
                activeOpacity={0.8}
                disabled={card.isFlipped || card.isMatched || isChecking}
                onPress={() => handleCardClick(card.id)}
                style={{ width: cardSize, height: cardSize }}
              >
                {/* Back of card (question mark) */}
                <Animated.View
                  style={[
                    styles.cardFace,
                    card.isMatched
                      ? styles.cardMatched
                      : card.isFlipped
                        ? styles.cardFlipped
                        : styles.cardBack,
                    {
                      width: cardSize,
                      height: cardSize,
                      transform: [{ rotateY: frontRotation }],
                      backfaceVisibility: "hidden",
                      position: "absolute",
                    },
                  ]}
                >
                  <Text style={styles.cardQuestion}>❓</Text>
                </Animated.View>

                {/* Front of card (emoji) */}
                <Animated.View
                  style={[
                    styles.cardFace,
                    card.isMatched ? styles.cardMatched : styles.cardFlipped,
                    {
                      width: cardSize,
                      height: cardSize,
                      transform: [{ rotateY: backRotation }],
                      backfaceVisibility: "hidden",
                      position: "absolute",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.cardEmoji,
                      card.isMatched && { opacity: 0.6 },
                    ]}
                  >
                    {card.emoji}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdf2f8",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noAccessText: {
    fontSize: fontSize.lg,
    color: colors.textLight,
    marginTop: spacing.md,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  backBtn: {
    fontSize: fontSize.sm,
    color: "#db2777",
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#831843",
    textAlign: "center",
  },
  pageSubtitle: {
    fontSize: fontSize.base,
    color: "#9d174d",
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    opacity: 0.7,
  },
  loadingText: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: spacing.xl,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "center",
  },
  optionCard: {
    backgroundColor: "#fff",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: "center",
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2 - 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  optionCardDisabled: {
    opacity: 0.4,
  },
  optionEmoji: {
    fontSize: 44,
    marginBottom: spacing.sm,
  },
  optionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: "#1f2937",
  },
  optionSubtext: {
    fontSize: fontSize.xs,
    color: "#9ca3af",
    marginTop: 4,
    textAlign: "center",
  },
  gridLabel: {
    fontSize: 28,
    fontWeight: "800",
    color: "#db2777",
    marginBottom: spacing.xs,
  },
  disabledText: {
    fontSize: fontSize.xs,
    color: "#ef4444",
    marginTop: 4,
  },
  matchRow: {
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "center",
  },
  matchCard: {
    backgroundColor: "#fff",
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: "center",
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  // Finished screen
  finishedCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: "center",
    marginTop: spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  finishedTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1f2937",
    marginTop: spacing.sm,
  },
  finishedSubtext: {
    fontSize: fontSize.base,
    color: "#6b7280",
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
    width: "100%",
  },
  statBox: {
    flex: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: "#9ca3af",
    marginTop: 2,
  },
  primaryBtn: {
    backgroundColor: "#db2777",
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    width: "100%",
    alignItems: "center",
    marginTop: spacing.md,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: fontSize.base,
    fontWeight: "700",
  },
  secondaryBtn: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#fbcfe8",
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    width: "100%",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  secondaryBtnText: {
    color: "#db2777",
    fontSize: fontSize.base,
    fontWeight: "700",
  },
  backLink: {
    fontSize: fontSize.sm,
    color: "#9ca3af",
    marginTop: spacing.lg,
  },
  // Game playing header
  gameHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  stopBtn: {
    color: "#db2777",
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  gameTitle: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: "#db2777",
  },
  themeLabel: {
    fontSize: fontSize.sm,
    color: "#9ca3af",
  },
  gameStats: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  gameStat: {
    backgroundColor: "#fff",
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  gameStatValue: {
    fontSize: fontSize.lg,
    fontWeight: "700",
  },
  gameStatLabel: {
    fontSize: 10,
    color: "#9ca3af",
  },
  // Card grid
  gridContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  cardFace: {
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardBack: {
    backgroundColor: "#db2777",
  },
  cardFlipped: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#f9a8d4",
  },
  cardMatched: {
    backgroundColor: "#dcfce7",
    borderWidth: 2,
    borderColor: "#86efac",
  },
  cardQuestion: {
    fontSize: 24,
    opacity: 0.6,
  },
  cardEmoji: {
    fontSize: 28,
  },
});
