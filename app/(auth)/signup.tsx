import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  SafeAreaView,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { APP_MARGINS, APP_RADII } from '@/constants';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { colors, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      await signUp(email, password, name);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#45b2e0ff", "#25D0C4"]} style={styles.hero}>
          <Text style={[styles.heroTitle, { color: '#FFFFFF' }]}>Create Your Account and Simplify Your Workday</Text>
        </LinearGradient>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Sign up</Text>
            <View style={styles.inlineRow}>
              <Text style={[styles.muted, { color: colors.textSecondary }]}>Already have an account? </Text>
              <Button title="Sign In" onPress={() => router.push('/(auth)/login')} variant="ghost" size="sm" />
            </View>
          </View>

          <TextInput
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            editable={!isLoading}
            error={errors.name}
            isDark={isDark}
          />

          <TextInput
            placeholder="Enter your email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!isLoading}
            error={errors.email}
            isDark={isDark}
            icon={<Mail size={18} color={colors.textSecondary} />}
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
            error={errors.password}
            isDark={isDark}
            icon={<Lock size={18} color={colors.textSecondary} />}
          />

          <TextInput
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!isLoading}
            error={errors.confirmPassword}
            isDark={isDark}
            icon={<Lock size={18} color={colors.textSecondary} />}
          />

          <View style={styles.optionsRow}>
            <View style={styles.rememberRow}>
              <Switch value={rememberMe} onValueChange={setRememberMe} trackColor={{ false: colors.border, true: colors.primary + '40' }} thumbColor={rememberMe ? colors.primary : colors.border} />
              <Text style={[styles.rememberLabel, { color: colors.text }]}>Remember Me</Text>
            </View>
            <Button title="Forgot Password?" onPress={() => router.push('/(auth)/forgot-password')} variant="ghost" size="sm" />
          </View>

          <Button title={isLoading ? 'Creating Account...' : 'Sign Up'} onPress={handleSignUp} disabled={isLoading} loading={isLoading} variant="primary" size="lg" style={styles.primaryButton} />

          <Text style={[styles.orText, { color: colors.textSecondary }]}>Or Continue With</Text>
          <View style={styles.socialRow}>
            <Button title="Apple" onPress={() => {}} variant="outline" size="md" style={styles.socialBtn} />
            <Button title="Google" onPress={() => {}} variant="outline" size="md" style={styles.socialBtn} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  hero: {
    height: 200,
    borderBottomLeftRadius: APP_RADII.xl,
    borderBottomRightRadius: APP_RADII.xl,
    paddingHorizontal: APP_MARGINS.lg,
    paddingTop: APP_MARGINS.xl,
    justifyContent: 'flex-end',
    paddingBottom: APP_MARGINS.lg,
  },
  heroTitle: { fontSize: 20, fontWeight: '700',marginBottom:APP_MARGINS.md },
  card: {
    marginHorizontal: APP_MARGINS.lg,
    marginTop: -40,
    borderRadius: APP_RADII.lg,
    borderWidth: 1,
    padding: APP_MARGINS.lg,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 32,
  },
  cardHeader: { marginBottom: APP_MARGINS.md },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: APP_MARGINS.xs },
  inlineRow: { flexDirection: 'row', alignItems: 'center' },
  muted: { fontSize: 12 },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: APP_MARGINS.md },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rememberLabel: { fontSize: 12 },
  primaryButton: { marginTop: APP_MARGINS.md },
  orText: { textAlign: 'center', fontSize: 12, marginVertical: APP_MARGINS.md },
  socialRow: { flexDirection: 'row', gap: APP_MARGINS.md },
  socialBtn: { flex: 1 },
});
