import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors, borderRadius, spacing, shadows } from '../../styles/theme';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: keyof typeof spacing;
}

export function Card({
  variant = 'elevated',
  padding = 'lg',
  style,
  children,
  ...props
}: CardProps) {
  return (
    <View
      style={[
        styles.base,
        { padding: spacing[padding] },
        variant === 'elevated' && styles.elevated,
        variant === 'outlined' && styles.outlined,
        variant === 'flat' && styles.flat,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.xl,
    backgroundColor: colors.card,
  },
  elevated: {
    ...shadows.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  flat: {
    backgroundColor: colors.beige[100],
  },
});
