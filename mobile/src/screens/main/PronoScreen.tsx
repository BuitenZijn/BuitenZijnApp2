import React from "react";
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
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
  borderRadius,
} from "../../styles/theme";
import type { MainStackParamList } from "../../navigation/types";

type Nav = NativeStackNavigationProp<MainStackParamList>;

export default function PronoScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();

  const competitions = useQuery(api.prono.getActiveCompetitions);

  const hasAccess =
    user?.roles?.includes("admin") || user?.roles?.includes("prono");

  if (!hasAccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={{ fontSize: 48 }}>🔒</Text>
          <Text style={styles.noAccessText}>Geen toegang tot Prono</Text>
        </View>
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
          <Text style={styles.title}>⚽ Prono</Text>
          <Text style={styles.subtitle}>
            Voorspel uitslagen en strijd om de eerste plaats!
          </Text>
        </View>

        {/* Competitions */}
        {!competitions ? (
          <ActivityIndicator
            size="large"
            color={colors.green[500]}
            style={{ marginTop: 40 }}
          />
        ) : competitions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48 }}>🏟️</Text>
            <Text style={styles.emptyTitle}>Geen actieve competities</Text>
            <Text style={styles.emptyDesc}>
              Kom later terug wanneer er een competitie beschikbaar is!
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {competitions.map((comp) => (
              <TouchableOpacity
                key={comp._id}
                style={styles.card}
                onPress={() =>
                  navigation.navigate("PronoCompetition", {
                    competitionId: comp._id,
                  })
                }
                activeOpacity={0.7}
              >
                <Text style={styles.cardEmoji}>{comp.emoji || "🏆"}</Text>
                <Text style={styles.cardTitle}>{comp.name}</Text>
                {comp.description && (
                  <Text style={styles.cardDesc}>{comp.description}</Text>
                )}
                {comp.startDate && comp.endDate && (
                  <Text style={styles.cardDate}>
                    {comp.startDate} — {comp.endDate}
                  </Text>
                )}
                <View style={styles.cardArrow}>
                  <Text style={{ color: "#10b981", fontWeight: "700" }}>
                    Bekijken →
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
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
  scroll: {
    paddingBottom: spacing["3xl"],
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
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
  grid: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold as any,
    color: colors.text,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    lineHeight: 20,
  },
  cardDate: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  cardArrow: {
    marginTop: spacing.md,
    alignItems: "flex-end",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold as any,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyDesc: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    textAlign: "center",
    marginTop: spacing.xs,
  },
});
