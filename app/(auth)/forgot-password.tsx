import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '@/services/auth';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { APP_MARGINS } from '@/constants';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      await authService.resetPassword(email);
      setSubmitted(true);
      Alert.alert(
        'Email Sent',
        'Check your email for password reset instructions',
        [{ text: 'OK', onPress: () => router.push('/(auth)/login') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.successContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              Check Your Email
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              We've sent password reset instructions to {email}
            </Text>
            <Button
              title="Back to Login"
              onPress={() => router.push('/(auth)/login')}
              variant="primary"
              size="lg"
              style={styles.button}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Reset Password
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enter your email to receive reset instructions
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!isLoading}
            error={errors.email}
            isDark={isDark}
          />

          <Button
            title={isLoading ? 'Sending...' : 'Send Reset Email'}
            onPress={handleReset}
            disabled={isLoading}
            loading={isLoading}
            variant="primary"
            size="lg"
          />

          <Button
            title="Back to Login"
            onPress={() => router.push('/(auth)/login')}
            disabled={isLoading}
            variant="ghost"
            size="lg"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: APP_MARGINS.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: APP_MARGINS.xxl,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: APP_MARGINS.sm,
  },
  subtitle: {
    fontSize: 14,
  },
  form: {
    marginBottom: APP_MARGINS.xxl,
  },
  button: {
    marginTop: APP_MARGINS.lg,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
