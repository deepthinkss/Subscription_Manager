import React, { useEffect, useState } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { analyticsService } from '@/services/analytics';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { APP_MARGINS } from '@/constants';
import type { AnalyticsSummary } from '@/types';
import { formatCurrency } from '@/utils/formatting';

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadAnalytics();
    }
  }, [user?.id]);

  const loadAnalytics = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await analyticsService.getAnalyticsSummary(user.id);
      setAnalytics(data);
    } catch (error) {
      console.error('Load analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  if (loading && !analytics) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner isDark={isDark} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <LinearGradient colors={["#00C2A8", "#25D0C4"]} style={styles.hero}>
          <Text style={[styles.heroTitle, { color: '#FFFFFF' }]}>Analytics</Text>
        </LinearGradient>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.content}>
          {analytics && (
            <>
              <Card isDark={isDark}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Total Monthly Expense
                </Text>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {formatCurrency(analytics.total_monthly_expense, user?.currency || 'INR')}
                </Text>
              </Card>

              <View style={styles.statsGrid}>
                <Card isDark={isDark} style={{ flex: 1 }}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Active Subscriptions
                  </Text>
                  <Text style={[styles.statNumber, { color: colors.primary }]}>
                    {analytics.active_subscriptions_count}
                  </Text>
                </Card>

                <Card isDark={isDark} style={{ flex: 1, marginLeft: APP_MARGINS.md }}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Upcoming Bills
                  </Text>
                  <Text style={[styles.statNumber, { color: colors.warning }]}>
                    {analytics.upcoming_bills_count}
                  </Text>
                </Card>

                <Card isDark={isDark} style={{ flex: 1, marginLeft: APP_MARGINS.md }}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Overdue
                  </Text>
                  <Text style={[styles.statNumber, { color: colors.error }]}>
                    {analytics.overdue_bills_count}
                  </Text>
                </Card>
              </View>

              <Card isDark={isDark}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Category Breakdown
                </Text>
                {analytics.category_breakdown.map((cat) => (
                  <View key={cat.category_id} style={styles.categoryItem}>
                    <Text style={[styles.categoryName, { color: colors.text }]}>
                      {cat.category_name}
                    </Text>
                    <View style={styles.categoryRight}>
                      <Text style={[styles.categoryPercentage, { color: colors.textSecondary }]}>
                        {cat.percentage.toFixed(1)}%
                      </Text>
                      <Text style={[styles.categoryAmount, { color: colors.primary }]}>
                        {formatCurrency(cat.total_amount, user?.currency || 'INR')}
                      </Text>
                    </View>
                  </View>
                ))}
              </Card>

              {analytics.top_subscriptions.length > 0 && (
                <Card isDark={isDark}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Top Subscriptions
                  </Text>
                  {analytics.top_subscriptions.map((sub) => (
                    <View key={sub.id} style={styles.topSubItem}>
                      <Text style={[styles.topSubName, { color: colors.text }]}>
                        {sub.name}
                      </Text>
                      <Text style={[styles.topSubAmount, { color: colors.primary }]}>
                        {formatCurrency(sub.amount, sub.currency)}
                      </Text>
                    </View>
                  ))}
                </Card>
              )}
            </>
          )}
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
    paddingTop: APP_MARGINS.lg,
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
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: APP_MARGINS.sm,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: APP_MARGINS.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: APP_MARGINS.md,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: APP_MARGINS.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryPercentage: {
    fontSize: 12,
    marginBottom: APP_MARGINS.xs,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  topSubItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: APP_MARGINS.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  topSubName: {
    fontSize: 14,
    fontWeight: '500',
  },
  topSubAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
});
