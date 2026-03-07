import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
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
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../navigation/types";

type Nav = NativeStackNavigationProp<MainStackParamList>;

export default function AdminSessionScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();

  const [showCreate, setShowCreate] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("15:00");
  const [endTime, setEndTime] = useState("16:00");
  const [location, setLocation] = useState("Buurthuis");
  const [creating, setCreating] = useState(false);

  const sessions = useQuery(api.danceSessions.list, { limit: 20 });
  const todaySession = useQuery(api.danceSessions.getToday);
  const createSession = useMutation(api.danceSessions.create);
  const regenerateQr = useMutation(api.danceSessions.regenerateQr);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await createSession({ date, startTime, endTime, location });
      setShowCreate(false);
      Alert.alert("Succes", "Sessie aangemaakt!");
    } catch (error: any) {
      Alert.alert("Fout", error.message || "Kon sessie niet aanmaken");
    } finally {
      setCreating(false);
    }
  };

  const handleRegenerateQr = async (sessionId: string) => {
    Alert.alert(
      "Nieuwe QR",
      "Weet je zeker dat je een nieuwe QR-code wilt genereren? De oude wordt ongeldig.",
      [
        { text: "Annuleer", style: "cancel" },
        {
          text: "Genereer",
          onPress: async () => {
            try {
              await regenerateQr({ sessionId: sessionId as any });
              Alert.alert("Succes", "Nieuwe QR-code gegenereerd");
            } catch (error: any) {
              Alert.alert("Fout", error.message);
            }
          },
        },
      ],
    );
  };

  const isAdmin = user?.roles?.includes("admin") ?? false;
  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.noAccess}>Geen toegang</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Terug</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sessie Beheer</Text>
        </View>

        {/* Today's Session QR */}
        {todaySession && (
          <Card style={styles.todayCard}>
            <Text style={styles.todayLabel}>Vandaag</Text>
            <Text style={styles.todayDate}>
              {todaySession.date} • {todaySession.startTime} -{" "}
              {todaySession.endTime}
            </Text>
            <Text style={styles.todayLocation}>📍 {todaySession.location}</Text>

            <View style={styles.qrSection}>
              <Text style={styles.qrLabel}>QR Token (voor poster/scherm)</Text>
              <View style={styles.qrTokenBox}>
                <Text style={styles.qrToken} selectable>
                  {todaySession.qrToken}
                </Text>
              </View>
              <Text style={styles.qrHint}>
                Maak een QR-code van bovenstaande token en hang deze op
              </Text>
            </View>

            <View style={styles.todayActions}>
              <TouchableOpacity
                style={styles.regenerateButton}
                onPress={() => handleRegenerateQr(todaySession._id)}
              >
                <Text style={styles.regenerateText}>🔄 Nieuwe QR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.attendeesButton}
                onPress={() =>
                  (navigation.navigate as any)("AdminAttendance", {
                    sessionId: todaySession._id,
                  })
                }
              >
                <Text style={styles.attendeesText}>👥 Aanwezigen</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {!todaySession && (
          <Card style={styles.noTodayCard}>
            <Text style={styles.noTodayText}>
              Geen sessie vandaag. Maak er eentje aan 👇
            </Text>
          </Card>
        )}

        {/* Create Session */}
        <TouchableOpacity
          style={styles.createToggle}
          onPress={() => setShowCreate(!showCreate)}
        >
          <Text style={styles.createToggleText}>
            {showCreate ? "Annuleer" : "+ Nieuwe Sessie"}
          </Text>
        </TouchableOpacity>

        {showCreate && (
          <Card style={styles.createCard}>
            <Text style={styles.fieldLabel}>Datum</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="2026-02-22"
            />

            <Text style={styles.fieldLabel}>Start</Text>
            <TextInput
              style={styles.input}
              value={startTime}
              onChangeText={setStartTime}
              placeholder="15:00"
            />

            <Text style={styles.fieldLabel}>Einde</Text>
            <TextInput
              style={styles.input}
              value={endTime}
              onChangeText={setEndTime}
              placeholder="16:00"
            />

            <Text style={styles.fieldLabel}>Locatie</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Buurthuis"
            />

            <TouchableOpacity
              style={[styles.createButton, creating && { opacity: 0.6 }]}
              onPress={handleCreate}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.createButtonText}>Sessie Aanmaken</Text>
              )}
            </TouchableOpacity>
          </Card>
        )}

        {/* Past Sessions */}
        {sessions && sessions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sessies</Text>
            {sessions.map((session: any) => (
              <TouchableOpacity
                key={session._id}
                onPress={() =>
                  (navigation.navigate as any)("AdminAttendance", {
                    sessionId: session._id,
                  })
                }
              >
                <Card style={styles.sessionCard}>
                  <View style={styles.sessionRow}>
                    <View>
                      <Text style={styles.sessionDate}>{session.date}</Text>
                      <Text style={styles.sessionTime}>
                        {session.startTime} - {session.endTime} •{" "}
                        {session.location}
                      </Text>
                    </View>
                    <Text style={styles.sessionArrow}>→</Text>
                  </View>
                </Card>
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
  },
  noAccess: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing["5xl"],
  },
  header: {
    marginBottom: spacing.xl,
  },
  backButton: {
    fontSize: fontSize.base,
    color: colors.green[600],
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  todayCard: {
    padding: spacing.xl,
    borderColor: colors.green[300],
    borderWidth: 2,
    backgroundColor: colors.green[50],
    marginBottom: spacing.xl,
  },
  todayLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.green[600],
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  todayDate: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  todayLocation: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  qrSection: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  qrLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  qrTokenBox: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  qrToken: {
    fontSize: fontSize.sm,
    fontFamily: "monospace",
    color: colors.text,
    textAlign: "center",
  },
  qrHint: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    textAlign: "center",
  },
  todayActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  regenerateButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  regenerateText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  attendeesButton: {
    flex: 1,
    backgroundColor: colors.green[500],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: "center",
  },
  attendeesText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  noTodayCard: {
    padding: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  noTodayText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: "center",
  },
  createToggle: {
    backgroundColor: colors.green[500],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: "center",
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  createToggleText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  createCard: {
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.text,
  },
  createButton: {
    backgroundColor: colors.green[600],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: "center",
    marginTop: spacing.xl,
  },
  createButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  sessionCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  sessionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionDate: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  sessionTime: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sessionArrow: {
    fontSize: fontSize.lg,
    color: colors.textLight,
  },
});
