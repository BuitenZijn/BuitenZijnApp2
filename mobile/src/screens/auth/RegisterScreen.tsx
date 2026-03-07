import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../../contexts/AuthContext";
import { Button, Input, PasswordInput } from "../../components/ui";
import { colors, fontSize, fontWeight, spacing } from "../../styles/theme";
import { AuthStackParamList } from "../../navigation/types";

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Register">;
};

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Invalid email address";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await register({
        email: email.trim().toLowerCase(),
        password: password,
        name: `${firstName.trim()} ${lastName.trim()}`,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      if (!result.success) {
        Alert.alert(
          "Registration Failed",
          result.error || "Could not create account",
        );
      }
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>🌿 BuitenZijn</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the BuitenZijn community</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <Input
                label="First Name"
                placeholder="Jan"
                value={firstName}
                onChangeText={setFirstName}
                error={errors.firstName}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.nameField}>
              <Input
                label="Last Name"
                placeholder="Janssens"
                value={lastName}
                onChangeText={setLastName}
                error={errors.lastName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <Input
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <PasswordInput
            label="Password"
            placeholder="At least 8 characters"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
          />

          <PasswordInput
            label="Confirm Password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            fullWidth
            size="lg"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.linkText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing["2xl"],
    paddingVertical: spacing["3xl"],
  },
  header: {
    alignItems: "center",
    marginBottom: spacing["3xl"],
  },
  logo: {
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.bold,
    color: colors.green[500],
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  form: {
    marginBottom: spacing["2xl"],
  },
  nameRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  nameField: {
    flex: 1,
  },
  linkText: {
    color: colors.green[500],
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
});
