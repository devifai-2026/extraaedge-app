import { Platform } from 'react-native';

/**
 * Enterprise Theme System for ExtraaEdge CRM
 * Primary color change here will cascade across all themed components.
 */

const PRIMARY_RED = '#E53935';
const SECONDARY_BLACK = '#000000';
const WHITE = '#FFFFFF';
const GREY_LIGHT = '#F5F5F5';
const GREY_MEDIUM = '#BDBDBD';
const GREY_DARK = '#757575';

export const Theme = {
  colors: {
    primary: PRIMARY_RED,
    secondary: SECONDARY_BLACK,
    background: WHITE,
    surface: WHITE,
    text: {
      primary: '#11181C',
      secondary: GREY_DARK,
      inverse: WHITE,
      muted: GREY_MEDIUM,
    },
    input: {
      background: GREY_LIGHT,
      border: '#EEEEEE',
      text: SECONDARY_BLACK,
      placeholder: GREY_MEDIUM,
    },
    navigation: {
      active: PRIMARY_RED,
      inactive: GREY_MEDIUM,
      background: WHITE,
    },
    status: {
      success: '#4CAF50',
      error: '#F44336',
      warning: '#FFC107',
      info: '#2196F3',
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  shadows: Platform.select({
    ios: {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
    },
    android: {
      sm: { elevation: 2 },
      md: { elevation: 5 },
    },
    default: {},
  }),
};

// Maintaining backward compatibility if needed for existing components
export const Colors = {
  light: {
    text: Theme.colors.text.primary,
    background: Theme.colors.background,
    tint: Theme.colors.primary,
    icon: Theme.colors.text.secondary,
    tabIconDefault: Theme.colors.navigation.inactive,
    tabIconSelected: Theme.colors.navigation.active,
  },
  dark: {
    // Basic dark mode fallbacks
    text: '#ECEDEE',
    background: '#151718',
    tint: '#FFFFFF',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#FFFFFF',
  },
};
