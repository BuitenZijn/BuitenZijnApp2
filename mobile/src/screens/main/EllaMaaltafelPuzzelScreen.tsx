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
  TextInput,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
  Keyboard,
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

// ── Defaults ────────────────────────────────────────────────────────
const DEFAULT_GRID_SIZE = 10;
const DEFAULT_BLANKS_PER_ROUND = 10;
const DEFAULT_BOMB_CHANCE = 0.4;
const LOCAL_IMAGE_COUNT = 10;

// Sound URLs (hosted by the web app)
const SOUND_BASE = "https://buitenzijnvzw.be/ella/sounds";

// ── Types ───────────────────────────────────────────────────────────
interface CellState {
  value: number;
  isBlank: boolean;
  isSolved: boolean;
  isBombed: boolean;
  showBombAnim: boolean;
  showCorrectAnim: boolean;
  wrongHint: string | null;
}

// ── Helpers ─────────────────────────────────────────────────────────
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
  const n = Math.floor(Math.random() * LOCAL_IMAGE_COUNT) + 1;
  return `https://buitenzijnvzw.be/ella/puzzle_images/${n}.png`;
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
    // Unload after a delay to free resources
    sound.setOnPlaybackStatusUpdate((status) => {
      if ("didJustFinish" in status && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
      }
    });
  } catch {
    /* ignore – sounds are optional */
  }
}

