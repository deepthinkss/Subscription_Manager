import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  SafeAreaView,
  RefreshControl,
  Animated,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import Reanimated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring 
} from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { APP_MARGINS, APP_RADII } from '@/constants';
import { formatCurrency } from '@/utils/formatting';

// Swipeable row component
const SwipeableRow = ({ 
  subscription, 
  onDelete, 
  onEdit, 
  isDark, 
  colors,
  getCategoryColor,
  formatCurrency,
  user 
}: any) => {
  const swipeableRef = useRef<Swipeable>(null);

  const renderLeftActions = (progress: any, dragX: any) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.leftAction}>
        <Animated.View style={[styles.actionButton, styles.editButton, { transform: [{ scale }] }]}>
          <Text style={styles.actionText}>Edit</Text>
        </Animated.View>
      </View>
    );
  };

  const renderRightActions = (progress: any, dragX: any) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.rightAction}>
        <Animated.View style={[styles.actionButton, styles.deleteButton, { transform: [{ scale }] }]}>
          <Text style={styles.actionText}>Delete</Text>
        </Animated.View>
      </View>
    );
  };

  const handleSwipeableOpen = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      onEdit(subscription);
      swipeableRef.current?.close();
    } else if (direction === 'right') {
      onDelete(subscription);
      swipeableRef.current?.close();
    }
  };

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      leftThreshold={80}
      rightThreshold={80}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableOpen={handleSwipeableOpen}
    >
      <Card 
        isDark={isDark} 
        style={StyleSheet.flatten([styles.subscriptionCard, { backgroundColor: colors.surface }]) as any}
      >
        <View style={styles.subscriptionRow}>
          <View style={styles.subscriptionLeft}>
            <View 
              style={[
                styles.subscriptionIcon, 
                { backgroundColor: getCategoryColor(subscription.category) }
              ]}
            >
              <Text style={styles.subscriptionIconText}>
                {subscription.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.subscriptionInfo}>
              <Text style={[styles.subscriptionName, { color: colors.text }]}>
                {subscription.name}
              </Text>
              <Text style={[styles.subscriptionCategory, { color: colors.textSecondary }]}>
                {subscription.category || 'Uncategorized'} • Monthly
              </Text>
            </View>
          </View>
          <View style={styles.subscriptionRight}>
            <Text style={[styles.subscriptionAmount, { color: colors.text }]}>
              {formatCurrency(subscription.amount || 0, subscription.currency || user?.currency || 'INR')}
            </Text>
            <Text style={[styles.subscriptionCycle, { color: colors.textSecondary }]}>
              Next: 15 Dec
            </Text>
          </View>
        </View>
      </Card>
    </Swipeable>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { 
    subscriptions, 
    loading: subLoading, 
    fetchSubscriptions, 
    deleteSubscription 
  } = useSubscriptionStore();
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user?.id) {
      fetchSubscriptions(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleRefresh = async () => {
    if (user?.id) {
      setRefreshing(true);
      await fetchSubscriptions(user.id);
      setRefreshing(false);
    }
  };

  const handleDeleteSubscription = (subscription: any) => {
    Alert.alert(
      'Delete Subscription',
      `Are you sure you want to delete ${subscription.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSubscription(subscription.id);
              // Optional: Show success message
            } catch (error) {
              Alert.alert('Error', 'Failed to delete subscription');
            }
          },
        },
      ]
    );
  };

  const handleEditSubscription = (subscription: any) => {
    // Navigate to edit screen with subscription data
    router.push({
      pathname: '/(tabs)/add',
      params: { 
        edit: 'true',
        subscriptionId: subscription.id,
        // Pass other subscription data as needed
      }
    });
  };

  const totalMonthly = subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0);
  const activeSubscriptions = subscriptions.filter((sub: any) => {
    const status = sub.status;
    return status === 'active' || !status;
  });
  
  const parseNextDate = (sub: any): Date | null => {
    const raw = sub.nextBillingDate ?? sub.next_billing_date ?? sub.next_bill_date ?? sub.next_billing;
    if (!raw) return null;
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  };

  const upcomingRenewals = subscriptions
    .map((sub) => ({ sub, date: parseNextDate(sub) }))
    .filter((x) => x.date && x.date > new Date())
    .sort((a, b) => (a.date!.getTime() - b.date!.getTime()))
    .slice(0, 3)
    .map((x) => x.sub);

  const isLoading = subLoading;

  if (isLoading && subscriptions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner isDark={isDark} />
      </SafeAreaView>
    );
  }

  const getCategoryColor = (category?: string) => {
    const map = {
      entertainment: '#FF6B6B',
      productivity: '#4ECDC4',
      utilities: '#45B7D1',
      music: '#96CEB4',
      streaming: '#FFBE0B',
      software: '#FB5607',
      default: '#8338EC'
    } as Record<string, string>;
    const key = category ? category.toLowerCase() : 'default';
    return (map[key] as string) || map.default;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          {/* Header Section */}
          <LinearGradient 
            colors={isDark ? ["#0F172A", "#1E293B"] : ["#00C2A8", "#25D0C4"]} 
            style={styles.hero}
          >
            <View style={styles.heroContent}>
              <View style={styles.headerTop}>
                <View>
                  <Text style={[styles.greeting, { color: '#FFFFFF' }]}>Welcome back!</Text>
                  <Text style={[styles.subtitle, { color: '#00000099' }]}>
                    {activeSubscriptions.length} active subscriptions
                  </Text>
                </View>
              </View>
              
              <Animated.View style={[styles.totalCard, { opacity: fadeAnim }]}>
                <Text style={[styles.totalLabel, { color: isDark ? '#94A3B8' : '#FFFFFFCC' }]}>
                  Total monthly spend
                </Text>
                <Text style={[styles.totalAmount, { color: '#FFFFFF' }]}>
                  {formatCurrency(totalMonthly, user?.currency || 'INR')}
                </Text>
                <Text style={[styles.totalSubtext, { color: isDark ? '#94A3B8' : '#FFFFFFCC' }]}>
                  {subscriptions.length} services
                </Text>
              </Animated.View>
            </View>
          </LinearGradient>

          {/* Main Content */}
          <View style={styles.content}>
            {/* Quick Stats */}
            <View style={styles.statsRow}>
              <Card isDark={isDark} style={StyleSheet.flatten([styles.statCard, { backgroundColor: colors.surface }]) as any}>
                <Text style={[styles.statValue, { color: colors.text }]}>{activeSubscriptions.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active</Text>
              </Card>
              <Card isDark={isDark} style={StyleSheet.flatten([styles.statCard, { backgroundColor: colors.surface }]) as any}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {formatCurrency(totalMonthly, user?.currency || 'INR')}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Monthly</Text>
              </Card>
              <Card isDark={isDark} style={StyleSheet.flatten([styles.statCard, { backgroundColor: colors.surface }]) as any}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {formatCurrency(totalMonthly * 12, user?.currency || 'INR')}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Yearly</Text>
              </Card>
            </View>

            {/* Upcoming Renewals */}
            {upcomingRenewals.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming renewals</Text>
                  <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  {upcomingRenewals.map((subscription, index) => (
                    <Card key={subscription.id} isDark={isDark} style={StyleSheet.flatten([styles.renewalCard, { backgroundColor: colors.surface }]) as any}>
                      <View style={styles.renewalContent}>
                        <View style={[styles.serviceIcon, { backgroundColor: getCategoryColor(subscription.category) }]}>
                          <Text style={styles.serviceIconText}>
                            {subscription.name?.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <Text style={[styles.serviceName, { color: colors.text }]} numberOfLines={1}>
                          {subscription.name}
                        </Text>
                        <Text style={[styles.renewalDate, { color: colors.textSecondary }]}>
                          In 3 days
                        </Text>
                        <Text style={[styles.renewalAmount, { color: colors.text }]}>
                          {formatCurrency(subscription.amount || 0, subscription.currency || user?.currency || 'INR')}
                        </Text>
                      </View>
                    </Card>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* All Subscriptions */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Your subscriptions ({activeSubscriptions.length})
                </Text>
              </View>

              {activeSubscriptions.length === 0 ? (
                <>
                  <EmptyState
                    title="No subscriptions yet"
                    description="Add your first subscription to get started"
                    isDark={isDark}
                  />
                  <View style={{ marginTop: APP_MARGINS.md }}>
                    <Button title="Add Subscription" onPress={() => router.push('/(tabs)/add')} variant="primary" />
                  </View>
                </>
              ) : (
                <View style={styles.subscriptionsList}>
                  {activeSubscriptions.map((subscription) => (
                    <SwipeableRow
                      key={subscription.id}
                      subscription={subscription}
                      onDelete={handleDeleteSubscription}
                      onEdit={handleEditSubscription}
                      isDark={isDark}
                      colors={colors}
                      getCategoryColor={getCategoryColor}
                      formatCurrency={formatCurrency}
                      user={user}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* FAB */}
        <Button
          title="+"
          onPress={() => router.push('/(tabs)/add')}
          variant="primary"
          size="lg"
          style={StyleSheet.flatten([styles.fab, { backgroundColor: '#00C2A8' }]) as any}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    height: 292,
    borderBottomLeftRadius: APP_RADII.xl,
    borderBottomRightRadius: APP_RADII.xl,
    paddingHorizontal: APP_MARGINS.xl,
    paddingTop: APP_MARGINS.xl,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: APP_MARGINS.xl,
    marginBottom: APP_MARGINS.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: APP_MARGINS.xs,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalCard: {
    backgroundColor: '#055b7779',
    borderRadius: APP_RADII.xl,
    padding: APP_MARGINS.lg,
    marginTop: APP_MARGINS.xl,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: APP_MARGINS.xs,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: APP_MARGINS.xs,
  },
  totalSubtext: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: APP_MARGINS.lg,
    paddingTop: APP_MARGINS.lg,
    paddingBottom: APP_MARGINS.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: APP_MARGINS.xl,
  },
  statCard: {
    flex: 1,
    marginHorizontal: APP_MARGINS.xs,
    padding: APP_MARGINS.md,
    borderRadius: APP_RADII.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: APP_MARGINS.xs,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginBottom: APP_MARGINS.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: APP_MARGINS.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  horizontalScroll: {
    marginHorizontal: -APP_MARGINS.lg,
    paddingHorizontal: APP_MARGINS.lg,
  },
  renewalCard: {
    width: 140,
    marginRight: APP_MARGINS.md,
    padding: APP_MARGINS.md,
    borderRadius: APP_RADII.lg,
  },
  renewalContent: {
    alignItems: 'center',
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: APP_MARGINS.sm,
  },
  serviceIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: APP_MARGINS.xs,
  },
  renewalDate: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: APP_MARGINS.sm,
  },
  renewalAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  subscriptionsList: {
    gap: APP_MARGINS.md,
  },
  subscriptionCard: {
    padding: APP_MARGINS.md,
    borderRadius: APP_RADII.lg,
  },
  subscriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subscriptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subscriptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: APP_MARGINS.md,
  },
  subscriptionIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subscriptionCategory: {
    fontSize: 12,
    fontWeight: '500',
  },
  subscriptionRight: {
    alignItems: 'flex-end',
  },
  subscriptionAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  subscriptionCycle: {
    fontSize: 11,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  // Swipe actions styles
  leftAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginRight: APP_MARGINS.md,
  },
  rightAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: APP_MARGINS.md,
  },
  actionButton: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: APP_RADII.lg,
  },
  editButton: {
    backgroundColor: '#4ECDC4',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});