import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { Card, Button } from "../../components/ui";
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
  borderRadius,
} from "../../styles/theme";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.firstName?.[0] || user?.email?.[0] || "?").toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>
            {user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.name || "User"}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {user?.roles?.join(", ") || "guest"}
            </Text>
          </View>
        </View>

        <Card style={styles.infoCard}>
          <ProfileRow label="Email" value={user?.email || "-"} />
          <ProfileRow label="First Name" value={user?.firstName || "-"} />
          <ProfileRow label="Last Name" value={user?.lastName || "-"} />
          <ProfileRow label="Phone" value={user?.phone || "-"} last />
        </Card>

        <View style={styles.actions}>
          <Button
            title="Sign Out"
            variant="outline"
            onPress={handleLogout}
            fullWidth
            size="lg"
          />
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
  },
  actions: {
    gap: spacing.md,
  },
});