// ── Component ───────────────────────────────────────────────────────
export default function EllaMaaltafelPuzzelScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();

  // Convex data
  const convexImageUrls = useQuery(api.rekenen.getActivePuzzleImageUrls);
  const convexSettings = useQuery(api.rekenen.getGameSettings, {
    game: "multiplication_grid",
  });
  const saveScore = useMutation(api.ellaScores.saveScore);

  // Resolved settings
  const gridSize = convexSettings?.gridSize ?? DEFAULT_GRID_SIZE;
  const blanksPerRound =
    convexSettings?.blanksPerRound ?? DEFAULT_BLANKS_PER_ROUND;
  const bombChance = convexSettings?.bombChance ?? DEFAULT_BOMB_CHANCE;

  const [cells, setCells] = useState<CellState[][]>([]);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [remaining, setRemaining] = useState(blanksPerRound);
  const [finished, setFinished] = useState(false);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [activeInput, setActiveInput] = useState<string | null>(null);

  // Bomb animations
  const bombAnims = useRef<Record<string, Animated.Value>>({});
  const correctAnims = useRef<Record<string, Animated.Value>>({});
  const mistakesRef = useRef(0);
  const startTimeRef = useRef(0);

  // Access check
  const hasAccess =
    user?.roles?.includes("admin") || user?.roles?.includes("ella");

  // Cell size calculation
  const screenWidth = Dimensions.get("window").width;
  // Account for padding + row header column
  const availableWidth = screenWidth - spacing.md * 2;
  const cellSize = Math.floor(availableWidth / (gridSize + 1));

  // ── Init game ───────────────────────────────────────────────────
  const initGame = useCallback(() => {
    const currentGrid = buildGrid(gridSize);
    const src = pickRandomImage(convexImageUrls);
    setImageSrc(src);
    setFinished(false);
    setInputValues({});
    setActiveInput(null);
    bombAnims.current = {};
    correctAnims.current = {};
    mistakesRef.current = 0;
    startTimeRef.current = Date.now();

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
  }, [gridSize, blanksPerRound, convexImageUrls]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // ── Grid for multiplication values ──────────────────────────────
  const grid = useMemo(() => buildGrid(gridSize), [gridSize]);

  // ── Answer handler ──────────────────────────────────────────────
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
          playSound("succes.wav");
          cell.isBlank = false;
          cell.isSolved = true;
          cell.showCorrectAnim = true;
          setTimeout(() => {
            setCells((p) => {
              const n2 = p.map((r) => r.map((c) => ({ ...c })));
              if (n2[row]?.[col]) n2[row][col].showCorrectAnim = false;
              return n2;
            });
          }, 2500);

          // Bomb mechanic
          if (Math.random() < bombChance) {
            playSound("explosion.mp3");
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
                    if (n3[nr]?.[nc]) n3[nr][nc].showBombAnim = false;
                    return n3;
                  });
                }, 1500);
              }
            }
          }

          // Count remaining
          let blanksLeft = 0;
          for (const r of next) for (const c of r) if (c.isBlank) blanksLeft++;

          if (blanksLeft === 0) {
            let allSolved = true;
            for (const r of next)
              for (const c of r) if (!c.isSolved) allSolved = false;

            if (allSolved) {
              playSound("completed.mp3");
              setFinished(true);
              setRemaining(0);
              // Save score
              const timeSeconds = Math.round(
                (Date.now() - startTimeRef.current) / 1000,
              );
              if (user?._id) {
                saveScore({
                  userId: user._id,
                  game: "maaltafel_puzzel",
                  timeSeconds,
                  mistakes: mistakesRef.current,
                  difficulty: `${gridSize}x${gridSize}`,
                }).catch(() => {});
              }
            } else {
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
          playSound("fail.mp3");
          mistakesRef.current += 1;
          const hint = `${row + 1} × ${col + 1} = ?`;
          cell.wrongHint = hint;
          setTimeout(() => {
            setCells((p) => {
              const n2 = p.map((r) => r.map((c) => ({ ...c })));
              if (n2[row]?.[col]) n2[row][col].wrongHint = null;
              return n2;
            });
          }, 4000);
        }

        return next;
      });

      setInputValues((prev) => ({ ...prev, [`${row}_${col}`]: "" }));
    },
    [grid, bombChance, gridSize, blanksPerRound],
  );

  // ── No access ───────────────────────────────────────────────────
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

  // ── Loading ─────────────────────────────────────────────────────
  if (!cells.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Puzzel laden...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render ──────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Terug</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🧩 Maaltafel Puzzel</Text>
          <Text style={styles.subtitle}>
            Los de maaltafels op om het plaatje te onthullen!
          </Text>
          <View style={styles.headerRow}>
            <Text style={styles.remainingText}>
              Nog <Text style={styles.remainingCount}>{remaining}</Text> vragen
            </Text>
            <TouchableOpacity style={styles.newGameBtn} onPress={initGame}>
              <Text style={styles.newGameBtnText}>🔄 Nieuw spel</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Finished overlay */}
        {finished && (
          <View style={styles.finishedCard}>
            <Text style={{ fontSize: 48 }}>🎉</Text>
            <Text style={styles.finishedTitle}>Proficiat!</Text>
            <Text style={styles.finishedSubtitle}>
              Je hebt het hele plaatje onthuld!
            </Text>
            {imageSrc ? (
              <Image
                source={{ uri: imageSrc }}
                style={styles.finishedImage}
                resizeMode="contain"
              />
            ) : null}
            <TouchableOpacity style={styles.playAgainBtn} onPress={initGame}>
              <Text style={styles.playAgainBtnText}>🔄 Nog een keer!</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Grid */}
        <ScrollView horizontal contentContainerStyle={styles.gridScroll}>
          <View>
            {/* Column headers */}
            <View style={styles.gridRow}>
              <View
                style={[
                  styles.headerCell,
                  { width: cellSize, height: cellSize },
                ]}
              >
                <Text style={styles.headerCellText}>×</Text>
              </View>
              {Array.from({ length: gridSize }, (_, j) => (
                <View
                  key={j}
                  style={[
                    styles.headerCell,
                    { width: cellSize, height: cellSize },
                  ]}
                >
                  <Text style={styles.headerCellText}>{j + 1}</Text>
                </View>
              ))}
            </View>

            {/* Data rows */}
            {cells.map((row, i) => (
              <View key={i} style={styles.gridRow}>
                {/* Row header */}
                <View
                  style={[
                    styles.headerCell,
                    { width: cellSize, height: cellSize },
                  ]}
                >
                  <Text style={styles.headerCellText}>{i + 1}</Text>
                </View>

                {/* Cells */}
                {row.map((cell, j) => (
                  <View
                    key={j}
                    style={[styles.cell, { width: cellSize, height: cellSize }]}
                  >
                    {/* Solved → show puzzle piece */}
                    {cell.isSolved && imageSrc ? (
                      <View
                        style={[
                          styles.pieceContainer,
                          { width: cellSize - 1, height: cellSize - 1 },
                        ]}
                      >
                        <Image
                          source={{ uri: imageSrc }}
                          style={{
                            width: cellSize * gridSize,
                            height: cellSize * gridSize,
                            position: "absolute",
                            left: -j * cellSize,
                            top: -i * cellSize,
                          }}
                          resizeMode="cover"
                        />
                        {/* Value overlay */}
                        <View style={styles.valueOverlay}>
                          <Text
                            style={[
                              styles.solvedValue,
                              { color: cell.isBombed ? "#ef4444" : "#22c55e" },
                            ]}
                          >
                            {cell.value}
                          </Text>
                        </View>
                        {/* Bomb emoji */}
                        {cell.showBombAnim && (
                          <View style={styles.bombOverlay}>
                            <Text
                              style={{ fontSize: Math.max(cellSize * 0.5, 16) }}
                            >
                              💥
                            </Text>
                          </View>
                        )}
                        {/* Correct text */}
                        {cell.showCorrectAnim && (
                          <View style={styles.correctOverlay}>
                            <Text style={styles.correctText}>✓</Text>
                          </View>
                        )}
                      </View>
                    ) : null}

                    {/* Blank → input */}
                    {cell.isBlank && !cell.isSolved && (
                      <View style={styles.blankCell}>
                        <TextInput
                          style={styles.cellInput}
                          keyboardType="number-pad"
                          value={inputValues[`${i}_${j}`] ?? ""}
                          onChangeText={(text) =>
                            setInputValues((prev) => ({
                              ...prev,
                              [`${i}_${j}`]: text,
                            }))
                          }
                          onSubmitEditing={() => {
                            checkAnswer(i, j, inputValues[`${i}_${j}`] ?? "");
                          }}
                          onBlur={() => {
                            checkAnswer(i, j, inputValues[`${i}_${j}`] ?? "");
                          }}
                          onFocus={() => setActiveInput(`${i}_${j}`)}
                          selectTextOnFocus
                          maxLength={3}
                        />
                        {/* Wrong hint */}
                        {cell.wrongHint && (
                          <View style={styles.wrongHint}>
                            <Text style={styles.wrongHintText}>
                              {cell.wrongHint}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* Normal → show value */}
                    {!cell.isBlank && !cell.isSolved && (
                      <Text style={styles.normalValue}>{cell.value}</Text>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f3ff",
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing["3xl"],
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noAccessText: {
    fontSize: fontSize.lg,
    color: colors.gray[500],
    marginTop: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.lg,
    color: "#7c3aed",
  },

  // Header
  header: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  backBtn: {
    fontSize: fontSize.sm,
    color: "#7c3aed",
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#5b21b6",
    textAlign: "center",
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: "#6d28d9",
    textAlign: "center",
    marginTop: 4,
    opacity: 0.7,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  remainingText: {
    fontSize: fontSize.sm,
    color: "#4b5563",
  },
  remainingCount: {
    fontWeight: "700",
    color: "#7c3aed",
  },
  newGameBtn: {
    backgroundColor: "#ede9fe",
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  newGameBtnText: {
    fontSize: fontSize.xs,
    color: "#7c3aed",
    fontWeight: "600",
  },

  // Finished
  finishedCard: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  finishedTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#15803d",
    marginTop: spacing.xs,
  },
  finishedSubtitle: {
    fontSize: fontSize.sm,
    color: "#16a34a",
    marginTop: 4,
  },
  finishedImage: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  playAgainBtn: {
    backgroundColor: "#22c55e",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
  },
  playAgainBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: fontSize.base,
  },

  // Grid
  gridScroll: {
    paddingBottom: spacing.md,
  },
  gridRow: {
    flexDirection: "row",
  },
  headerCell: {
    backgroundColor: "#f3f4f6",
    borderWidth: 0.5,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCellText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#4b5563",
  },

  // Individual cell
  cell: {
    borderWidth: 0.5,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  normalValue: {
    fontSize: 10,
    color: "#374151",
    fontWeight: "500",
  },

  // Puzzle piece
  pieceContainer: {
    overflow: "hidden",
    position: "relative",
  },
  valueOverlay: {
    position: "absolute",
    top: 1,
    left: 2,
    zIndex: 10,
  },
  solvedValue: {
    fontSize: 8,
    fontWeight: "800",
    textShadowColor: "rgba(255,255,255,0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  bombOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  correctOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 15,
  },
  correctText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#22c55e",
    textShadowColor: "rgba(255,255,255,0.9)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },

  // Blank cell
  blankCell: {
    flex: 1,
    width: "100%",
    position: "relative",
  },
  cellInput: {
    flex: 1,
    backgroundColor: "#22c55e",
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 12,
    padding: 0,
  },
  wrongHint: {
    position: "absolute",
    top: -22,
    left: -10,
    backgroundColor: "#ef4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 30,
  },
  wrongHintText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "600",
  },
});
