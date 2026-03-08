import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery, useMutation } from "convex/react";
import { Audio } from "expo-av";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "../../contexts/AuthContext";
import { colors, fontSize, spacing, borderRadius } from "../../styles/theme";
import type { MainStackParamList } from "../../navigation/types";

type Nav = NativeStackNavigationProp<MainStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SOUND_BASE = "https://buitenzijnvzw.be/ella/sounds";
const CHOICES_COUNT = 3;

// ── Types ───────────────────────────────────────────────────────────
interface Dino {
  _id: string;
  nummer: number;
  nederlandseNaam: string;
  wetenschappelijkeNaam: string;
  korteBeschrijving: string;
  leukWeetje: string;
  imageUrl: string | null;
}

// ── Audio helper ────────────────────────────────────────────────────
let audioModeConfigured = false;

async function ensureAudioMode() {
  if (audioModeConfigured) return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });
    audioModeConfigured = true;
  } catch {
    /* ignore */
  }
}

async function playSound(name: string) {
  try {
    await ensureAudioMode();
    const { sound } = await Audio.Sound.createAsync(
      { uri: `${SOUND_BASE}/${name}` },
      { shouldPlay: true, volume: 1.0 },
    );
    sound.setOnPlaybackStatusUpdate((status) => {
      if ("didJustFinish" in status && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
      }
    });
  } catch {
    /* ignore – sounds are optional */
  }
}

// ── Shuffle helper ──────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ── Game states ─────────────────────────────────────────────────────
type GamePhase = "loading" | "question" | "correct" | "wrong" | "finished";

