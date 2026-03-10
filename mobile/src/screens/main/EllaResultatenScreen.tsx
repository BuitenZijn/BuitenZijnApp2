import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "../../contexts/AuthContext";
import { colors, fontSize, spacing, borderRadius } from "../../styles/theme";
import type { MainStackParamList } from "../../navigation/types";

type Nav = NativeStackNavigationProp<MainStackParamList>;

// ── Game metadata ────────────────────────────────────────────────────
const GAMES = [
  {
    id: "planeten_puzzel" as const,
    name: "Planeten Puzzel",
    emoji: "🪐",
    scoreLabel: "Zetten",
    color: "#6366f1",
  },
  {
    id: "maaltafel_puzzel" as const,
    name: "Maaltafel Puzzel",
    emoji: "🔢",
    scoreLabel: "Fouten",
    color: "#8b5cf6",
  },
  {
    id: "dino_quiz" as const,
    name: "Dino Quiz",
    emoji: "🦕",
    scoreLabel: "Juist",
    color: "#10b981",
  },
  {
    id: "rekenoefeningen" as const,
    name: "Rekenoefeningen",
    emoji: "➕",
    scoreLabel: "Juist",
    color: "#4f46e5",
  },
] as const;

type GameId = (typeof GAMES)[number]["id"];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("nl-BE", {
    day: "numeric",
    month: "short",
  });
}

