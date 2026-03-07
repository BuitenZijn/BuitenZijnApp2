import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useAction } from "convex/react";
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

export default function BuyCreditsScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loadingPackageId, setLoadingPackageId] = useState<string | null>(null);

  const packages = useQuery(api.creditPackages.listActive);
  const balance = useQuery(
    api.danceCredits.getBalance,
    user?._id ? { userId: user._id } : "skip",
  );
  const createCheckout = useAction(api.stripe.createCheckoutSession);

  const handleBuy = async (packageId: string) => {
    if (!user?._id) return;

    setLoadingPackageId(packageId);
    try {
      const result = await createCheckout({
        userId: user._id,
        packageId: packageId as any,
      });

      if (result.url) {
        // Open Stripe Checkout in browser
        await Linking.openURL(result.url);
      } else {
        Alert.alert("Fout", "Kon betaallink niet aanmaken");
      }
    } catch (error: any) {
      Alert.alert(
        "Fout",
        error.message || "Er ging iets mis bij het aanmaken van de betaling",
      );
    } finally {
      setLoadingPackageId(null);
    }
  };

  const formatPrice = (cents: number) => {
    return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
  };

  const getPricePerCredit = (pkg: {
    credits: number;
    priceInCents: number;
  }) => {
    return `€${(pkg.priceInCents / 100 / pkg.credits).toFixed(2).replace(".", ",")}`;
  };

  if (packages === undefined) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loading}>
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
          <Text style={styles.headerTitle}>Koop Danskrediet</Text>
          {balance !== undefined && (
            <Text style={styles.currentBalance}>
              Huidig saldo: {balance} credit{balance !== 1 ? "s" : ""}
            </Text>
          )}
        </View>

        {/* Packages */}
        {packages.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Er zijn momenteel geen pakketten beschikbaar.
            </Text>
          </Card>
        ) : (
          <View style={styles.packages}>
            {packages.map((pkg: any) => {
              const isBestValue =
                packages.length > 1 &&
                pkg.credits ===
                  Math.max(...packages.map((p: any) => p.credits));
              const isLoading = loadingPackageId === pkg._id;

              return (
                <Card
                  key={pkg._id}
                  style={[
                    styles.packageCard,
                    isBestValue && styles.packageCardBest,
                  ]}
                >
                  {isBestValue && (
                    <View style={styles.bestBadge}>
                      <Text style={styles.bestBadgeText}>Beste deal</Text>
                    </View>
                  )}

                  <Text style={styles.packageName}>{pkg.name}</Text>

                  <View style={styles.packageDetails}>
                    <Text style={styles.packageCredits}>
                      {pkg.credits} credit{pkg.credits > 1 ? "s" : ""}
                    </Text>
                    <Text style={styles.packagePrice}>
                      {formatPrice(pkg.priceInCents)}
                    </Text>
                  </View>

                  {pkg.credits > 1 && (
                    <Text style={styles.packagePerCredit}>
                      {getPricePerCredit(pkg)} per credit
                    </Text>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.buyButton,
                      isBestValue && styles.buyButtonBest,
                      isLoading && styles.buyButtonDisabled,
                    ]}
                    onPress={() => handleBuy(pkg._id)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                      <Text style={styles.buyButtonText}>Kopen</Text>
                    )}
                  </TouchableOpacity>
                </Card>
              );
            })}
          </View>
        )}

        {/* Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Hoe werkt het?</Text>
          <Text style={styles.infoText}>
            1. Koop een creditpakket via Stripe{"\n"}
            2. Betaal veilig met kaart of Bancontact{"\n"}
            3. Credits worden direct bijgeschreven{"\n"}
            4. Scan de QR-code bij de les om in te checken
          </Text>
        </Card>
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
    marginBottom: spacing["2xl"],
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
  currentBalance: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  packages: {
    gap: spacing.lg,
    marginBottom: spacing["2xl"],
  },
  packageCard: {
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  packageCardBest: {
    borderColor: colors.green[400],
    borderWidth: 2,
    backgroundColor: colors.green[50],
  },
  bestBadge: {
    position: "absolute",
    top: -10,
    right: spacing.lg,
    backgroundColor: colors.green[500],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  bestBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  packageName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  packageDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  packageCredits: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.green[700],
  },
  packagePrice: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  packagePerCredit: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  buyButton: {
    backgroundColor: colors.green[500],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    ...shadows.sm,
  },
  buyButtonBest: {
    backgroundColor: colors.green[600],
  },
  buyButtonDisabled: {
    opacity: 0.6,
  },
  buyButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  emptyCard: {
    alignItems: "center",
    padding: spacing["3xl"],
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: "center",
  },
  infoCard: {
    padding: spacing.lg,
    backgroundColor: colors.blue[50],
    borderColor: colors.blue[200],
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.blue[700],
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.blue[800],
    lineHeight: 22,
  },
});