// ── Component ───────────────────────────────────────────────────────
export default function EllaDinoQuizScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();

  // Fetch all dinos
  const allDinos = useQuery(api.dinosaurs.getAll) as Dino[] | undefined;
  const saveScore = useMutation(api.ellaScores.saveScore);

  // Game state
  const [phase, setPhase] = useState<GamePhase>("loading");
  const [queue, setQueue] = useState<Dino[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const startTimeRef = useRef(0);

  // Animations
  const imageScale = useRef(new Animated.Value(0)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const infoSlide = useRef(new Animated.Value(300)).current;
  const shakeDelta = useRef(new Animated.Value(0)).current;
  const scoreScale = useRef(new Animated.Value(1)).current;
  const starOpacity = useRef(new Animated.Value(0)).current;
  const starTranslateY = useRef(new Animated.Value(0)).current;

  // Access check
  const hasAccess =
    user?.roles?.includes("admin") || user?.roles?.includes("ella");

  // ── Start / restart ───────────────────────────────────────────────
  const startGame = useCallback(() => {
    if (!allDinos || allDinos.length < CHOICES_COUNT) return;

    // Only use dinos that have images
    const withImages = allDinos.filter((d) => d.imageUrl);
    if (withImages.length < CHOICES_COUNT) return;

    const shuffled = shuffle(withImages);
    setQueue(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setPhase("question");
    startTimeRef.current = Date.now();
  }, [allDinos]);

  // Generate choices whenever currentIndex / queue changes
  useEffect(() => {
    if (phase !== "question" || queue.length === 0) return;
    if (currentIndex >= queue.length) {
      setPhase("finished");
      return;
    }

    const correct = queue[currentIndex];
    // Pick wrong answers from ALL dinos (including ones without images)
    const others = (allDinos || []).filter((d) => d._id !== correct._id);
    const wrongPicks = shuffle(others).slice(0, CHOICES_COUNT - 1);
    const options = shuffle([
      correct.nederlandseNaam,
      ...wrongPicks.map((d) => d.nederlandseNaam),
    ]);
    setChoices(options);
    setSelectedAnswer(null);

    // Animate entrance
    imageScale.setValue(0);
    buttonsOpacity.setValue(0);
    infoSlide.setValue(300);

    Animated.sequence([
      Animated.spring(imageScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(buttonsOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [phase, currentIndex, queue]);

  // Start game when dinos arrive
  useEffect(() => {
    if (allDinos && allDinos.length >= CHOICES_COUNT && phase === "loading") {
      startGame();
    }
  }, [allDinos, startGame, phase]);

  // ── Handle answer ─────────────────────────────────────────────────
  const handleAnswer = useCallback(
    (answer: string) => {
      if (selectedAnswer || phase !== "question") return;
      setSelectedAnswer(answer);
      const correct = queue[currentIndex];
      const isCorrect = answer === correct.nederlandseNaam;

      if (isCorrect) {
        setScore((s) => s + 1);
        setPhase("correct");
        playSound("correct.mp3");

        // Score pop animation
        Animated.sequence([
          Animated.timing(scoreScale, {
            toValue: 1.5,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.spring(scoreScale, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
          }),
        ]).start();

        // Star burst animation
        starOpacity.setValue(1);
        starTranslateY.setValue(0);
        Animated.parallel([
          Animated.timing(starTranslateY, {
            toValue: -60,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(starOpacity, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();

        // Slide in info panel
        Animated.spring(infoSlide, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();
      } else {
        setPhase("wrong");
        playSound("bomb.mp3");

        // Shake animation
        Animated.sequence([
          Animated.timing(shakeDelta, {
            toValue: 10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeDelta, {
            toValue: -10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeDelta, {
            toValue: 8,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeDelta, {
            toValue: -8,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeDelta, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
        ]).start();

        // Auto proceed after delay
        setTimeout(() => {
          goNext();
        }, 1500);
      }
    },
    [selectedAnswer, phase, queue, currentIndex],
  );

  // ── Next question ─────────────────────────────────────────────────
  const goNext = useCallback(() => {
    const next = currentIndex + 1;
    if (next >= queue.length) {
      setPhase("finished");
      playSound("complete.mp3");
      // Save score
      const timeSeconds = Math.round(
        (Date.now() - startTimeRef.current) / 1000,
      );
      if (user?._id) {
        saveScore({
          userId: user._id,
          game: "dino_quiz",
          timeSeconds,
          correctAnswers: score,
          totalQuestions: queue.length,
        }).catch(() => {});
      }
    } else {
      setCurrentIndex(next);
      setPhase("question");
    }
  }, [currentIndex, queue.length]);

  // ── Renders ───────────────────────────────────────────────────────
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

  if (phase === "loading" || !allDinos) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Dino&apos;s laden...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === "finished") {
    const total = queue.length;
    const pct = Math.round((score / total) * 100);
    const emoji =
      pct === 100 ? "🏆" : pct >= 70 ? "🌟" : pct >= 40 ? "👍" : "💪";

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={{ fontSize: 64 }}>{emoji}</Text>
          <Text style={styles.finishedTitle}>Quiz klaar!</Text>
          <Text style={styles.finishedScore}>
            {score} / {total} juist ({pct}%)
          </Text>
          <TouchableOpacity style={styles.playAgainBtn} onPress={startGame}>
            <Text style={styles.playAgainText}>🔄 Opnieuw spelen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Terug</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentDino = queue[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header row */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Terug</Text>
        </TouchableOpacity>
        <Animated.Text
          style={[styles.scoreText, { transform: [{ scale: scoreScale }] }]}
        >
          ⭐ {score}
        </Animated.Text>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {queue.length}
        </Text>
      </View>

      {/* Question */}
      <View style={styles.questionArea}>
        <Text style={styles.questionLabel}>Welke dinosaurus is dit?</Text>

        {/* Dino image */}
        <Animated.View
          style={[
            styles.imageWrapper,
            {
              transform: [{ scale: imageScale }, { translateX: shakeDelta }],
            },
          ]}
        >
          {currentDino.imageUrl && (
            <Image
              source={{ uri: currentDino.imageUrl }}
              style={styles.dinoImage}
              resizeMode="cover"
            />
          )}

          {/* Star burst overlay */}
          <Animated.Text
            style={[
              styles.starBurst,
              {
                opacity: starOpacity,
                transform: [{ translateY: starTranslateY }],
              },
            ]}
          >
            ⭐
          </Animated.Text>
        </Animated.View>

        {/* Answer buttons */}
        <Animated.View
          style={[styles.choicesContainer, { opacity: buttonsOpacity }]}
        >
          {choices.map((name) => {
            const isSelected = selectedAnswer === name;
            const isCorrectName = name === currentDino.nederlandseNaam;

            let btnStyle = styles.choiceBtn;
            if (selectedAnswer) {
              if (isCorrectName) {
                btnStyle = { ...styles.choiceBtn, ...styles.correctBtn };
              } else if (isSelected && !isCorrectName) {
                btnStyle = { ...styles.choiceBtn, ...styles.wrongBtn };
              }
            }

            return (
              <TouchableOpacity
                key={name}
                style={btnStyle}
                onPress={() => handleAnswer(name)}
                disabled={!!selectedAnswer}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.choiceText,
                    selectedAnswer && isCorrectName && styles.correctText,
                    selectedAnswer &&
                      isSelected &&
                      !isCorrectName &&
                      styles.wrongText,
                  ]}
                >
                  {selectedAnswer && isCorrectName ? "✅ " : ""}
                  {selectedAnswer && isSelected && !isCorrectName ? "❌ " : ""}
                  {name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </View>

      {/* Info panel on correct answer */}
      {phase === "correct" && (
        <Animated.View
          style={[styles.infoPanel, { transform: [{ translateY: infoSlide }] }]}
        >
          <Text style={styles.infoTitle}>🦕 {currentDino.nederlandseNaam}</Text>
          <Text style={styles.infoScientific}>
            {currentDino.wetenschappelijkeNaam}
          </Text>
          <Text style={styles.infoDesc}>{currentDino.korteBeschrijving}</Text>
          <View style={styles.funFactBox}>
            <Text style={styles.funFactLabel}>💡 Leuk weetje</Text>
            <Text style={styles.funFactText}>{currentDino.leukWeetje}</Text>
          </View>
          <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
            <Text style={styles.nextBtnText}>Volgende →</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

// ── Styles ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecfdf5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  noAccessText: {
    fontSize: fontSize.lg,
    color: colors.textLight,
    marginTop: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.base,
    color: "#059669",
    marginTop: spacing.md,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    fontSize: fontSize.sm,
    color: "#059669",
    fontWeight: "600",
  },
  scoreText: {
    fontSize: fontSize.xl,
    fontWeight: "800",
    color: "#065f46",
  },
  progressText: {
    fontSize: fontSize.sm,
    color: "#6b7280",
    fontWeight: "500",
  },

  // Question area
  questionArea: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  questionLabel: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: "#065f46",
    marginBottom: spacing.md,
    textAlign: "center",
  },

  // Image
  imageWrapper: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.55,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    backgroundColor: "#d1fae5",
    borderWidth: 3,
    borderColor: "#6ee7b7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: spacing.lg,
  },
  dinoImage: {
    width: "100%",
    height: "100%",
  },
  starBurst: {
    position: "absolute",
    top: "30%",
    left: "40%",
    fontSize: 48,
  },

  // Choices
  choicesContainer: {
    width: "100%",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  choiceBtn: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#a7f3d0",
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  correctBtn: {
    backgroundColor: "#d1fae5",
    borderColor: "#059669",
  },
  wrongBtn: {
    backgroundColor: "#fee2e2",
    borderColor: "#ef4444",
  },
  choiceText: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: "#065f46",
  },
  correctText: {
    color: "#059669",
  },
  wrongText: {
    color: "#ef4444",
  },

  // Info panel
  infoPanel: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#065f46",
  },
  infoScientific: {
    fontSize: fontSize.sm,
    color: "#059669",
    fontStyle: "italic",
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  infoDesc: {
    fontSize: fontSize.base,
    color: "#374151",
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  funFactBox: {
    backgroundColor: "#fef3c7",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  funFactLabel: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 4,
  },
  funFactText: {
    fontSize: fontSize.sm,
    color: "#78350f",
    lineHeight: 20,
  },
  nextBtn: {
    backgroundColor: "#059669",
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  nextBtnText: {
    color: "#ffffff",
    fontSize: fontSize.lg,
    fontWeight: "700",
  },

  // Finished
  finishedTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#065f46",
    marginTop: spacing.md,
  },
  finishedScore: {
    fontSize: fontSize.xl,
    color: "#059669",
    fontWeight: "600",
    marginTop: spacing.sm,
  },
  playAgainBtn: {
    backgroundColor: "#059669",
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing["2xl"],
    marginTop: spacing.xl,
  },
  playAgainText: {
    color: "#ffffff",
    fontSize: fontSize.lg,
    fontWeight: "700",
  },
  backButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButtonText: {
    fontSize: fontSize.base,
    color: "#6b7280",
  },
});
