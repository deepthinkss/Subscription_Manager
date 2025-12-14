import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  SafeAreaView,
  Switch,
  ImageBackgroundComponent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { APP_MARGINS, APP_RADII } from '@/constants';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { colors, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#5a9bb6", "#bde2f1"]} style={styles.hero}>
          <Text style={[styles.heroTitle, { color: '#FFFFFF' }]}>Log in to stay on top of your tasks and projects.</Text>
        </LinearGradient>
        
        {/* Background gradient behind the card */}
        {/* <LinearGradient colors={["#bde2f1", "#5a9bb6"]} style={styles.hero1Background} /> */}

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Login</Text>
            <View style={styles.inlineRow}>
              <Text style={[styles.muted, { color: colors.textSecondary }]}>Don't have an account? </Text>
              <Button title="Sign Up" onPress={() => router.push('/(auth)/signup')} variant="ghost" size="sm" />
            </View>
          </View>

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

          <View style={styles.optionsRow}>
            <View style={styles.rememberRow}>
              <Switch value={rememberMe} onValueChange={setRememberMe} trackColor={{ false: colors.border, true: colors.primary + '40' }} thumbColor={rememberMe ? colors.primary : colors.border} />
              <Text style={[styles.rememberLabel, { color: colors.text }]}>Remember Me</Text>
            </View>
            <Button title="Forgot Password?" onPress={() => router.push('/(auth)/forgot-password')} variant="ghost" size="sm" />
          </View>

          <Button
            title={isLoading ? 'Signing In...' : 'Login'}
            onPress={handleLogin}
            disabled={isLoading}
            loading={isLoading}
            variant="primary"
            size="lg"
            style={{ ...styles.primaryButton, backgroundColor: '#5a9bb6',borderBlockColor:'#4a7486',borderRightColor:'#4a7486' }}
          />

          <Text style={[styles.orText, { color: colors.textSecondary }]}>Or Continue With</Text>
          <View style={styles.socialRow}>
            <Button title="Apple" onPress={() => {}} variant="outline" size="md" style={styles.socialBtn} />
            <Button title="Google" onPress={() => {}} variant="outline" size="md" style={styles.socialBtn} />
          </View>
        </View>
      
        <LinearGradient colors={["#bde2f1", "#5a9bb6"]} style={styles.hero1}>
          <Text style={[styles.heroTitle1, { color: '#FFFFFF', textAlign: 'center' }]}>@Deep</Text>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { 
    flex: 1, 
    paddingBottom: APP_MARGINS.xl 
  },
  hero: {
    height: 220,
    borderBottomLeftRadius: APP_RADII.xl,
    borderBottomRightRadius: APP_RADII.xl,
    paddingHorizontal: APP_MARGINS.lg,
    paddingTop: APP_MARGINS.xl,
    justifyContent: 'flex-end',
    paddingBottom: APP_MARGINS.lg,
  },
  // hero1Background: {
  //   position: 'absolute',
  //   top: 20, // Position it right below the top hero section
  //   left: 0,
  //   right: 0,
  //   bottom: 0,
  //   zIndex: -1,
  // },
  hero1: {
    marginTop: -APP_MARGINS.xl,
    marginBottom: APP_MARGINS.xl,
    height: "50%",
    borderTopLeftRadius: APP_RADII.xxl,
    borderTopRightRadius: APP_RADII.xxl,
    paddingHorizontal: APP_MARGINS.lg,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  heroTitle1: { 
    fontSize: 14, 
    fontWeight: '700' 
  },
  heroTitle: { 
    fontSize: 20, 
    fontWeight: '700' 
  },
  card: {
    marginHorizontal: APP_MARGINS.lg,
    marginTop: -20,
    borderRadius: APP_RADII.lg,
    borderWidth: 1,
    padding: APP_MARGINS.lg,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 1,
  },
  cardHeader: { 
    marginBottom: APP_MARGINS.md 
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    marginBottom: APP_MARGINS.xs 
  },
  inlineRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  muted: { 
    fontSize: 12 
  },
  optionsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: APP_MARGINS.md 
  },
  rememberRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  rememberLabel: { 
    fontSize: 12 
  },
  primaryButton: { 
    marginTop: APP_MARGINS.md,
    backgroundColor: '#00C2A8',
    borderColor: '#00A98F',
  },
  orText: { 
    textAlign: 'center', 
    fontSize: 12, 
    marginVertical: APP_MARGINS.md 
  },
  socialRow: { 
    flexDirection:'row-reverse', 
    gap: APP_MARGINS.md 
  },
  socialBtn: { 
    flex: 1, 
    backgroundColor: '#edfdffff',
    
  },
});