import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "convex/react";
import { Audio } from "expo-av";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  colors,
  fontSize,
  spacing,
  borderRadius,
  fontWeight,
} from "../../styles/theme";
import type { MainStackParamList } from "../../navigation/types";

type Nav = NativeStackNavigationProp<MainStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SOUND_BASE = "https://buitenzijnvzw.be/ella/sounds";

// ── Types ───────────────────────────────────────────────────────────
interface Planet {
  _id: string;
  nummer: number;
  nederlandseNaam: string;
  wetenschappelijkeNaam: string;
  korteBeschrijving: string;
  leukWeetje: string;
  imageUrl: string | null;
}

// ── Planet emoji lookup ─────────────────────────────────────────────
const PLANET_EMOJIS: Record<number, string> = {
  1: "☿️",
  2: "♀️",
  3: "🌍",
  4: "🔴",
  5: "🟠",
  6: "🪐",
  7: "🔵",
  8: "💙",
  9: "⚪",
};

// ── Grid options ────────────────────────────────────────────────────
const GRID_OPTIONS = [
  { value: 3, label: "3×3", emoji: "⭐" },
  { value: 4, label: "4×4", emoji: "⭐⭐" },
  { value: 5, label: "5×5", emoji: "⭐⭐⭐" },
];

// ── Shuffle (Fisher-Yates, ensures not solved) ──────────────────────
function shuffleArray(arr: number[]): number[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (a.every((v, i) => v === i) && a.length > 1) {
    [a[0], a[1]] = [a[1], a[0]];
  }
  return a;
}

// ── Sound helper ────────────────────────────────────────────────────
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
    /* sounds are optional */
  }
}

// ── Game phases ─────────────────────────────────────────────────────
type GamePhase = "select" | "loading" | "playing" | "completed";

