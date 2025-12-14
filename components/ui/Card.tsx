import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { THEME, APP_MARGINS, APP_RADII } from '@/constants';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  isDark?: boolean;
  onPress?: () => void;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  isDark = false,
  onPress,
  elevated = true,
}) => {
  const colors = isDark ? THEME.dark : THEME.light;

  const cardStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: APP_RADII.lg,
    padding: APP_MARGINS.lg,
    marginBottom: APP_MARGINS.md,
    ...(elevated && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    }),
    ...style,
  };

  if (onPress) {
    return (
      <View
        style={cardStyle}
        onTouchEnd={onPress}
      >
        {children}
      </View>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({});
