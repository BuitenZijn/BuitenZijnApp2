import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
  borderRadius,
} from "../../styles/theme";
import { useNavigation } from "@react-navigation/native";

export default function QRScannerScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    newBalance?: number;
    sessionInfo?: string;
  } | null>(null);

  const checkIn = useMutation(api.danceCheckins.checkIn);
  const balance = useQuery(
    api.danceCredits.getBalance,
    user?._id ? { userId: user._id } : "skip",
  );

  const handleBarCodeScanned = async (data: string) => {
    if (scanned || checking || !user?._id) return;

    setScanned(true);
    setChecking(true);

    try {
      // The QR contains the token directly
      const qrToken = data.trim();

      const response = await checkIn({
        userId: user._id,
        qrToken,
      });

      if (response.success) {
        setResult({
          success: true,
          message: "Ingecheckt!",
          newBalance: response.newBalance,
          sessionInfo: `${response.sessionDate} • ${response.sessionTime}\n${response.sessionLocation}`,
        });
      } else {
        setResult({
          success: false,
          message: response.error || "Check-in mislukt",
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "Er ging iets mis",
      });
    } finally {
      setChecking(false);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setResult(null);
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.green[500]} />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.permissionTitle}>📷 Camera Toegang</Text>
          <Text style={styles.permissionText}>
            We hebben toegang tot je camera nodig om de QR-code te scannen.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>
              Camera Toegang Geven
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backLinkText}>← Terug</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Result screen
  if (result) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.resultEmoji}>{result.success ? "✅" : "❌"}</Text>
          <Text
            style={[
              styles.resultTitle,
              { color: result.success ? colors.green[700] : colors.rust[500] },
            ]}
          >
            {result.message}
          </Text>

          {result.success && result.newBalance !== undefined && (
            <View style={styles.resultBalance}>
              <Text style={styles.resultBalanceLabel}>Resterend saldo</Text>
              <Text style={styles.resultBalanceValue}>
                {result.newBalance} credit
                {result.newBalance !== 1 ? "s" : ""}
              </Text>
            </View>
          )}

          {result.sessionInfo && (
            <Text style={styles.resultSessionInfo}>{result.sessionInfo}</Text>
          )}

          <View style={styles.resultActions}>
            {!result.success && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={resetScanner}
              >
                <Text style={styles.retryButtonText}>Opnieuw Scannen</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.doneButtonText}>Klaar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.scannerContainer} edges={["top"]}>
      {/* Top bar */}
      <View style={styles.scannerHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.scannerBack}>← Terug</Text>
        </TouchableOpacity>
        <Text style={styles.scannerTitle}>Scan QR-code</Text>
        {balance !== undefined && (
          <Text style={styles.scannerBalance}>
            {balance} credit{balance !== 1 ? "s" : ""}
          </Text>
        )}
      </View>

      {/* Camera */}
      <View style={styles.cameraWrapper}>
        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={
            scanned ? undefined : (result) => handleBarCodeScanned(result.data)
          }
        />

        {/* Overlay */}
        <View style={styles.overlay}>
          <View style={styles.overlayFrame} />
        </View>

        {checking && (
          <View style={styles.checkingOverlay}>
            <ActivityIndicator size="large" color={colors.white} />
            <Text style={styles.checkingText}>Inchecken...</Text>
          </View>
        )}
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>
          Richt je camera op de QR-code bij de les
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing["3xl"],
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Permission
  permissionTitle: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  permissionText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing["2xl"],
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: colors.green[500],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing["3xl"],
  },
  permissionButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  backLink: {
    marginTop: spacing.xl,
  },
  backLinkText: {
    fontSize: fontSize.base,
    color: colors.green[600],
  },

  // Scanner
  scannerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  scannerBack: {
    fontSize: fontSize.base,
    color: colors.white,
  },
  scannerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  scannerBalance: {
    fontSize: fontSize.sm,
    color: colors.green[300],
    fontWeight: fontWeight.medium,
  },
  cameraWrapper: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  overlayFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: colors.green[400],
    borderRadius: borderRadius.xl,
    backgroundColor: "transparent",
  },
  checkingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  checkingText: {
    fontSize: fontSize.lg,
    color: colors.white,
    marginTop: spacing.md,
  },
  instructions: {
    padding: spacing.xl,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
  },
  instructionsText: {
    fontSize: fontSize.base,
    color: colors.white,
    textAlign: "center",
  },

  // Result
  resultEmoji: {
    fontSize: 64,
    marginBottom: spacing.xl,
  },
  resultTitle: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  resultBalance: {
    backgroundColor: colors.green[50],
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.lg,
    width: "100%",
  },
  resultBalanceLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  resultBalanceValue: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.green[700],
  },
  resultSessionInfo: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing["2xl"],
  },
  resultActions: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
  },
  retryButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderColor: colors.green[500],
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  retryButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.green[600],
  },
  doneButton: {
    flex: 1,
    backgroundColor: colors.green[500],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  doneButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
});