// ══════════════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════════════
export default function EllaPlanetPuzzelScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();

  // Convex data
  const allPlanets = useQuery(api.planets.getAll) as Planet[] | undefined;
  const puzzleSettings = useQuery(api.planets.getPuzzleSettings);

  // State
  const [phase, setPhase] = useState<GamePhase>("select");
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [gridSize, setGridSize] = useState(4);
  const [board, setBoard] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [completedPlanets, setCompletedPlanets] = useState<Set<string>>(
    new Set(),
  );

  // Animations
  const completionScale = useRef(new Animated.Value(0)).current;
  const starScale = useRef(new Animated.Value(0)).current;

  const hasAccess =
    user?.roles?.includes("admin") || user?.roles?.includes("ella");

  // Sync grid size from settings
  useEffect(() => {
    if (puzzleSettings) {
      setGridSize(puzzleSettings.piecesPerSide);
    }
  }, [puzzleSettings]);

  // ── Piece size computation ────────────────────────────────────────
  const puzzleContainerSize = useMemo(() => {
    const padding = spacing.lg * 2;
    const maxSize = SCREEN_WIDTH - padding;
    return Math.min(maxSize, 400);
  }, []);

  const pieceSize = useMemo(() => {
    const gap = 2;
    return (puzzleContainerSize - gap * (gridSize - 1)) / gridSize;
  }, [puzzleContainerSize, gridSize]);

  // ── Start puzzle ──────────────────────────────────────────────────
  const startPuzzle = useCallback(
    (planet: Planet) => {
      if (!planet.imageUrl) return;
      setSelectedPlanet(planet);
      setMoves(0);
      setSelected(null);
      setPhase("loading");

      // Build shuffled board indices
      const total = gridSize * gridSize;
      const indices = Array.from({ length: total }, (_, i) => i);
      setBoard(shuffleArray(indices));

      // Small delay for loading state
      setTimeout(() => setPhase("playing"), 300);
    },
    [gridSize],
  );

  // ── Handle piece tap (swap mechanic) ──────────────────────────────
  const handlePieceTap = useCallback(
    (index: number) => {
      if (phase !== "playing") return;

      if (selected === null) {
        setSelected(index);
        playSound("succes.wav");
      } else if (selected === index) {
        setSelected(null);
      } else {
        // Swap
        setBoard((prev) => {
          const next = [...prev];
          [next[selected], next[index]] = [next[index], next[selected]];

          // Check solved
          const isSolved = next.every((v, i) => v === i);
          if (isSolved) {
            setTimeout(() => {
              playSound("completed.mp3");
              setPhase("completed");
              if (selectedPlanet) {
                setCompletedPlanets((prev) => {
                  const s = new Set(prev);
                  s.add(selectedPlanet._id);
                  return s;
                });
              }

              // Animate completion
              completionScale.setValue(0);
              starScale.setValue(0);
              Animated.sequence([
                Animated.spring(completionScale, {
                  toValue: 1,
                  friction: 5,
                  tension: 80,
                  useNativeDriver: true,
                }),
                Animated.spring(starScale, {
                  toValue: 1,
                  friction: 4,
                  tension: 60,
                  useNativeDriver: true,
                }),
              ]).start();
            }, 200);
          }

          return next;
        });
        setSelected(null);
        setMoves((m) => m + 1);
      }
    },
    [selected, phase, selectedPlanet],
  );

  // ── Star rating ───────────────────────────────────────────────────
  const getStars = useCallback(
    (moveCount: number) => {
      const total = gridSize * gridSize;
      if (moveCount <= total) return 3;
      if (moveCount <= total * 2) return 2;
      return 1;
    },
    [gridSize],
  );

  // ── Go to next planet ─────────────────────────────────────────────
  const goToNextPlanet = useCallback(() => {
    if (!selectedPlanet || !allPlanets) return;
    const idx = allPlanets.findIndex((p) => p._id === selectedPlanet._id);
    const nextIdx = (idx + 1) % allPlanets.length;
    const next = allPlanets[nextIdx];
    if (next?.imageUrl) {
      startPuzzle(next);
    }
  }, [selectedPlanet, allPlanets, startPuzzle]);

  // ── Back to planet list ───────────────────────────────────────────
  const backToList = useCallback(() => {
    setSelectedPlanet(null);
    setPhase("select");
    setBoard([]);
    setSelected(null);
  }, []);

  // ══════════════════════════════════════════════════════════════════
  // ACCESS CHECK
  // ══════════════════════════════════════════════════════════════════
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

  // ══════════════════════════════════════════════════════════════════
  // LOADING DATA
  // ══════════════════════════════════════════════════════════════════
  if (!allPlanets) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Planeten laden...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // COMPLETED VIEW
  // ══════════════════════════════════════════════════════════════════
  if (phase === "completed" && selectedPlanet) {
    const stars = getStars(moves);
    const starsText = stars === 3 ? "🌟🌟🌟" : stars === 2 ? "⭐⭐" : "⭐";

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.completedScroll}>
          {/* Stars & congrats */}
          <Animated.View
            style={[
              styles.completedHeader,
              { transform: [{ scale: completionScale }] },
            ]}
          >
            <Text style={styles.completedStars}>{starsText}</Text>
            <Text style={styles.completedTitle}>Proficiat! 🎉</Text>
            <Text style={styles.completedMoves}>
              Opgelost in {moves} zetten
            </Text>
          </Animated.View>

          {/* Planet image */}
          {selectedPlanet.imageUrl && (
            <Animated.View
              style={[
                styles.completedImageWrapper,
                { transform: [{ scale: starScale }] },
              ]}
            >
              <Image
                source={{ uri: selectedPlanet.imageUrl }}
                style={styles.completedImage}
                resizeMode="cover"
              />
            </Animated.View>
          )}

          {/* Planet info card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>
              {PLANET_EMOJIS[selectedPlanet.nummer] || "🪐"}{" "}
              {selectedPlanet.nederlandseNaam}
            </Text>
            <Text style={styles.infoScientific}>
              {selectedPlanet.wetenschappelijkeNaam}
            </Text>
            <Text style={styles.infoDesc}>
              {selectedPlanet.korteBeschrijving}
            </Text>
            <View style={styles.funFactBox}>
              <Text style={styles.funFactLabel}>💡 Wist je dat?</Text>
              <Text style={styles.funFactText}>
                {selectedPlanet.leukWeetje}
              </Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.completedActions}>
            <TouchableOpacity
              style={styles.actionBtnPrimary}
              onPress={() => startPuzzle(selectedPlanet)}
            >
              <Text style={styles.actionBtnPrimaryText}>🔄 Nog een keer</Text>
            </TouchableOpacity>

            {allPlanets.length > 1 && (
              <TouchableOpacity
                style={styles.actionBtnSecondary}
                onPress={goToNextPlanet}
              >
                <Text style={styles.actionBtnSecondaryText}>
                  ➡️ Volgende planeet
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.actionBtnGhost}
              onPress={backToList}
            >
              <Text style={styles.actionBtnGhostText}>📋 Alle planeten</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // PUZZLE VIEW
  // ══════════════════════════════════════════════════════════════════
  if ((phase === "playing" || phase === "loading") && selectedPlanet) {
    if (phase === "loading") {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.centered}>
            <Text style={{ fontSize: 64 }}>🪐</Text>
            <Text style={styles.loadingText}>Puzzel voorbereiden...</Text>
          </View>
        </SafeAreaView>
      );
    }

    const totalPieces = gridSize * gridSize;

    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.puzzleHeader}>
          <TouchableOpacity onPress={backToList}>
            <Text style={styles.backBtn}>← Terug</Text>
          </TouchableOpacity>
          <Text style={styles.puzzleTitle}>
            {PLANET_EMOJIS[selectedPlanet.nummer] || "🪐"}{" "}
            {selectedPlanet.nederlandseNaam}
          </Text>
          <Text style={styles.movesText}>⚡ {moves}</Text>
        </View>

        {/* Info & reference */}
        <View style={styles.puzzleInfoRow}>
          <Text style={styles.puzzleHint}>
            Tik twee stukjes om ze te wisselen!
          </Text>
          <View style={styles.puzzleStats}>
            <Text style={styles.statText}>
              {gridSize}×{gridSize}
            </Text>
          </View>
        </View>

        {/* Reference thumbnail */}
        {selectedPlanet.imageUrl && (
          <View style={styles.refRow}>
            <Text style={styles.refLabel}>Voorbeeld:</Text>
            <Image
              source={{ uri: selectedPlanet.imageUrl }}
              style={styles.refImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Puzzle grid using image URI crop parameters */}
        <View style={styles.puzzleGridContainer}>
          <View
            style={[
              styles.puzzleGrid,
              {
                width: puzzleContainerSize,
                height: puzzleContainerSize,
                flexDirection: "row",
                flexWrap: "wrap",
              },
            ]}
          >
            {board.map((pieceIdx, boardPos) => {
              const isSelected = selected === boardPos;
              const isCorrect = pieceIdx === boardPos;
              const row = Math.floor(pieceIdx / gridSize);
              const col = pieceIdx % gridSize;

              return (
                <TouchableOpacity
                  key={boardPos}
                  onPress={() => handlePieceTap(boardPos)}
                  activeOpacity={0.7}
                  style={[
                    styles.puzzlePiece,
                    {
                      width: pieceSize,
                      height: pieceSize,
                    },
                    isSelected && styles.puzzlePieceSelected,
                  ]}
                >
                  {selectedPlanet.imageUrl && (
                    <View
                      style={{
                        width: pieceSize - 2,
                        height: pieceSize - 2,
                        overflow: "hidden",
                        borderRadius: 4,
                      }}
                    >
                      <Image
                        source={{ uri: selectedPlanet.imageUrl }}
                        style={{
                          width: puzzleContainerSize,
                          height: puzzleContainerSize,
                          position: "absolute",
                          left: -(col * pieceSize),
                          top: -(row * pieceSize),
                        }}
                        resizeMode="cover"
                      />
                    </View>
                  )}

                  {/* Position number hint */}
                  <View style={styles.pieceNumberBadge}>
                    <Text style={styles.pieceNumberText}>{boardPos + 1}</Text>
                  </View>

                  {/* Correct indicator */}
                  {isCorrect && (
                    <View style={styles.correctBadge}>
                      <Text style={{ fontSize: 8 }}>✅</Text>
                    </View>
                  )}

                  {/* Selected overlay */}
                  {isSelected && <View style={styles.selectedOverlay} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Restart button */}
        <View style={styles.puzzleFooter}>
          <TouchableOpacity
            style={styles.restartBtn}
            onPress={() => startPuzzle(selectedPlanet)}
          >
            <Text style={styles.restartBtnText}>🔄 Opnieuw schudden</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // PLANET SELECTION VIEW
  // ══════════════════════════════════════════════════════════════════
  const planetsWithImages = allPlanets.filter((p) => p.imageUrl);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.selectScroll}>
        {/* Header */}
        <View style={styles.selectHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Terug</Text>
          </TouchableOpacity>
          <Text style={styles.selectTitle}>🪐 Planeten Puzzels</Text>
          <Text style={styles.selectSubtitle}>
            Kies een planeet en los de puzzel op!
          </Text>
        </View>

        {/* Grid size selector */}
        <View style={styles.gridSizeRow}>
          <Text style={styles.gridSizeLabel}>Moeilijkheid:</Text>
          <View style={styles.gridSizeOptions}>
            {GRID_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.gridSizeBtn,
                  gridSize === opt.value && styles.gridSizeBtnActive,
                ]}
                onPress={() => setGridSize(opt.value)}
              >
                <Text
                  style={[
                    styles.gridSizeBtnText,
                    gridSize === opt.value && styles.gridSizeBtnTextActive,
                  ]}
                >
                  {opt.emoji} {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Progress bar */}
        {planetsWithImages.length > 0 && (
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              Voortgang: {completedPlanets.size} / {planetsWithImages.length}
            </Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width:
                      `${(completedPlanets.size / planetsWithImages.length) * 100}%` as any,
                  },
                ]}
              />
            </View>
            {completedPlanets.size === planetsWithImages.length &&
              planetsWithImages.length > 0 && (
                <Text style={{ fontSize: 20, marginLeft: spacing.sm }}>🏆</Text>
              )}
          </View>
        )}

        {/* Planet cards */}
        {allPlanets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48 }}>🌌</Text>
            <Text style={styles.emptyText}>Nog geen planeten gevonden.</Text>
          </View>
        ) : (
          <View style={styles.planetGrid}>
            {allPlanets.map((planet) => {
              const hasImage = !!planet.imageUrl;
              const isDone = completedPlanets.has(planet._id);

              return (
                <TouchableOpacity
                  key={planet._id}
                  style={[
                    styles.planetCard,
                    !hasImage && styles.planetCardDisabled,
                  ]}
                  disabled={!hasImage}
                  onPress={() => startPuzzle(planet)}
                  activeOpacity={0.7}
                >
                  {/* Image or placeholder */}
                  <View style={styles.planetImageContainer}>
                    {planet.imageUrl ? (
                      <Image
                        source={{ uri: planet.imageUrl }}
                        style={styles.planetImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.planetPlaceholder}>
                        <Text style={{ fontSize: 40, opacity: 0.3 }}>🪐</Text>
                      </View>
                    )}

                    {/* Gradient overlay (using a semi-transparent View) */}
                    <View style={styles.planetOverlay} />

                    {/* Completed badge */}
                    {isDone && (
                      <View style={styles.doneBadge}>
                        <Text style={styles.doneBadgeText}>✅ Voltooid</Text>
                      </View>
                    )}

                    {/* No image badge */}
                    {!hasImage && (
                      <View style={styles.noImageBadge}>
                        <Text style={styles.noImageBadgeText}>
                          Geen afbeelding
                        </Text>
                      </View>
                    )}

                    {/* Info overlay at bottom */}
                    <View style={styles.planetInfoOverlay}>
                      <View style={styles.planetInfoRow}>
                        <Text style={styles.planetEmoji}>
                          {PLANET_EMOJIS[planet.nummer] || "🪐"}
                        </Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.planetName}>
                            {planet.nederlandseNaam}
                          </Text>
                          <Text style={styles.planetScientific}>
                            {planet.wetenschappelijkeNaam}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.planetDesc} numberOfLines={2}>
                        {planet.korteBeschrijving}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1b4b", // deep indigo
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
    color: "#a78bfa",
    marginTop: spacing.md,
  },

  // ── Back button ───────────────────────────────────────────────────
  backBtn: {
    fontSize: fontSize.sm,
    color: "#a78bfa",
    fontWeight: "600",
    marginBottom: spacing.sm,
  },

  // ══════════════════════════════════════════════════════════════════
  // SELECT VIEW
  // ══════════════════════════════════════════════════════════════════
  selectScroll: {
    padding: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  selectHeader: {
    marginBottom: spacing.xl,
  },
  selectTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fbbf24",
    textAlign: "center",
  },
  selectSubtitle: {
    fontSize: fontSize.sm,
    color: "#c4b5fd",
    textAlign: "center",
    marginTop: spacing.xs,
  },

  // Grid size selector
  gridSizeRow: {
    marginBottom: spacing.lg,
    alignItems: "center",
  },
  gridSizeLabel: {
    fontSize: fontSize.sm,
    color: "#c4b5fd",
    fontWeight: "500",
    marginBottom: spacing.sm,
  },
  gridSizeOptions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  gridSizeBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  gridSizeBtnActive: {
    backgroundColor: "#eab308",
    borderColor: "#eab308",
  },
  gridSizeBtnText: {
    fontSize: fontSize.sm,
    color: "#c4b5fd",
    fontWeight: "500",
  },
  gridSizeBtnTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },

  // Progress
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xl,
  },
  progressLabel: {
    fontSize: fontSize.xs,
    color: "#c4b5fd",
    marginRight: spacing.sm,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#fbbf24",
    borderRadius: 3,
  },

  // Empty
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing["4xl"],
  },
  emptyText: {
    fontSize: fontSize.base,
    color: "#a78bfa",
    marginTop: spacing.md,
  },

  // Planet cards
  planetGrid: {
    gap: spacing.md,
  },
  planetCard: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    backgroundColor: "#312e81",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  planetCardDisabled: {
    opacity: 0.5,
  },
  planetImageContainer: {
    aspectRatio: 4 / 3,
    width: "100%",
    position: "relative",
  },
  planetImage: {
    width: "100%",
    height: "100%",
  },
  planetPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#3730a3",
    justifyContent: "center",
    alignItems: "center",
  },
  planetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  doneBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: "rgba(34,197,94,0.9)",
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  doneBadgeText: {
    fontSize: fontSize.xs,
    color: "#ffffff",
    fontWeight: "600",
  },
  noImageBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: "rgba(239,68,68,0.8)",
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  noImageBadgeText: {
    fontSize: fontSize.xs,
    color: "#ffffff",
    fontWeight: "600",
  },
  planetInfoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  planetInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  planetEmoji: {
    fontSize: 24,
  },
  planetName: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: "#ffffff",
  },
  planetScientific: {
    fontSize: fontSize.xs,
    color: "#c4b5fd",
    fontStyle: "italic",
  },
  planetDesc: {
    fontSize: fontSize.xs,
    color: "#d1d5db",
    marginTop: 4,
    lineHeight: 16,
  },

  // ══════════════════════════════════════════════════════════════════
  // PUZZLE VIEW
  // ══════════════════════════════════════════════════════════════════
  puzzleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  puzzleTitle: {
    fontSize: fontSize.lg,
    fontWeight: "800",
    color: "#ffffff",
  },
  movesText: {
    fontSize: fontSize.base,
    fontWeight: "700",
    color: "#fbbf24",
  },
  puzzleInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  puzzleHint: {
    fontSize: fontSize.xs,
    color: "#a78bfa",
  },
  puzzleStats: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statText: {
    fontSize: fontSize.xs,
    color: "#fbbf24",
    fontWeight: "600",
  },

  // Reference
  refRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  refLabel: {
    fontSize: fontSize.xs,
    color: "#c4b5fd",
  },
  refImage: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: "rgba(167,139,250,0.4)",
  },

  // Grid
  puzzleGridContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  puzzleGrid: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: borderRadius.lg,
    padding: 1,
  },
  puzzlePiece: {
    position: "relative",
    padding: 1,
  },
  puzzlePieceSelected: {
    transform: [{ scale: 1.05 }],
    zIndex: 10,
  },
  pieceNumberBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
  },
  pieceNumberText: {
    fontSize: 8,
    color: "rgba(255,255,255,0.7)",
  },
  correctBadge: {
    position: "absolute",
    top: 2,
    left: 2,
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(250,204,21,0.25)",
    borderWidth: 2,
    borderColor: "#fbbf24",
    borderRadius: 4,
  },

  // Footer
  puzzleFooter: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  restartBtn: {
    backgroundColor: "rgba(167,139,250,0.2)",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.3)",
  },
  restartBtnText: {
    fontSize: fontSize.sm,
    color: "#c4b5fd",
    fontWeight: "600",
  },

  // ══════════════════════════════════════════════════════════════════
  // COMPLETED VIEW
  // ══════════════════════════════════════════════════════════════════
  completedScroll: {
    padding: spacing.lg,
    paddingBottom: spacing["4xl"],
    alignItems: "center",
  },
  completedHeader: {
    alignItems: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  completedStars: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fbbf24",
  },
  completedMoves: {
    fontSize: fontSize.base,
    color: "#c4b5fd",
    marginTop: spacing.xs,
  },
  completedImageWrapper: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "rgba(251,191,36,0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: spacing.xl,
  },
  completedImage: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.55,
    borderRadius: borderRadius.xl - 3,
  },

  // Info card
  infoCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: spacing.lg,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
  },
  infoScientific: {
    fontSize: fontSize.sm,
    color: "#a78bfa",
    fontStyle: "italic",
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  infoDesc: {
    fontSize: fontSize.base,
    color: "#d1d5db",
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  funFactBox: {
    backgroundColor: "rgba(251,191,36,0.1)",
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.2)",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  funFactLabel: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: "#fbbf24",
    marginBottom: 4,
  },
  funFactText: {
    fontSize: fontSize.sm,
    color: "#fde68a",
    lineHeight: 20,
  },

  // Action buttons
  completedActions: {
    width: "100%",
    maxWidth: 400,
    gap: spacing.sm,
  },
  actionBtnPrimary: {
    backgroundColor: "#7c3aed",
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    alignItems: "center",
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnPrimaryText: {
    color: "#ffffff",
    fontSize: fontSize.lg,
    fontWeight: "700",
  },
  actionBtnSecondary: {
    backgroundColor: "#eab308",
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    alignItems: "center",
    shadowColor: "#eab308",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnSecondaryText: {
    color: "#ffffff",
    fontSize: fontSize.lg,
    fontWeight: "700",
  },
  actionBtnGhost: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  actionBtnGhostText: {
    color: "#c4b5fd",
    fontSize: fontSize.base,
    fontWeight: "600",
  },
});
