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
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card } from "../../components/ui";
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
  borderRadius,
} from "../../styles/theme";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function AdminAttendanceScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { sessionId } = (route.params as { sessionId: string }) || {};

  const session = useQuery(
    api.danceSessions.get,
    sessionId ? { sessionId: sessionId as any } : "skip",
  );
  const attendees = useQuery(
    api.danceSessions.getAttendees,
    sessionId ? { sessionId: sessionId as any } : "skip",
  );

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString("nl-BE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (session === undefined || attendees === undefined) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.green[500]} />
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
          <Text style={styles.headerTitle}>Aanwezigheid</Text>
          {session && (
            <Text style={styles.sessionInfo}>
              {session.date} • {session.startTime} - {session.endTime} •{" "}
              {session.location}
            </Text>
          )}
        </View>

        {/* Count */}
        <Card style={styles.countCard}>
          <Text style={styles.countValue}>{attendees?.length ?? 0}</Text>
          <Text style={styles.countLabel}>
            aanwezige{(attendees?.length ?? 0) !== 1 ? "n" : ""}
          </Text>
        </Card>

        {/* Attendees List */}
        {attendees && attendees.length > 0 ? (
          <View style={styles.list}>
            {attendees.map((a: any, index: number) => (
              <Card key={a.checkinId} style={styles.attendeeCard}>
                <View style={styles.attendeeRow}>
                  <View style={styles.attendeeNumber}>
                    <Text style={styles.numberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.attendeeInfo}>
                    <Text style={styles.attendeeName}>{a.userName}</Text>
                    <Text style={styles.attendeeEmail}>{a.userEmail}</Text>
                  </View>
                  <Text style={styles.attendeeTime}>
                    {formatTime(a.checkedInAt)}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nog geen check-ins</Text>
          </Card>
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
  sessionInfo: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  countCard: {
    alignItems: "center",
    paddingVertical: spacing["2xl"],
    backgroundColor: colors.green[50],
    borderColor: colors.green[200],
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  countValue: {
    fontSize: fontSize["4xl"],
    fontWeight: fontWeight.bold,
    color: colors.green[700],
  },
  countLabel: {
    fontSize: fontSize.base,
    color: colors.green[600],
  },
  list: {
    gap: spacing.sm,
  },
  attendeeCard: {
    padding: spacing.md,
  },
  attendeeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  attendeeNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.green[100],
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  numberText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.green[700],
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  attendeeEmail: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  attendeeTime: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  emptyCard: {
    alignItems: "center",
    padding: spacing["3xl"],
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
});
