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
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
  borderRadius,
  shadows,
} from "../../styles/theme";

interface MissionCard {
  emoji: string;
  title: string;
  description: string;
  bgColor: string;
  iconBg: string;
}

const MISSION_CARDS: MissionCard[] = [
  {
    emoji: "🌳",
    title: "Behoud en Promotie Lokale Natuur",
    description:
      "We zijn er rotsvast van overtuigd dat we terug meer in harmonie moeten leven met de natuur. VZW BuitenZijn probeert dan ook de meeste van haar activiteiten in de natuur te organiseren en zet zich actief in voor het behoud en promotie van de lokale natuur.",
    bgColor: colors.green[50],
    iconBg: colors.green[100],
  },
  {
    emoji: "💪",
    title: "Welzijn Lokale Bevolking",
    description:
      "VZW BuitenZijn zet zich in voor het fysieke en mentale welzijn van de lokale bevolking door het organiseren van sportieve en leuke activiteiten.",
    bgColor: colors.blue[50],
    iconBg: colors.blue[100],
  },
  {
    emoji: "🎭",
    title: "Stimuleren Lokale Cultuur",
    description:
      "VZW BuitenZijn zet zich in voor het stimuleren van de lokale cultuur.",
    bgColor: colors.yellow[50],
    iconBg: colors.yellow[100],
  },
];

const ACTIVITIES = [
  {
    emoji: "💃",
    title: "Lijndansen",
    description: "Wekelijkse lijndanslessen voor alle niveaus",
    color: colors.green[500],
  },
  {
    emoji: "🚴",
    title: "Parelende Peloton",
    description: "Gezellige fietsritten doorheen de regio",
    color: colors.blue[500],
  },
  {
    emoji: "🧹",
    title: "Opruimacties",
    description: "Help mee de natuur schoon te maken tijdens onze opruimacties",
    color: colors.purple[500],
  },
  {
    emoji: "🧠",
    title: "BuitenZijn QuizVaganza",
    description: "Onze jaarlijkse quiz-editie",
    color: colors.purple[500],
  },
];

export default function AboutScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header with back button */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>‹ Terug</Text>
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>VZW</Text>
          </View>
          <Text style={styles.heroTitle}>BuitenZijn</Text>
          <Text style={styles.heroSubtitle}>Samen Heerlijk BuitenZijn</Text>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.aboutText}>
            VZW BuitenZijn is een vereniging die erin gelooft dat mensen te
            weinig 'buiten zijn'. We organiseren daarom diverse activiteiten
            zoals lijndansen, fietstochten, quizzen en zo veel meer om zo het
            lokale gemeenschapsleven te verrijken. Als deze activiteiten ook
            effectief buiten kunnen plaasvinden, is dat natuurlijk mooi
            meegenomen!
          </Text>
        </View>

        {/* Mission */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Onze Missie</Text>
          {MISSION_CARDS.map((card) => (
            <View
              key={card.title}
              style={[styles.missionCard, { backgroundColor: card.bgColor }]}
            >
              <View
                style={[styles.missionIconBg, { backgroundColor: card.iconBg }]}
              >
                <Text style={styles.missionEmoji}>{card.emoji}</Text>
              </View>
              <Text style={styles.missionTitle}>{card.title}</Text>
              <Text style={styles.missionDesc}>{card.description}</Text>
            </View>
          ))}
        </View>

        {/* Activities overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Een greep uit onze Activiteiten
          </Text>
          {ACTIVITIES.map((act) => (
            <View key={act.title} style={styles.activityRow}>
              <View
                style={[
                  styles.actIconBg,
                  { backgroundColor: act.color + "20" },
                ]}
              >
                <Text style={styles.actEmoji}>{act.emoji}</Text>
              </View>
              <View style={styles.actInfo}>
                <Text style={styles.actTitle}>{act.title}</Text>
                <Text style={styles.actDesc}>{act.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Contact info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.contactCard}>
            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => Linking.openURL("mailto:info@buitenzijnvzw.be")}
            >
              <Text style={styles.contactIcon}>✉️</Text>
              <Text style={styles.contactText}>info@buitenzijnvzw.be</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => Linking.openURL("https://buitenzijnvzw.be")}
            >
              <Text style={styles.contactIcon}>🌐</Text>
              <Text style={styles.contactText}>buitenzijnvzw.be</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Social links */}
        <View style={styles.section}>
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
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} VZW BuitenZijn
          </Text>
          <Text style={styles.footerSub}>Alle rechten voorbehouden.</Text>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {
    paddingVertical: spacing.xs,
    paddingRight: spacing.md,
  },
  backText: {
    fontSize: fontSize.base,
    color: colors.green[600],
    fontWeight: fontWeight.medium,
  },
  // Hero
  hero: {
    alignItems: "center",
    paddingVertical: spacing["2xl"],
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.green[600],
    marginHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    marginBottom: spacing["2xl"],
  },
  heroBadge: {
    backgroundColor: colors.green[400],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
  },
  heroBadgeText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: fontSize.base,
    color: colors.green[100],
  },
  // Sections
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing["2xl"],
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.navy[800],
    marginBottom: spacing.lg,
  },
  aboutText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  // Mission cards
  missionCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  missionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  missionEmoji: {
    fontSize: 24,
  },
  missionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.navy[800],
    marginBottom: spacing.sm,
  },
  missionDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  // Activity rows
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  actIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  actEmoji: {
    fontSize: 22,
  },
  actInfo: {
    flex: 1,
  },
  actTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.navy[800],
    marginBottom: 2,
  },
  actDesc: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  // Contact
  contactCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  contactIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  contactText: {
    fontSize: fontSize.base,
    color: colors.green[700],
  },
  // Socials
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
  // Footer
  footer: {
    alignItems: "center",
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    fontWeight: fontWeight.medium,
  },
  footerSub: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: 2,
  },
});
