import React, { useEffect, useState } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { settingsService } from '@/services/settings';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { APP_MARGINS, CURRENCIES, REMINDER_OPTIONS } from '@/constants';
import { Moon, Sun } from 'lucide-react-native';
import type { AppSettings } from '@/types';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Use a mock user ID since we removed auth
      const mockUserId = 'local-user-123';
      const data = await settingsService.getSettings(mockUserId);
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Load settings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (!settings) return;
    try {
      const mockUserId = 'local-user-123';
      const updated = await settingsService.setNotificationsEnabled(mockUserId, value);
      if (updated) {
        setSettings(updated);
      }
    } catch (error) {
      console.error('Toggle notifications error:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
              console.error('Logout error:', error);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner isDark={isDark} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#00C2A8", "#25D0C4"]} style={styles.hero}>
          <Text style={[styles.heroTitle, { color: '#FFFFFF' }]}>Settings</Text>
        </LinearGradient>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.content}>
          <Card isDark={isDark}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Appearance
            </Text>
            <View style={styles.settingItem}>
              <View style={styles.themeOption}>
                <View style={styles.themeIcons}>
                  {isDark ? (
                    <Moon size={20} color={colors.primary} />
                  ) : (
                    <Sun size={20} color={colors.primary} />
                  )}
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Dark Mode
                  </Text>
                  <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                    {isDark ? 'On' : 'Off'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={isDark ? colors.primary : colors.border}
              />
            </View>
          </Card>

          <Card isDark={isDark}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Notifications
            </Text>
            <View style={styles.settingItem}>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Enable Notifications
                </Text>
                <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                  Get reminded about upcoming bills
                </Text>
              </View>
              {settings && (
                <Switch
                  value={settings.notifications_enabled}
                  onValueChange={handleToggleNotifications}
                  trackColor={{ false: colors.border, true: colors.primary + '40' }}
                  thumbColor={settings.notifications_enabled ? colors.primary : colors.border}
                />
              )}
            </View>
          </Card>

          <Card isDark={isDark}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              About
            </Text>
            <View style={styles.settingItem}>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  App Version
                </Text>
                <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                  1.0.0
                </Text>
              </View>
            </View>
          </Card>
          <Card isDark={isDark}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              sasfs
            </Text>
            <View style={styles.settingItem}>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  App Version
                </Text>
                <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                  1.0.0
                </Text>
              </View>
            </View>
          </Card>

          <View style={styles.logoutSection}>
            <Button
              title="Logout"
              onPress={handleLogout}
              variant="danger"
              size="lg"
            />
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              App Version 1.0.0
            </Text>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              © 2025 Bill Manager || Deep
            </Text>
          </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    height: 160,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: APP_MARGINS.lg,
    paddingTop: APP_MARGINS.xl,
    justifyContent: 'flex-end',
    paddingBottom: APP_MARGINS.lg,
  },
  heroTitle: { fontSize: 22, fontWeight: '700' },
  header: {
    paddingHorizontal: APP_MARGINS.lg,
    paddingTop: APP_MARGINS.xxl,
    paddingBottom: APP_MARGINS.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  card: {
    marginHorizontal: APP_MARGINS.lg,
    marginTop: -40,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: APP_MARGINS.lg,
    paddingBottom: APP_MARGINS.xl,
    paddingTop: APP_MARGINS.md,
  },
  content: {
    paddingBottom: APP_MARGINS.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: APP_MARGINS.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: APP_MARGINS.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: APP_MARGINS.xs,
  },
  settingValue: {
    fontSize: 12,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  themeIcons: {
    marginRight: APP_MARGINS.md,
  },
  button: {
    marginTop: APP_MARGINS.lg,
  },
  footer: {
    alignItems: 'center',
    marginTop: APP_MARGINS.xxl,
    paddingTop: APP_MARGINS.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footerText: {
    fontSize: 12,
    marginVertical: APP_MARGINS.xs,
  },
  logoutSection: {
    marginTop: APP_MARGINS.xl,
  },
});