// ══════════════════════════════════════════════════════════════════════
export default function EllaResultatenScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"results" | "leaderboard">(
    "results",
  );
  const [selectedGame, setSelectedGame] = useState<GameId>("planeten_puzzel");

  const userId = user?._id;

  const myStats = useQuery(
    api.ellaScores.getMyStats,
    userId ? { userId } : "skip",
  );
  const myScores = useQuery(
    api.ellaScores.getMyScores,
    userId ? { userId, game: selectedGame } : "skip",
  );
  const leaderboard = useQuery(api.ellaScores.getLeaderboard, {
    game: selectedGame,
  });

  const hasAccess =
    user?.roles?.includes("admin") || user?.roles?.includes("ella");

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

  const gameMeta = GAMES.find((g) => g.id === selectedGame)!;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Terug</Text>
          </TouchableOpacity>
          <Text style={styles.title}>📊 Mijn Resultaten</Text>
        </View>

        {/* Stats cards */}
        {myStats && (
          <View style={styles.statsGrid}>
            {GAMES.map((game) => {
              const stat = myStats[game.id];
              const isSelected = selectedGame === game.id;
              return (
                <TouchableOpacity
                  key={game.id}
                  style={[
                    styles.statCard,
                    { backgroundColor: game.color },
                    isSelected && styles.statCardSelected,
                  ]}
                  onPress={() => setSelectedGame(game.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.statEmoji}>{game.emoji}</Text>
                  <Text style={styles.statName}>{game.name}</Text>
                  {stat && stat.timesPlayed > 0 ? (
                    <>
                      <Text style={styles.statValue}>
                        {stat.timesPlayed}× gespeeld
                      </Text>
                      <Text style={styles.statValue}>
                        Beste: {formatTime(stat.bestTime!)}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.statEmpty}>Nog niet gespeeld</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === "results" && styles.tabBtnActive,
            ]}
            onPress={() => setActiveTab("results")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "results" && styles.tabTextActive,
              ]}
            >
              📋 Mijn Scores
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === "leaderboard" && styles.tabBtnActive,
            ]}
            onPress={() => setActiveTab("leaderboard")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "leaderboard" && styles.tabTextActive,
              ]}
            >
              🏆 Top 10
            </Text>
          </TouchableOpacity>
        </View>

        {/* Game selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.gamePills}
        >
          {GAMES.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={[
                styles.gamePill,
                selectedGame === game.id && {
                  backgroundColor: game.color,
                },
              ]}
              onPress={() => setSelectedGame(game.id)}
            >
              <Text
                style={[
                  styles.gamePillText,
                  selectedGame === game.id && styles.gamePillTextActive,
                ]}
              >
                {game.emoji} {game.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content */}
        {activeTab === "results" ? (
          <ScoresList scores={myScores} gameMeta={gameMeta} />
        ) : (
          <LeaderboardList
            leaderboard={leaderboard}
            gameMeta={gameMeta}
            currentUserId={userId}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Scores List ──────────────────────────────────────────────────────
function ScoresList({
  scores,
  gameMeta,
}: {
  scores: any[] | undefined;
  gameMeta: (typeof GAMES)[number];
}) {
  if (!scores) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={gameMeta.color} />
      </View>
    );
  }

  if (scores.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={{ fontSize: 48 }}>{gameMeta.emoji}</Text>
        <Text style={styles.emptyText}>Nog geen scores</Text>
        <Text style={styles.emptySubtext}>
          Speel {gameMeta.name} om je resultaten te zien!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.listCard}>
      {scores.slice(0, 20).map((score: any, i: number) => (
        <View
          key={score._id}
          style={[styles.listRow, i > 0 && styles.listRowBorder]}
        >
          <Text style={styles.listIndex}>{i + 1}</Text>
          <View style={styles.listContent}>
            <Text style={styles.listDate}>
              {formatDate(score.completedAt)}
              {score.difficulty ? ` • ${score.difficulty}` : ""}
              {score.subjectName ? ` • ${score.subjectName}` : ""}
            </Text>
            <Text style={styles.listDetail}>
              {formatTime(score.timeSeconds)}
              {gameMeta.id === "planeten_puzzel" && ` • ${score.moves} zetten`}
              {gameMeta.id === "planeten_puzzel" &&
                score.stars &&
                ` • ${"⭐".repeat(score.stars)}`}
              {gameMeta.id === "maaltafel_puzzel" &&
                ` • ${score.mistakes} fouten`}
              {gameMeta.id === "dino_quiz" &&
                ` • ${score.correctAnswers}/${score.totalQuestions} juist`}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Leaderboard List ─────────────────────────────────────────────────
function LeaderboardList({
  leaderboard,
  gameMeta,
  currentUserId,
}: {
  leaderboard: any[] | undefined;
  gameMeta: (typeof GAMES)[number];
  currentUserId: string | undefined;
}) {
  const medals = ["🥇", "🥈", "🥉"];

  if (!leaderboard) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={gameMeta.color} />
      </View>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={{ fontSize: 48 }}>🏆</Text>
        <Text style={styles.emptyText}>Nog geen scores</Text>
        <Text style={styles.emptySubtext}>
          Wees de eerste om {gameMeta.name} te spelen!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.listCard}>
      {leaderboard.map((entry: any, i: number) => {
        const isMe = currentUserId === entry.userId;
        return (
          <View
            key={entry._id}
            style={[
              styles.listRow,
              i > 0 && styles.listRowBorder,
              isMe && styles.listRowHighlight,
            ]}
          >
            <Text style={styles.listMedal}>
              {i < 3 ? medals[i] : `${i + 1}`}
            </Text>
            <View style={styles.listContent}>
              <Text style={[styles.listName, isMe && styles.listNameMe]}>
                {entry.playerName}
                {isMe ? " (Jij)" : ""}
              </Text>
              <Text style={styles.listDetail}>
                {formatTime(entry.timeSeconds)}
                {gameMeta.id === "planeten_puzzel" &&
                  ` • ${entry.moves} zetten`}
                {gameMeta.id === "maaltafel_puzzel" &&
                  ` • ${entry.mistakes} fouten`}
                {gameMeta.id === "dino_quiz" &&
                  ` • ${entry.correctAnswers}/${entry.totalQuestions} juist`}
                {entry.difficulty ? ` • ${entry.difficulty}` : ""}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdf2f8",
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  centered: {
    padding: spacing.xl,
    alignItems: "center",
  },
  header: {
    marginBottom: spacing.lg,
  },
  backBtn: {
    fontSize: fontSize.sm,
    color: "#ec4899",
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#831843",
    textAlign: "center",
  },
  // Stats cards
  statsGrid: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: "center",
  },
  statCardSelected: {
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  statName: {
    fontSize: fontSize.base,
    fontWeight: "700",
    color: "#fff",
  },
  statValue: {
    fontSize: fontSize.xs,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  statEmpty: {
    fontSize: fontSize.xs,
    color: "rgba(255,255,255,0.6)",
    fontStyle: "italic",
    marginTop: 4,
  },
  // Tabs
  tabRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: "#8b5cf6",
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: "#8b5cf6",
  },
  tabTextActive: {
    color: "#fff",
  },
  // Game pills
  gamePills: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  gamePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  gamePillText: {
    fontSize: fontSize.sm,
    fontWeight: "500",
    color: "#6b7280",
  },
  gamePillTextActive: {
    color: "#fff",
  },
  // List
  listCard: {
    backgroundColor: "#fff",
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    marginTop: spacing.sm,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  listRowBorder: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  listRowHighlight: {
    backgroundColor: "#f5f3ff",
  },
  listIndex: {
    width: 28,
    fontSize: fontSize.sm,
    color: "#9ca3af",
    fontWeight: "500",
  },
  listMedal: {
    width: 32,
    fontSize: 18,
    textAlign: "center",
  },
  listContent: {
    flex: 1,
  },
  listDate: {
    fontSize: fontSize.sm,
    color: "#374151",
    fontWeight: "500",
  },
  listName: {
    fontSize: fontSize.sm,
    color: "#374151",
    fontWeight: "500",
  },
  listNameMe: {
    color: "#7c3aed",
    fontWeight: "700",
  },
  listDetail: {
    fontSize: fontSize.xs,
    color: "#9ca3af",
    marginTop: 2,
  },
  // Empty
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: "#6b7280",
    marginTop: spacing.sm,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: "#9ca3af",
    marginTop: spacing.xs,
    textAlign: "center",
  },
  noAccessText: {
    fontSize: fontSize.lg,
    color: colors.textLight,
    marginTop: spacing.md,
  },
});
