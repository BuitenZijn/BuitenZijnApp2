import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "../../contexts/AuthContext";
import { Card, Button } from "../../components/ui";
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
  borderRadius,
} from "../../styles/theme";

const PRIVACY_POLICY_URL = "https://buitenzijnvzw.be/privacy-policy";
const CONFIRM_PHRASE = "account verwijderen";

export default function ProfileScreen() {
  const { user, sessionToken, logout } = useAuth();
  const deleteAccountMutation = useMutation(api.users.deleteAccount);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleLogout = () => {
    Alert.alert("Afmelden", "Weet je zeker dat je wilt afmelden?", [
      { text: "Annuleren", style: "cancel" },
      { text: "Afmelden", style: "destructive", onPress: logout },
    ]);
  };

  const handleDeleteAccount = async () => {
    if (confirmText.toLowerCase() !== CONFIRM_PHRASE) return;
    if (!user?._id || !sessionToken) return;

    setDeleting(true);
    try {
      await deleteAccountMutation({
        sessionToken,
        userId: user._id as Id<"users">,
      });
      await logout();
    } catch (err: any) {
      setDeleting(false);
      Alert.alert(
        "Fout",
        err.message || "Account verwijderen mislukt. Probeer opnieuw.",
      );
    }
  };

  const confirmDeleteAlert = () => {
    setShowDeleteConfirm(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar / name header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.firstName?.[0] || user?.email?.[0] || "?").toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>
            {user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.name || "Gebruiker"}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {user?.roles?.join(", ") || "guest"}
            </Text>
          </View>
        </View>

        {/* Profile info */}
        <Card style={styles.infoCard}>
          <ProfileRow label="E-mail" value={user?.email || "-"} />
          <ProfileRow label="Voornaam" value={user?.firstName || "-"} />
          <ProfileRow label="Achternaam" value={user?.lastName || "-"} />
          <ProfileRow label="Telefoon" value={user?.phone || "-"} last />
        </Card>

        {/* Legal links */}
        <Card style={styles.infoCard}>
          <TouchableOpacity
            style={styles.legalRow}
            onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
          >
            <Text style={styles.legalLink}>🔒 Privacybeleid</Text>
            <Text style={styles.legalChevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.legalRow,
              { borderTopWidth: 1, borderTopColor: colors.border },
            ]}
            onPress={() => Linking.openURL("mailto:info@buitenzijnvzw.be")}
          >
            <Text style={styles.legalLink}>
              ✉️ Contact — info@buitenzijnvzw.be
            </Text>
            <Text style={styles.legalChevron}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Afmelden"
            variant="outline"
            onPress={handleLogout}
            fullWidth
            size="lg"
          />
        </View>

        {/* Danger zone */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Gevarenzone</Text>
          <Text style={styles.dangerText}>
            Het verwijderen van je account is permanent. Je persoonlijke
            gegevens worden geanonimiseerd.
          </Text>

          {!showDeleteConfirm ? (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={confirmDeleteAlert}
            >
              <Text style={styles.deleteButtonText}>Account verwijderen</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.confirmBox}>
              <Text style={styles.confirmInstruction}>
                Typ <Text style={styles.confirmPhrase}>{CONFIRM_PHRASE}</Text>{" "}
                om te bevestigen:
              </Text>
              <TextInput
                style={styles.confirmInput}
                value={confirmText}
                onChangeText={setConfirmText}
                placeholder={CONFIRM_PHRASE}
                placeholderTextColor={colors.textLight}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={[
                    styles.confirmDeleteBtn,
                    confirmText.toLowerCase() !== CONFIRM_PHRASE &&
                      styles.btnDisabled,
                  ]}
                  onPress={handleDeleteAccount}
                  disabled={
                    deleting || confirmText.toLowerCase() !== CONFIRM_PHRASE
                  }
                >
                  <Text style={styles.confirmDeleteBtnText}>
                    {deleting ? "Verwijderen..." : "Definitief verwijderen"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setShowDeleteConfirm(false);
                    setConfirmText("");
                  }}
                >
                  <Text style={styles.cancelBtnText}>Annuleren</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing["4xl"] ?? spacing["2xl"],
  },
  header: {
    alignItems: "center",
    marginBottom: spacing["2xl"],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.green[500],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: fontSize["4xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  roleBadge: {
    backgroundColor: colors.blue[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  roleText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.blue[700],
    textTransform: "capitalize",
  },
  infoCard: {
    marginBottom: spacing["2xl"],
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  rowValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    flexShrink: 1,
    textAlign: "right",
    marginLeft: spacing.md,
  },
  legalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  legalLink: {
    fontSize: fontSize.sm,
    color: colors.green[700] ?? colors.green[500],
  },
  legalChevron: {
    fontSize: fontSize.lg,
    color: colors.textLight,
  },
  actions: {
    gap: spacing.md,
    marginBottom: spacing["2xl"],
  },
  // Danger zone
  dangerZone: {
    backgroundColor: "#fff5f5",
    borderWidth: 1,
    borderColor: "#fca5a5",
    borderRadius: borderRadius.lg ?? 12,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  dangerTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: "#b91c1c",
    marginBottom: spacing.xs,
  },
  dangerText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  deleteButton: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: "#fca5a5",
    borderRadius: borderRadius.md ?? 8,
    backgroundColor: "#fff0f0",
  },
  deleteButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: "#b91c1c",
  },
  confirmBox: {
    gap: spacing.md,
  },
  confirmInstruction: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  confirmPhrase: {
    fontWeight: fontWeight.bold,
    color: "#b91c1c",
  },
  confirmInput: {
    borderWidth: 1,
    borderColor: "#fca5a5",
    borderRadius: borderRadius.md ?? 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.white,
  },
  confirmButtons: {
    flexDirection: "row",
    gap: spacing.md,
    flexWrap: "wrap",
  },
  confirmDeleteBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: "#dc2626",
    borderRadius: borderRadius.md ?? 8,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  confirmDeleteBtnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  cancelBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md ?? 8,
    backgroundColor: colors.white,
  },
  cancelBtnText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
});
