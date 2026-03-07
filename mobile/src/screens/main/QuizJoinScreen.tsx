import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../navigation/types";
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
  borderRadius,
  shadows,
} from "../../styles/theme";

type NavProp = NativeStackNavigationProp<MainStackParamList>;

export default function QuizJoinScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<NavProp>();
  const joinSession = useMutation(api.quizzes.joinSession);

  const [joinCode, setJoinCode] = useState("");
  const [displayName, setDisplayName] = useState(
    user?.firstName || user?.name || "",
  );
  const [joining, setJoining] = useState(false);

  const activeQuizzes = useQuery(api.quizzes.getActiveQuizzes);

  const handleJoin = async () => {
    if (!joinCode.trim() || !displayName.trim()) {
      Alert.alert("Vul alle velden in", "Je hebt een code en naam nodig.");
      return;
    }

    setJoining(true);
    try {
      const result = await joinSession({
        joinCode: joinCode.trim().toUpperCase(),
        displayName: displayName.trim(),
        userId: user?._id,
      });
      navigation.navigate("QuizPlay", {
        sessionId: result.sessionId,
        participantId: result.participantId,
      });
    } catch (e: any) {
      Alert.alert("Fout", e.message || "Kan niet deelnemen aan de quiz.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>← Terug</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🎯 Buzz Quiz</Text>
          <Text style={styles.subtitle}>
            Beantwoord vragen zo snel mogelijk!
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Deelnemen aan Quiz</Text>

          <Text style={styles.label}>Jouw naam</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Hoe heet je?"
            placeholderTextColor={colors.textLight}
          />

          <Text style={styles.label}>Deelnamecode</Text>
          <TextInput
            style={[styles.input, styles.codeInput]}
            value={joinCode}
            onChangeText={(t) => setJoinCode(t.toUpperCase())}
            placeholder="ABC123"
            placeholderTextColor={colors.textLight}
            autoCapitalize="characters"
            maxLength={6}
          />

          <TouchableOpacity
            style={[styles.joinBtn, joining && styles.joinBtnDisabled]}
            onPress={handleJoin}
            disabled={joining}
            activeOpacity={0.7}
          >
            <Text style={styles.joinBtnText}>
              {joining ? "Deelnemen..." : "🚀 Deelnemen!"}
            </Text>
          </TouchableOpacity>
        </View>

        {activeQuizzes && activeQuizzes.length > 0 && (
          <View style={styles.activeSection}>
            <Text style={styles.activeTitle}>Beschikbare Quizzen</Text>
            {activeQuizzes.map((q) => (
              <View key={q._id} style={styles.activeCard}>
                <Text style={styles.activeName}>{q.title}</Text>
                {q.description && (
                  <Text style={styles.activeDesc}>{q.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  headerBar: {
    marginBottom: spacing["2xl"],
  },
  backBtn: {
    marginBottom: spacing.md,
  },
  backText: {
    color: colors.purple[500],
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  title: {
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.bold,
    color: colors.navy[800],
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing["2xl"],
    ...shadows.md,
  },
  cardTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.navy[800],
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.beige[100],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeInput: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    textAlign: "center",
    letterSpacing: 4,
  },
  joinBtn: {
    backgroundColor: colors.purple[500],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: "center",
    marginTop: spacing["2xl"],
  },
  joinBtnDisabled: {
    opacity: 0.6,
  },
  joinBtnText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  activeSection: {
    marginTop: spacing["3xl"],
  },
  activeTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.navy[800],
    marginBottom: spacing.md,
  },
  activeCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  activeName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.navy[800],
  },
  activeDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
