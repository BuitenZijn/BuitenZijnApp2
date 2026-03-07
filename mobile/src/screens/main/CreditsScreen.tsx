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

export default function CreditsScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();

  const balance = useQuery(
    api.danceCredits.getBalance,
    user?._id ? { userId: user._id } : "skip",
  );

  const history = useQuery(
    api.danceCredits.getPurchaseHistory,
    user?._id ? { userId: user._id } : "skip",
  );

  const checkinHistory = useQuery(
    api.danceCheckins.getHistory,
    user?._id ? { userId: user._id } : "skip",
  );

  if (balance === undefined) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.green[500]} />
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString("nl-BE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (cents: number) => {
    return `€${(Math.abs(cents) / 100).toFixed(2)}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Danskrediet</Text>
        </View>

        {/* Balance Card */}
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Huidig saldo</Text>
          <Text style={styles.balanceValue}>{balance}</Text>
          <Text style={styles.balanceUnit}>
            krediet{balance !== 1 ? "en" : ""}
          </Text>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("BuyCredits" as never)}
          >
            <Text style={styles.actionEmoji}>🛒</Text>
            <Text style={styles.actionText}>Koop Krediet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButtonSecondary}
            onPress={() => navigation.navigate("QRScanner" as never)}
          >
            <Text style={styles.actionEmoji}>📷</Text>
            <Text style={styles.actionTextSecondary}>Scan QR</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Check-ins */}
        {checkinHistory && checkinHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recente Check-ins</Text>
            {checkinHistory.slice(0, 5).map((checkin: any) => (
              <Card key={checkin._id} style={styles.historyCard}>
                <View style={styles.historyRow}>
                  <View>
                    <Text style={styles.historyTitle}>
                      📍 {checkin.sessionLocation || "Lijndansles"}
                    </Text>
                    <Text style={styles.historyDate}>
                      {checkin.sessionDate} • {checkin.sessionTime}
                    </Text>
                  </View>
                  <Text style={styles.historyDeducted}>
                    -{checkin.creditsDeducted}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Purchase History */}
        {history && history.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Aankoophistoriek</Text>
            {history.map((purchase: any) => (
              <Card key={purchase._id} style={styles.historyCard}>
                <View style={styles.historyRow}>
                  <View>
                    <Text style={styles.historyTitle}>
                      {purchase.packageName}
                    </Text>
                    <Text style={styles.historyDate}>
                      {formatDate(purchase.createdAt)} •{" "}
                      {purchase.paymentMethod === "stripe"
                        ? "Stripe"
                        : purchase.paymentMethod === "cash"
                          ? "Cash"
                          : "Manueel"}
                    </Text>
                  </View>
                  <View style={styles.historyRight}>
                    <Text
                      style={[
                        styles.historyCredits,
                        {
                          color:
                            purchase.credits > 0
                              ? colors.green[600]
                              : colors.rust[500],
                        },
                      ]}
                    >
                      {purchase.credits > 0 ? "+" : ""}
                      {purchase.credits}
                    </Text>
                    {purchase.amountPaidInCents > 0 && (
                      <Text style={styles.historyAmount}>
                        {formatPrice(purchase.amountPaidInCents)}
                      </Text>
                    )}
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Empty state */}
        {(!history || history.length === 0) &&
          (!checkinHistory || checkinHistory.length === 0) && (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>💃</Text>
              <Text style={styles.emptyText}>
                Nog geen activiteit. Koop danskrediet om te beginnen!
              </Text>
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
  loading: {
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
  headerTitle: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  balanceCard: {
    alignItems: "center",
    paddingVertical: spacing["3xl"],
    backgroundColor: colors.green[50],
    borderColor: colors.green[200],
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  balanceLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  balanceValue: {
    fontSize: fontSize["4xl"],
    fontWeight: fontWeight.bold,
    color: colors.green[700],
  },
  balanceUnit: {
    fontSize: fontSize.base,
    color: colors.green[600],
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing["2xl"],
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.green[500],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: "center",
    ...shadows.md,
  },
  actionButtonSecondary: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.green[300],
    ...shadows.sm,
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  actionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  actionTextSecondary: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.green[700],
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  historyCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  historyDate: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  historyRight: {
    alignItems: "flex-end",
  },
  historyCredits: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  historyAmount: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  historyDeducted: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.rust[500],
  },
  emptyCard: {
    alignItems: "center",
    padding: spacing["3xl"],
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
