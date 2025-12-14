import React, { useEffect, useState } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  ScrollView,
  RefreshControl,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useBillStore } from '@/stores/billStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { APP_MARGINS } from '@/constants';
import { formatCurrency, getTimeUntilDue, isOverdue } from '@/utils/formatting';

export default function BillsScreen() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { bills, loading, fetchBills, markAsPaid } = useBillStore();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('unpaid');

  useEffect(() => {
    if (user?.id) {
      fetchBills(user.id);
    }
  }, [user?.id]);

  const handleRefresh = async () => {
    if (user?.id) {
      setRefreshing(true);
      await fetchBills(user.id);
      setRefreshing(false);
    }
  };

  const filteredBills = bills.filter((bill) => {
    if (filter === 'unpaid') return !bill.is_paid;
    if (filter === 'paid') return bill.is_paid;
    return true;
  });

  const handleMarkAsPaid = (billId: string) => {
    markAsPaid(billId);
  };

  if (loading && bills.length === 0) {
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
          <Text style={[styles.heroTitle, { color: '#FFFFFF' }]}>Bills</Text>
        </LinearGradient>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Bills</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.filterContainer}>
          {(['all', 'unpaid', 'paid'] as const).map((f) => (
            <Button
              key={f}
              title={f.charAt(0).toUpperCase() + f.slice(1)}
              onPress={() => setFilter(f)}
              variant={filter === f ? 'primary' : 'outline'}
              size="sm"
              style={styles.filterButton}
            />
          ))}
        </View>

        <View style={styles.content}>
          {filteredBills.length === 0 ? (
            <EmptyState
              title={`No ${filter} bills`}
              description={filter === 'all' ? 'Add a new bill to get started' : undefined}
              isDark={isDark}
            />
          ) : (
            <>
              {filteredBills.map((bill) => (
                <Card
                  key={bill.id}
                  isDark={isDark}
                  style={styles.billCard}
                >
                  <View style={styles.billHeader}>
                    <View style={styles.billInfo}>
                      <Text style={[styles.billName, { color: colors.text }]}>
                        {bill.name}
                      </Text>
                      <Text style={[styles.billDate, { color: colors.textSecondary }]}>
                        {!bill.is_paid ? getTimeUntilDue(bill.due_date) : `Paid on ${bill.paid_at}`}
                      </Text>
                    </View>
                    <View style={styles.billAmountContainer}>
                      <Text style={[styles.billAmount, { color: colors.primary }]}>
                        {formatCurrency(bill.amount, bill.currency)}
                      </Text>
                      <Text
                        style={[
                          styles.billStatus,
                          {
                            color: bill.is_paid
                              ? colors.success
                              : isOverdue(bill.due_date)
                              ? colors.error
                              : colors.warning,
                          },
                        ]}
                      >
                        {bill.is_paid ? 'Paid' : isOverdue(bill.due_date) ? 'Overdue' : 'Pending'}
                      </Text>
                    </View>
                  </View>

                  {!bill.is_paid && (
                    <Button
                      title="Mark as Paid"
                      onPress={() => handleMarkAsPaid(bill.id)}
                      variant="primary"
                      size="sm"
                      style={styles.actionButton}
                    />
                  )}
                </Card>
              ))}
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
    paddingTop: APP_MARGINS.xl,
    paddingBottom: APP_MARGINS.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: APP_MARGINS.lg,
    paddingBottom: APP_MARGINS.md,
    gap: APP_MARGINS.md,
  },
  filterButton: {
    flex: 1,
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
  billCard: {
    marginBottom: APP_MARGINS.md,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: APP_MARGINS.md,
  },
  billInfo: {
    flex: 1,
  },
  billName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: APP_MARGINS.xs,
  },
  billDate: {
    fontSize: 12,
  },
  billAmountContainer: {
    alignItems: 'flex-end',
  },
  billAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: APP_MARGINS.xs,
  },
  billStatus: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  actionButton: {
    marginTop: APP_MARGINS.md,
  },
});
