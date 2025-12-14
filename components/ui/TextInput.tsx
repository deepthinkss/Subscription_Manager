import React from 'react';
import {
  TextInput as RNTextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { THEME, APP_MARGINS, APP_RADII } from '@/constants';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  isDark?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const TextInput: React.FC<CustomTextInputProps> = ({
  label,
  error,
  isDark = false,
  containerStyle,
  inputStyle,
  icon,
  ...props
}) => {
  const colors = isDark ? THEME.dark : THEME.light;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error ? colors.error : colors.border,
            backgroundColor: colors.surface,
          },
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <RNTextInput
          style={[
            styles.input,
            {
              color: colors.text,
              paddingLeft: icon ? APP_MARGINS.md : APP_MARGINS.lg,
            },
            inputStyle,
          ]}
          placeholderTextColor={colors.textSecondary}
          {...props}
        />
      </View>
      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: APP_MARGINS.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: APP_MARGINS.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: APP_RADII.md,
    paddingHorizontal: APP_MARGINS.lg,
  },
  input: {
    flex: 1,
    paddingVertical: APP_MARGINS.md,
    fontSize: 14,
  },
  iconContainer: {
    marginRight: APP_MARGINS.sm,
  },
  errorText: {
    fontSize: 12,
    marginTop: APP_MARGINS.sm,
  },
});
