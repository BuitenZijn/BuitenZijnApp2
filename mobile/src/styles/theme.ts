/**
 * BuitenZijn App - Mobile Theme Configuration
 * Matches the web app's brand colors and styles.
 */

export const colors = {
  // PRIMARY
  green: {
    50: '#edf7ed', 100: '#d4edd3', 200: '#b0dfae', 300: '#8ad088',
    400: '#6bc468', 500: '#4EB54A', 600: '#45a342', 700: '#3a8f39',
    800: '#2f7a2f', 900: '#1f5c1f',
  },
  blue: {
    50: '#e8f1f9', 100: '#c5dbef', 200: '#9fc4e4', 300: '#78acd9',
    400: '#5a9ad0', 500: '#186DB7', 600: '#1562a5', 700: '#115490',
    800: '#0d467a', 900: '#083459',
  },

  // COMPLEMENTARY
  orange: {
    50: '#fdf3e8', 100: '#fadfc5', 200: '#f5c89e', 300: '#f0b076',
    400: '#eb9c54', 500: '#E07A1F', 600: '#c96e1c', 700: '#af5f18',
    800: '#945014', 900: '#6e3b0f',
  },
  rust: {
    50: '#f9e8ea', 100: '#efc5c9', 200: '#e49da4', 300: '#d8747e',
    400: '#cf5562', 500: '#B71D2E', 600: '#a51a29', 700: '#901624',
    800: '#7a131e', 900: '#5c0e17',
  },

  // ANALOGOUS
  teal: {
    50: '#e9f9f5', 100: '#c8f0e5', 200: '#a3e5d3', 300: '#7ddac1',
    400: '#60d1b2', 500: '#48C4A3', 600: '#40b093', 700: '#379a80',
    800: '#2e836d', 900: '#226352',
  },
  purple: {
    50: '#efedf9', 100: '#d6d1ef', 200: '#bab2e4', 300: '#9e93d9',
    400: '#887bd0', 500: '#6955C6', 600: '#5f4db2', 700: '#52429c',
    800: '#453885', 900: '#332a64',
  },

  // NEUTRALS
  beige: {
    50: '#fdfcfa', 100: '#FAF9F4', 200: '#F5F3E8', 300: '#ebe8d9',
    400: '#dfdbc8', 500: '#d2cdb7', 600: '#b8b39f', 700: '#9a9684',
    800: '#7a776a', 900: '#5a574f',
  },
  gray: {
    50: '#f7f7f7', 100: '#ededed', 200: '#dfdfdf', 300: '#cccccc',
    400: '#A8A8A8', 500: '#8f8f8f', 600: '#6e6e6e', 700: '#545454',
    800: '#3a3a3a', 900: '#212121',
  },

  // ACCENTS
  yellow: {
    50: '#fef9e6', 100: '#fcf0bf', 200: '#fae794', 300: '#f7dd69',
    400: '#f5d548', 500: '#F1C40F', 600: '#d9b00e', 700: '#be9a0c',
    800: '#a1830a', 900: '#776107',
  },
  navy: {
    50: '#e6edf2', 100: '#c1d2de', 200: '#97b4c8', 300: '#6d96b2',
    400: '#4d7fa1', 500: '#2d688f', 600: '#1e5777', 700: '#144663',
    800: '#0B3954', 900: '#072839',
  },

  // SEMANTIC
  success: '#4EB54A',
  warning: '#F1C40F',
  error: '#B71D2E',
  info: '#186DB7',

  // BACKGROUNDS
  white: '#FFFFFF',
  background: '#FAF9F4',
  card: '#FFFFFF',
  border: '#ebe8d9',
  text: '#212121',
  textSecondary: '#6e6e6e',
  textLight: '#A8A8A8',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;
