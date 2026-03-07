import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { colors, borderRadius, fontSize, fontWeight, spacing } from '../../styles/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style as ViewStyle,
      ]}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.green[500] : colors.white}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            variantTextStyles[variant],
            sizeTextStyles[size],
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: fontWeight.semibold,
  },
});

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: colors.green[500],
  },
  secondary: {
    backgroundColor: colors.blue[500],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.green[500],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.rust[500],
  },
};

const variantTextStyles: Record<ButtonVariant, TextStyle> = {
  primary: { color: colors.white },
  secondary: { color: colors.white },
  outline: { color: colors.green[500] },
  ghost: { color: colors.green[500] },
  danger: { color: colors.white },
};

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  md: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
  lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing['2xl'] },
};

const sizeTextStyles: Record<ButtonSize, TextStyle> = {
  sm: { fontSize: fontSize.sm },
  md: { fontSize: fontSize.base },
  lg: { fontSize: fontSize.lg },
};
