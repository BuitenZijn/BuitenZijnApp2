import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
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

const SECTIONS = [
  {
    name: "Knutselen",
    emoji: "✂️",
    description: "Leuke knutselfilmpjes per categorie!",
    screen: "EllaKnutselen" as const,
    gradient: ["#fce7f3", "#fdf2f8"],
  },
  {
    name: "Rekenen",
    emoji: "🔢",
    description: "Leuk oefenen met rekenen!",
    screen: "EllaRekenen" as const,
    gradient: ["#ede9fe", "#f5f3ff"],
  },
  {
    name: "Varia",
    emoji: "🌈",
    description: "Dino quiz en meer!",
    screen: "EllaVaria" as const,
    gradient: ["#fef3c7", "#fffbeb"],
  },
  {
    name: "Mijn Resultaten",
    emoji: "📊",
    description: "Scores, statistieken en top 10!",
    screen: "EllaResultaten" as const,
    gradient: ["#fed7aa", "#fff7ed"],
  },
];

export default function EllaScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();

  const hasAccess =
    user?.roles?.includes("admin") || user?.roles?.includes("ella");

  if (!hasAccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noAccess}>
          <Text style={{ fontSize: 48 }}>🔒</Text>
          <Text style={styles.noAccessText}>Geen toegang</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Terug</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🎀 ELLA</Text>
          <Text style={styles.subtitle}>Knutselen, rekenen en meer!</Text>
        </View>

        {/* Section Cards */}
        <View style={styles.grid}>
          {SECTIONS.map((section) => (
            <TouchableOpacity
              key={section.name}
              style={[
                styles.sectionCard,
                { backgroundColor: section.gradient[0] },
              ]}
              disabled={!section.screen}
              onPress={() => {
                if (section.screen) {
                  navigation.navigate(section.screen);
                }
              }}
              activeOpacity={section.screen ? 0.7 : 1}
            >
              <Text style={styles.sectionEmoji}>{section.emoji}</Text>
              <Text style={styles.sectionName}>{section.name}</Text>
              <Text style={styles.sectionDesc}>{section.description}</Text>
              {!section.screen && (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Binnenkort</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdf2f8",
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  backBtn: {
    fontSize: fontSize.sm,
    color: "#ec4899",
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#be185d",
    textAlign: "center",
  },
  subtitle: {
    fontSize: fontSize.base,
    color: "#9d174d",
    textAlign: "center",
    marginTop: spacing.xs,
    opacity: 0.7,
  },
  grid: {
    gap: spacing.md,
  },
  sectionCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fbcfe8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  sectionName: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: "#831843",
  },
  sectionDesc: {
    fontSize: fontSize.sm,
    color: "#9d174d",
    textAlign: "center",
    marginTop: spacing.xs,
    opacity: 0.7,
  },
  comingSoonBadge: {
    marginTop: spacing.sm,
    backgroundColor: "#f9a8d4",
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  comingSoonText: {
    fontSize: fontSize.xs,
    color: "#831843",
    fontWeight: "600",
  },
  noAccess: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noAccessText: {
    fontSize: fontSize.lg,
    color: colors.textLight,
    marginTop: spacing.md,
  },
});
