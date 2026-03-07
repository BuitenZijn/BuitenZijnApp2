import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui';
import { colors, fontSize, fontWeight, spacing, shadows } from '../../styles/theme';

export default function DashboardScreen() {
  const { user } = useAuth();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting()},</Text>
          <Text style={styles.userName}>
            {user?.firstName || user?.name || 'there'} 👋
          </Text>
        </View>

        <Card style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>🌿 Welcome to BuitenZijn</Text>
          <Text style={styles.welcomeText}>
            This is your dashboard. More features are coming soon!
          </Text>
        </Card>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <Card style={styles.actionCard} variant="outlined">
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionLabel}>Activities</Text>
          </Card>
          <Card style={styles.actionCard} variant="outlined">
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionLabel}>Members</Text>
          </Card>
          <Card style={styles.actionCard} variant="outlined">
            <Text style={styles.actionIcon}>📍</Text>
            <Text style={styles.actionLabel}>Locations</Text>
          </Card>
          <Card style={styles.actionCard} variant="outlined">
            <Text style={styles.actionIcon}>📢</Text>
            <Text style={styles.actionLabel}>News</Text>
          </Card>
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
  },
  header: {
    marginBottom: spacing['2xl'],
  },
  greeting: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  welcomeCard: {
    backgroundColor: colors.green[50],
    padding: spacing.xl,
    marginBottom: spacing['2xl'],
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionCard: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  actionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
});
