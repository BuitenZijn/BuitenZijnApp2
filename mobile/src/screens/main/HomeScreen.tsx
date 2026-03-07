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
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "../../contexts/AuthContext";
import { Card } from "../../components/ui";
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
  borderRadius,
  shadows,
} from "../../styles/theme";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type {
  MainTabParamList,
  MainStackParamList,
} from "../../navigation/types";
import { CompositeNavigationProp } from "@react-navigation/native";

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<MainStackParamList>
>;

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Goedemorgen";
    if (hour < 18) return "Goedemiddag";
    return "Goedenavond";
  };

  // Determine activity cards based on user role
  const getMyActivities = () => {
    const roles = user?.roles ?? ["guest"];
    const hasRole = (r: string) => roles.includes(r as any);
    const activities: {
      title: string;
      description: string;
      emoji: string;
      color: string;
      onPress: () => void;
    }[] = [];

    // Lijndans participants, members, and admins see lijndansen
    if (hasRole("admin") || hasRole("member") || hasRole("lijndans")) {
      activities.push({
        title: "Lijndansen",
        description: "Dansen, danskrediet en meer",
        emoji: "💃",
        color: colors.green[500],
        onPress: () => navigation.navigate("Dances"),
      });
    }

    // Members and admins see parelende peloton
    if (hasRole("admin") || hasRole("member")) {
      activities.push({
        title: "Parelende Peloton",
        description: "Fietsritten en routes",
        emoji: "🚴",
        color: colors.blue[500],
        onPress: () =>
          Linking.openURL(
            "https://buitenzijnvzw.be/activiteiten/parelende-peloton",
          ),
      });
    }

    // Members and admins see quiz
    if (hasRole("admin") || hasRole("member")) {
      activities.push({
        title: "Quiz",
        description: "Onze jaarlijkse quiz-edities",
        emoji: "🧠",
        color: colors.purple[500],
        onPress: () =>
          Linking.openURL("https://buitenzijnvzw.be/activiteiten/quiz"),
      });
    }

    // Admin has extra management
    if (hasRole("admin")) {
      activities.push({
        title: "Beheer",
        description: "Dansen & activiteiten beheren",
        emoji: "⚙️",
        color: colors.navy[500],
        onPress: () => navigation.navigate("Dances"),
      });
    }

    // ELLA - only for ella and admin roles
    if (hasRole("admin") || hasRole("ella")) {
      activities.push({
        title: "ELLA",
        description: "Knutselen, rekenen en meer!",
        emoji: "🎀",
        color: "#ec4899",
        onPress: () => navigation.navigate("Ella"),
      });
    }

    // Guest fallback
    if (activities.length === 0) {
      activities.push({
        title: "Lijndansen",
        description: "Schrijf je in voor lijndansen",
        emoji: "💃",
        color: colors.green[500],
        onPress: () => navigation.navigate("Activities"),
      });
    }

    return activities;
  };

  const myActivities = getMyActivities();
  const liveSessions = useQuery(api.quizzes.getLiveSessions);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting()},</Text>
          <Text style={styles.userName}>
            {user?.firstName || user?.name || "daar"} 👋
          </Text>
        </View>

        {/* Live Buzz Quiz banner */}
        {liveSessions && liveSessions.length > 0 && (
          <TouchableOpacity
            style={styles.buzzBanner}
            onPress={() => navigation.navigate("QuizJoin")}
            activeOpacity={0.85}
          >
            <View style={styles.buzzLiveBadge}>
              <View style={styles.buzzLiveDot} />
              <Text style={styles.buzzLiveText}>LIVE</Text>
            </View>
            <Text style={styles.buzzTitle}>🎯 Buzz Quiz</Text>
            <Text style={styles.buzzSubtitle}>
              {liveSessions[0].quizTitle} — Doe nu mee!
            </Text>
            <Text style={styles.buzzCode}>
              Code: {liveSessions[0].joinCode}
            </Text>
          </TouchableOpacity>
        )}

        {/* Welcome card */}
        <Card style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>🌿 Welkom bij BuitenZijn</Text>
          <Text style={styles.welcomeText}>
            Welkom op de app van VZW BuitenZijn. Hier vind je alle info over
            onze werking en activiteiten.
          </Text>
        </Card>

        {/* Quick navigation */}
        <Text style={styles.sectionTitle}>Snel naar</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("About")}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.actionIconBg,
                { backgroundColor: colors.green[100] },
              ]}
            >
              <Text style={styles.actionIcon}>🌿</Text>
            </View>
            <Text style={styles.actionLabel}>Over ons</Text>
            <Text style={styles.actionSub}>Over BuitenZijn VZW</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("Activities")}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.actionIconBg,
                { backgroundColor: colors.blue[100] },
              ]}
            >
              <Text style={styles.actionIcon}>🎉</Text>
            </View>
            <Text style={styles.actionLabel}>Activiteiten</Text>
            <Text style={styles.actionSub}>Alle activiteiten</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => Linking.openURL("https://buitenzijnvzw.be/shop")}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.actionIconBg,
                { backgroundColor: colors.orange[100] },
              ]}
            >
              <Text style={styles.actionIcon}>🛍️</Text>
            </View>
            <Text style={styles.actionLabel}>Shop</Text>
            <Text style={styles.actionSub}>Onze webshop</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => Linking.openURL("mailto:info@buitenzijnvzw.be")}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.actionIconBg,
                { backgroundColor: colors.purple[100] },
              ]}
            >
              <Text style={styles.actionIcon}>✉️</Text>
            </View>
            <Text style={styles.actionLabel}>Contact</Text>
            <Text style={styles.actionSub}>Neem contact op</Text>
          </TouchableOpacity>

          {(user?.roles?.includes("admin") ||
            user?.roles?.includes("ella")) && (
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate("Ella")}
              activeOpacity={0.7}
            >
              <View
                style={[styles.actionIconBg, { backgroundColor: "#fce7f3" }]}
              >
                <Text style={styles.actionIcon}>🎀</Text>
              </View>
              <Text style={styles.actionLabel}>ELLA</Text>
              <Text style={styles.actionSub}>Knutselen & rekenen</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* My Activities - role based */}
        <Text style={styles.sectionTitle}>Mijn Activiteiten</Text>
        <View style={styles.activityList}>
          {myActivities.map((activity) => (
            <TouchableOpacity
              key={activity.title}
              style={styles.activityCard}
              onPress={activity.onPress}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.activityIconBg,
                  { backgroundColor: activity.color + "20" },
                ]}
              >
                <Text style={styles.activityIcon}>{activity.emoji}</Text>
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDesc}>{activity.description}</Text>
              </View>
              <Text style={styles.activityArrow}>›</Text>
              <View
                style={[
                  styles.activityAccent,
                  { backgroundColor: activity.color },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Follow us */}
        <Text style={styles.sectionTitle}>Volg ons</Text>
        <View style={styles.socialRow}>
          <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: "#E1306C" }]}
            onPress={() =>
              Linking.openURL("https://www.instagram.com/buitenzijnvzw")
            }
            activeOpacity={0.8}
          >
            <Text style={styles.socialText}>📷 Instagram</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: "#1877F2" }]}
            onPress={() =>
              Linking.openURL("https://www.facebook.com/buitenzijnvzw")
            }
            activeOpacity={0.8}
          >
            <Text style={styles.socialText}>👤 Facebook</Text>
          </TouchableOpacity>
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
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing["3xl"],
  },
  header: {
    marginBottom: spacing["2xl"],
  },
  greeting: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  welcomeCard: {
    backgroundColor: colors.green[50],
    padding: spacing.xl,
    marginBottom: spacing["2xl"],
  },
  welcomeTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.green[800],
    marginBottom: spacing.sm,
  },
  welcomeText: {
    fontSize: fontSize.base,
    color: colors.green[700],
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing["2xl"],
  },
  actionCard: {
    width: "47%",
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  actionIconBg: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  actionSub: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  // My Activities
  activityList: {
    gap: spacing.md,
    marginBottom: spacing["2xl"],
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
    position: "relative",
    overflow: "hidden",
  },
  activityIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  activityIcon: {
    fontSize: 24,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.navy[800],
    marginBottom: 2,
  },
  activityDesc: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  activityArrow: {
    fontSize: 24,
    color: colors.textLight,
    marginLeft: spacing.sm,
  },
  activityAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: borderRadius.xl,
    borderBottomLeftRadius: borderRadius.xl,
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
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.sm,
  },
  // Buzz Quiz live banner
  buzzBanner: {
    backgroundColor: colors.purple[500],
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing["2xl"],
    ...shadows.md,
  },
  buzzLiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginBottom: spacing.sm,
  },
  buzzLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    marginRight: 6,
  },
  buzzLiveText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
  },
  buzzTitle: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: 4,
  },
  buzzSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: fontSize.base,
    marginBottom: 4,
  },
  buzzCode: {
    color: "rgba(255,255,255,0.75)",
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
