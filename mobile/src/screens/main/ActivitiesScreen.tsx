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
import {
  useNavigation,
  CompositeNavigationProp,
} from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type {
  MainTabParamList,
  MainStackParamList,
} from "../../navigation/types";
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
  borderRadius,
  shadows,
} from "../../styles/theme";

type NavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<MainStackParamList>
>;

interface ActivityItem {
  title: string;
  description: string;
  emoji: string;
  color: string;
  onPress: () => void;
}

export default function ActivitiesScreen() {
  const navigation = useNavigation<NavProp>();

  const activities: ActivityItem[] = [
    {
      title: "Lijndansen",
      description: "Bekijk alle dansen, video's en muziek",
      emoji: "💃",
      color: colors.green[500],
      onPress: () => navigation.navigate("Dances"),
    },
    {
      title: "Parelende Peloton",
      description: "Fietsritten en Strava-activiteiten",
      emoji: "🚴",
      color: colors.blue[500],
      onPress: () =>
        Linking.openURL(
          "https://buitenzijnvzw.be/activiteiten/parelende-peloton",
        ),
    },
    {
      title: "Quiz",
      description: "Onze jaarlijkse quiz-edities",
      emoji: "🧠",
      color: colors.purple[500],
      onPress: () =>
        Linking.openURL("https://buitenzijnvzw.be/activiteiten/quiz"),
    },
    {
      title: "Buzz Quiz",
      description: "Beantwoord vragen zo snel mogelijk!",
      emoji: "🎯",
      color: colors.purple[400],
      onPress: () => navigation.navigate("QuizJoin"),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerBar}>
          <Text style={styles.title}>Activiteiten</Text>
          <Text style={styles.subtitle}>
            Ontdek alles wat Buiten Zijn te bieden heeft
          </Text>
        </View>

        <View style={styles.grid}>
          {activities.map((item) => (
            <TouchableOpacity
              key={item.title}
              style={styles.card}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: item.color + "20" },
                ]}
              >
                <Text style={styles.emoji}>{item.emoji}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.description}</Text>
              <View style={[styles.accent, { backgroundColor: item.color }]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Social / info section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Volg ons</Text>
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={[styles.socialBtn, { backgroundColor: "#E1306C" }]}
              onPress={() =>
                Linking.openURL("https://www.instagram.com/buitenzijnvzw/")
              }
            >
              <Text style={styles.socialText}>📸 Instagram</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialBtn, { backgroundColor: "#1877F2" }]}
              onPress={() =>
                Linking.openURL("https://www.facebook.com/buitenzijnvzw/")
              }
            >
              <Text style={styles.socialText}>📘 Facebook</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  headerBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.navy[800],
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  grid: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.sm,
    position: "relative",
    overflow: "hidden",
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  emoji: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.navy[800],
    marginBottom: spacing.xs,
  },
  cardDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  accent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  infoSection: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing["2xl"],
  },
  infoTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.navy[800],
    marginBottom: spacing.md,
  },
  socialRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  socialBtn: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: "center",
  },
  socialText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
