import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { THEME, APP_MARGINS } from '@/constants';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  isDark?: boolean;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  isDark = false,
  style,
}) => {
  const colors = isDark ? THEME.dark : THEME.light;

  return (
    <View style={[styles.container, style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {description && (
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {description}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: APP_MARGINS.lg,
  },
  iconContainer: {
    marginBottom: APP_MARGINS.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: APP_MARGINS.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 300,
  },
});
