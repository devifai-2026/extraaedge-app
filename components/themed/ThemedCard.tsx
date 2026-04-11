import React from 'react';
import { 
  View, 
  StyleSheet, 
  ViewStyle, 
  ViewProps 
} from 'react-native';
import { Theme } from '@/constants/theme';

interface ThemedCardProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ThemedCard({ children, style, ...props }: ThemedCardProps) {
  return (
    <View 
      style={[styles.card, Theme.shadows.sm, style]} 
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: '#F0F0F0', // Very subtle border to complement shadow
  },
});
