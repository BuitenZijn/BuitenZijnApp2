import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
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

const GAMES = [
  {
    name: "Dino Quiz",
    emoji: "🦕",
    description: "Herken de dinosaurus aan zijn foto!",
    screen: "EllaDinoQuiz" as const,
    gradient: ["#d1fae5", "#ecfdf5"],
  },
  {
    name: "Planeten Puzzel",
    emoji: "🪐",
    description: "Los de planeten puzzels op!",
    screen: "EllaPlanetPuzzel" as const,
    gradient: ["#dbeafe", "#eff6ff"],
  },
];

export default function EllaVariaScreen() {
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
          <Text style={styles.title}>🌈 Varia</Text>
          <Text style={styles.subtitle}>Leuke spelletjes!</Text>
        </View>

        {/* Game Cards */}
        <View style={styles.grid}>
          {GAMES.map((game) => (
            <TouchableOpacity
              key={game.name}
              style={[styles.gameCard, { backgroundColor: game.gradient[0] }]}
              disabled={!game.screen}
              onPress={() => {
                if (game.screen) {
                  navigation.navigate(game.screen);
                }
              }}
              activeOpacity={game.screen ? 0.7 : 1}
            >
              <Text style={styles.gameEmoji}>{game.emoji}</Text>
              <Text style={styles.gameName}>{game.name}</Text>
              <Text style={styles.gameDesc}>{game.description}</Text>
              {!game.screen && (
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
    backgroundColor: "#fffbeb",
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  backBtn: {
    fontSize: fontSize.sm,
    color: "#f59e0b",
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#92400e",
    textAlign: "center",
  },
  subtitle: {
    fontSize: fontSize.base,
    color: "#b45309",
    textAlign: "center",
    marginTop: spacing.xs,
    opacity: 0.7,
  },
  grid: {
    gap: spacing.md,
  },
  gameCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fde68a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gameEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  gameName: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: "#78350f",
  },
  gameDesc: {
    fontSize: fontSize.sm,
    color: "#92400e",
    textAlign: "center",
    marginTop: spacing.xs,
    opacity: 0.7,
  },
  comingSoonBadge: {
    marginTop: spacing.sm,
    backgroundColor: "#fcd34d",
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  comingSoonText: {
    fontSize: fontSize.xs,
    color: "#78350f",
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
