import React, { useState } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { Card } from '@/components/ui/Card';
import { format } from 'date-fns';
import { APP_MARGINS, CATEGORIES, BILLING_CYCLES, PAYMENT_METHODS } from '@/constants';

const NativeDateTimePicker = Platform.OS !== 'web'
  ? require('@react-native-community/datetimepicker').default
  : null;

export default function AddScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { addSubscription, loading } = useSubscriptionStore();
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    amount: '',
    billing_cycle: 'monthly',
    next_payment_date: '',
    payment_method: 'credit_card',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Subscription name is required';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (!formData.next_payment_date) {
      newErrors.next_payment_date = 'Payment date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user?.id) return;

    try {
      await addSubscription({
        user_id: user.id,
        name: formData.name,
        category_id: formData.category_id,
        amount: parseFloat(formData.amount),
        currency: user.currency,
        billing_cycle: formData.billing_cycle as any,
        next_payment_date: formData.next_payment_date,
        payment_method: formData.payment_method,
        auto_renewal: true,
        is_active: true,
      });

      Alert.alert('Success', 'Subscription added successfully');
      setFormData({
        name: '',
        category_id: '',
        amount: '',
        billing_cycle: 'monthly',
        next_payment_date: '',
        payment_method: 'credit_card',
      });
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add subscription');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#00C2A8", "#25D0C4"]} style={styles.hero}>
          {/* <Text style={[styles.heroTitle, { color: '#FFFFFF' }]}>Add Subscription</Text> */}
        </LinearGradient>
        

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.content}>
          <TextInput
            label="Subscription Name"
            placeholder="e.g., Netflix, Spotify"
            value={formData.name}
            onChangeText={(value) => setFormData({ ...formData, name: value })}
            error={errors.name}
            isDark={isDark}
          />

          <View>
            <Text style={[styles.label, { color: colors.text }]}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  title={cat.name}
                  onPress={() => setFormData({ ...formData, category_id: cat.id })}
                  variant={
                    formData.category_id === cat.id ? 'primary' : 'outline'
                  }
                  size="sm"
                  style={styles.categoryButton}
                />
              ))}
            </ScrollView>
            {errors.category_id && (
              <Text style={[styles.error, { color: colors.error }]}>
                {errors.category_id}
              </Text>
            )}
          </View>

          <TextInput
            label="Amount"
            placeholder="0.00"
            value={formData.amount}
            onChangeText={(value) =>
              setFormData({ ...formData, amount: value })
            }
            keyboardType="decimal-pad"
            error={errors.amount}
            isDark={isDark}
          />

          <View>
            <Text style={[styles.label, { color: colors.text }]}>
              Billing Cycle
            </Text>
            <View style={styles.cycleButtonsContainer}>
              {BILLING_CYCLES.map((cycle) => (
                <Button
                  key={cycle.value}
                  title={cycle.label}
                  onPress={() =>
                    setFormData({ ...formData, billing_cycle: cycle.value })
                  }
                  variant={
                    formData.billing_cycle === cycle.value
                      ? 'primary'
                      : 'outline'
                  }
                  size="sm"
                  style={styles.cycleButton}
                />
              ))}
            </View>
          </View>

          <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: APP_MARGINS.sm }}>
            <View style={{ flex: 1 }}>
              <TextInput
                label="Next Payment Date"
                placeholder="YYYY-MM-DD"
                value={formData.next_payment_date}
                onPressIn={() => setShowDatePicker(true)}
                editable={false}
                error={errors.next_payment_date}
                isDark={isDark}
              />
            </View>
            <View style={{ marginTop: 12,height: 40,width: 52, flexDirection: 'row', gap: APP_MARGINS.md }}>
              <Button
                title="🗓️"
                onPress={() => setShowCalendar((v) => !v)}
                variant="outline"
                size="sm"
              />
          </View>
            </View>

            {showCalendar && (
              <View style={{ marginTop: APP_MARGINS.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    title="Prev"
                    variant="ghost"
                    size="sm"
                    onPress={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                  />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                    {format(calendarMonth, 'MMMM yyyy')}
                  </Text>
                  <Button
                    title="Next"
                    variant="ghost"
                    size="sm"
                    onPress={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                  />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: APP_MARGINS.sm }}>
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
                    <Text key={d} style={{ flex: 1, textAlign: 'center', color: colors.textSecondary }}>{d}</Text>
                  ))}
                </View>
                {(() => {
                  const year = calendarMonth.getFullYear();
                  const month = calendarMonth.getMonth();
                  const firstDay = new Date(year, month, 1);
                  const startWeekday = firstDay.getDay();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const cells: (number | null)[] = [
                    ...Array(startWeekday).fill(null),
                    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
                  ];
                  while (cells.length % 7 !== 0) cells.push(null);
                  const rows: (number | null)[][] = [];
                  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
                  return (
                    <View style={{ marginTop: APP_MARGINS.xs }}>
                      {rows.map((row, idx) => (
                        <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: APP_MARGINS.xs }}>
                          {row.map((day, jdx) => (
                            day ? (
                              <Button
                                key={jdx}
                                title={String(day)}
                                size="sm"
                                variant="outline"
                                onPress={() => {
                                  const sel = new Date(year, month, day);
                                  const iso = format(sel, 'yyyy-MM-dd');
                                  setFormData({ ...formData, next_payment_date: iso });
                                  setSelectedDate(sel);
                                  setShowCalendar(false);
                                }}
                                style={{ flex: 1, marginHorizontal: 2 }}
                              />
                            ) : (
                              <View key={jdx} style={{ flex: 1, marginHorizontal: 2 }} />
                            )
                          ))}
                        </View>
                      ))}
                    </View>
                  );
                })()}
              </View>
            )}
          </View>

          {showDatePicker && NativeDateTimePicker && (
            <NativeDateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={(event: any, date?: Date) => {
                if (date) {
                  const iso = date.toISOString().substring(0, 10);
                  setFormData({ ...formData, next_payment_date: iso });
                  setSelectedDate(date);
                }
                if (Platform.OS !== 'ios') setShowDatePicker(false);
              }}
            />
          )}

          <View>
            <Text style={[styles.label, { color: colors.text }]}>
              Payment Method
            </Text>
            <View style={styles.methodScroll}>
              {PAYMENT_METHODS.map((method) => (
                <Button
                  key={method.value}
                  title={method.label}
                  onPress={() =>
                    setFormData({ ...formData, payment_method: method.value })
                  }
                  variant={
                    formData.payment_method === method.value
                      ? 'primary'
                      : 'outline'
                  }
                  size="sm"
                  style={styles.methodButton}
                />
              ))}
            </View>
          </View>

          <Button
            title={loading ? 'Adding...' : 'Add Subscription'}
            onPress={handleSubmit}
            disabled={loading}
            loading={loading}
            variant="primary"
            size="lg"
            style={styles.submitButton}
          />
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
    marginTop: 40,
    backgroundColor: 'transparent',
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: APP_MARGINS.sm,
  },
  error: {
    fontSize: 12,
    marginTop: APP_MARGINS.sm,
  },
  categoryScroll: {
    marginBottom: APP_MARGINS.lg,
  },
  categoryButton: {
    marginRight: APP_MARGINS.md,
  },
  cycleButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: APP_MARGINS.lg,
    gap: APP_MARGINS.md,
  },
  cycleButton: {
    flex: 1,
    minWidth: '48%',
  },
  methodScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: APP_MARGINS.lg,
    gap: APP_MARGINS.md,
  },
  methodButton: {
    flex: 1,
    minWidth: '48%',
  },
  submitButton: {
    marginTop: APP_MARGINS.lg,
  },
});
