import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Button, Input } from '../../components/ui';
import { colors, fontSize, fontWeight, spacing } from '../../styles/theme';
import { AuthStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
};

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const requestReset = useMutation(api.auth.requestPasswordReset);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await requestReset({ email: email.trim().toLowerCase() });
      setSent(true);
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.centeredContent}>
          <Text style={styles.successIcon}>✉️</Text>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            If an account exists for {email}, we've sent password reset instructions.
          </Text>
          <Button
            title="Back to Login"
            variant="outline"
            onPress={() => navigation.navigate('Login')}
            fullWidth
            size="lg"
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you instructions to reset your password.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            error={error}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Button
            title="Send Reset Link"
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            size="lg"
          />
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.backLink}
        >
          <Text style={styles.linkText}>← Back to Login</Text>
        </TouchableOpacity>
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
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['3xl'],
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  header: {
    marginBottom: spacing['3xl'],
  },
  successIcon: {
    fontSize: 48,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    lineHeight: 22,
  },
  form: {
    marginBottom: spacing.xl,
  },
  backLink: {
    alignSelf: 'center',
  },
  linkText: {
    color: colors.green[500],
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.sm,
  },
});
