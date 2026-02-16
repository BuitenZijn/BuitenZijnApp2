/**
 * BuitenZijn App - Typography Configuration
 * 
 * This file contains all typography settings including fonts, sizes, and weights.
 * Update these values to change the app's typography.
 */

export const typography = {
  // ==========================================
  // FONT FAMILIES
  // ==========================================
  fontFamily: {
    // Primary sans-serif for body text
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    
    // Headings - more distinctive
    heading: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
    
    // Monospace for code
    mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
  },

  // ==========================================
  // FONT SIZES
  // ==========================================
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],        // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],    // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],       // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],    // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],     // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
    '5xl': ['3rem', { lineHeight: '1.2' }],         // 48px
    '6xl': ['3.75rem', { lineHeight: '1.1' }],      // 60px
  },

  // ==========================================
  // FONT WEIGHTS
  // ==========================================
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // ==========================================
  // LINE HEIGHTS
  // ==========================================
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // ==========================================
  // LETTER SPACING
  // ==========================================
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// ==========================================
// GOOGLE FONTS IMPORT URL
// ==========================================
// Add this to your app/layout.tsx or globals.css:
// @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

export const googleFontsUrl = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap';
