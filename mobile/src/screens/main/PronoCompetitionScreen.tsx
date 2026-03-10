import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
  borderRadius,
} from "../../styles/theme";
import type { MainStackParamList } from "../../navigation/types";

type Nav = NativeStackNavigationProp<MainStackParamList>;
type Route = RouteProp<MainStackParamList, "PronoCompetition">;

type PredictionDraft = { homeScore: string; awayScore: string };

export default function PronoCompetitionScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { user } = useAuth();
  const { competitionId } = route.params;

  const [tab, setTab] = useState<"matches" | "ranking">("matches");
  const [drafts, setDrafts] = useState<Record<string, PredictionDraft>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const competition = useQuery(api.prono.getCompetition, {
    id: competitionId as any,
  });
  const matches = useQuery(api.prono.getMatches, {
    competitionId: competitionId as any,
  });
  const myPredictions = useQuery(
    api.prono.getMyPredictions,
    user?._id
      ? { userId: user._id, competitionId: competitionId as any }
      : "skip",
  );
  const leaderboard = useQuery(api.prono.getLeaderboard, {
    competitionId: competitionId as any,
  });

  const savePrediction = useMutation(api.prono.savePrediction);

  const getPrediction = useCallback(
    (matchId: string) => myPredictions?.find((p) => p.matchId === matchId),
    [myPredictions],
  );

  const getDraft = (matchId: string): PredictionDraft => {
    if (drafts[matchId]) return drafts[matchId];
    const existing = getPrediction(matchId);
    if (existing)
      return {
        homeScore: String(existing.homeScore),
        awayScore: String(existing.awayScore),
      };
    return { homeScore: "", awayScore: "" };
  };

  const updateDraft = (
    matchId: string,
    field: "homeScore" | "awayScore",
    value: string,
  ) => {
    setDrafts((prev) => ({
      ...prev,
      [matchId]: { ...getDraft(matchId), [field]: value },
    }));
  };

  const handleSave = async (matchId: string) => {
    if (!user?._id) return;
    const draft = getDraft(matchId);
    const home = parseInt(draft.homeScore, 10);
    const away = parseInt(draft.awayScore, 10);
    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      Alert.alert("Ongeldige score", "Vul geldige scores in (0 of meer).");
      return;
    }
    try {
      setSaving(matchId);
      await savePrediction({
        userId: user._id,
        matchId: matchId as any,
        homeScore: home,
        awayScore: away,
      });
    } catch (e: any) {
      Alert.alert("Fout", e.message || "Kon voorspelling niet opslaan.");
    } finally {
      setSaving(null);
    }
  };

  // Group matches by group field
  const groupedMatches = React.useMemo(() => {
    if (!matches) return {};
    const groups: Record<string, typeof matches> = {};
    for (const m of matches) {
      const key = m.group || "Wedstrijden";
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    }
    // Sort matches within each group by matchNumber then date
    for (const key of Object.keys(groups)) {
      groups[key].sort(
        (a, b) =>
          (a.matchNumber ?? 999) - (b.matchNumber ?? 999) ||
          new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime(),
      );
    }
    return groups;
  }, [matches]);

  if (!competition || !matches) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color={colors.green[500]}
          style={{ marginTop: 60 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Terug</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {competition.emoji || "🏆"} {competition.name}
          </Text>
          {competition.description && (
            <Text style={styles.subtitle}>{competition.description}</Text>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, tab === "matches" && styles.tabActive]}
            onPress={() => setTab("matches")}
          >
            <Text
              style={[
                styles.tabText,
                tab === "matches" && styles.tabTextActive,
              ]}
            >
              Wedstrijden
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === "ranking" && styles.tabActive]}
            onPress={() => setTab("ranking")}
          >
            <Text
              style={[
                styles.tabText,
                tab === "ranking" && styles.tabTextActive,
              ]}
            >
              Klassement
            </Text>
          </TouchableOpacity>
        </View>

        {tab === "matches" ? (
          <View style={styles.content}>
            {Object.entries(groupedMatches).map(([group, groupMatches]) => (
              <View key={group}>
                <Text style={styles.groupTitle}>{group}</Text>
                {groupMatches.map((match) => {
                  const pred = getPrediction(match._id);
                  const draft = getDraft(match._id);
                  const isSaving = saving === match._id;

                  return (
                    <View key={match._id} style={styles.matchCard}>
                      <View style={styles.matchHeader}>
                        <Text style={styles.matchDate}>
                          {match.matchDate}
                          {match.belgianTime
                            ? ` · ${match.belgianTime} (BE)`
                            : match.matchTime
                              ? ` · ${match.matchTime}`
                              : ""}
                          {match.location && ` · ${match.location}`}
                        </Text>
                        {match.isFinished && (
                          <View style={styles.finishedBadge}>
                            <Text style={styles.finishedText}>Gespeeld</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.matchTeams}>
                        <Text style={styles.teamName}>
                          {match.homeFlag ? `${match.homeFlag} ` : ""}
                          {match.homeTeam}
                        </Text>
                        {match.isFinished ? (
                          <Text style={styles.matchScore}>
                            {match.homeScore} - {match.awayScore}
                          </Text>
                        ) : (
                          <Text style={styles.vsText}>vs</Text>
                        )}
                        <Text style={styles.teamName}>
                          {match.awayTeam}
                          {match.awayFlag ? ` ${match.awayFlag}` : ""}
                        </Text>
                      </View>

                      {/* Prediction inputs */}
                      {!match.isFinished && user?._id && (
                        <View style={styles.predictionRow}>
                          <TextInput
                            style={styles.scoreInput}
                            keyboardType="number-pad"
                            placeholder="0"
                            placeholderTextColor={colors.textLight}
                            value={draft.homeScore}
                            onChangeText={(v) =>
                              updateDraft(match._id, "homeScore", v)
                            }
                            maxLength={2}
                          />
                          <Text style={styles.predDash}>-</Text>
                          <TextInput
                            style={styles.scoreInput}
                            keyboardType="number-pad"
                            placeholder="0"
                            placeholderTextColor={colors.textLight}
                            value={draft.awayScore}
                            onChangeText={(v) =>
                              updateDraft(match._id, "awayScore", v)
                            }
                            maxLength={2}
                          />
                          <TouchableOpacity
                            style={[
                              styles.saveBtn,
                              isSaving && { opacity: 0.6 },
                            ]}
                            onPress={() => handleSave(match._id)}
                            disabled={isSaving}
                          >
                            <Text style={styles.saveBtnText}>
                              {isSaving ? "..." : pred ? "✏️" : "💾"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      {/* Show prediction result if match is finished */}
                      {match.isFinished && pred && (
                        <View style={styles.predResult}>
                          <Text style={styles.predResultLabel}>
                            Jouw voorspelling: {pred.homeScore} -{" "}
                            {pred.awayScore}
                          </Text>
                          <Text
                            style={[
                              styles.predPoints,
                              {
                                color:
                                  (pred.pointsAwarded ?? 0) > 0
                                    ? "#10b981"
                                    : colors.textLight,
                              },
                            ]}
                          >
                            +{pred.pointsAwarded ?? 0} punten
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.content}>
            {!leaderboard ? (
              <ActivityIndicator size="small" color={colors.green[500]} />
            ) : leaderboard.length === 0 ? (
              <Text style={styles.emptyText}>
                Nog geen resultaten beschikbaar.
              </Text>
            ) : (
              leaderboard.map((entry, idx) => (
                <View
                  key={entry.userId}
                  style={[
                    styles.rankRow,
                    idx < 3 && { backgroundColor: "#f0fdf4" },
                  ]}
                >
                  <Text style={styles.rankPos}>
                    {idx === 0
                      ? "🥇"
                      : idx === 1
                        ? "🥈"
                        : idx === 2
                          ? "🥉"
                          : `${idx + 1}.`}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rankName}>{entry.playerName}</Text>
                    <Text style={styles.rankMeta}>
                      {entry.exactPredictions} exact · {entry.totalPredictions}{" "}
                      voorspellingen
                    </Text>
                  </View>
                  <Text style={styles.rankPoints}>{entry.totalPoints} pt</Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: spacing["3xl"],
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    fontSize: fontSize.base,
    color: colors.green[500],
    fontWeight: fontWeight.semibold as any,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold as any,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: 4,
  },
  tabRow: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  tabActive: {
    backgroundColor: "#10b981",
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold as any,
    color: colors.textLight,
  },
  tabTextActive: {
    color: colors.white,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  groupTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold as any,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  matchCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  matchDate: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  finishedBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  finishedText: {
    fontSize: fontSize.xs,
    color: "#16a34a",
    fontWeight: fontWeight.semibold as any,
  },
  matchTeams: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  teamName: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold as any,
    color: colors.text,
  },
  vsText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginHorizontal: spacing.sm,
  },
  matchScore: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold as any,
    color: colors.text,
    marginHorizontal: spacing.sm,
  },
  predictionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  scoreInput: {
    width: 48,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    textAlign: "center",
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold as any,
    color: colors.text,
    backgroundColor: "#f9fafb",
  },
  predDash: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold as any,
    color: colors.textLight,
  },
  saveBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: "#10b981",
    borderRadius: borderRadius.md,
  },
  saveBtnText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold as any,
    color: colors.white,
  },
  predResult: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  predResultLabel: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  predPoints: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold as any,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rankPos: {
    fontSize: fontSize.lg,
    width: 36,
    textAlign: "center",
  },
  rankName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold as any,
    color: colors.text,
  },
  rankMeta: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: 2,
  },
  rankPoints: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold as any,
    color: "#10b981",
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
