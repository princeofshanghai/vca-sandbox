/** @type {import('tailwindcss').Config} */
import { vcaColors, vcaSpacing, vcaRadius } from './src/design-tokens.js';

export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  safelist: [
    // Ensure all VCA radius classes are included even when dynamically generated
    'rounded-vca-none',
    'rounded-vca-xs',
    'rounded-vca-sm',
    'rounded-vca-md',
    'rounded-vca-lg',
    'rounded-vca-xl',
    'rounded-vca-xxl',
    'rounded-vca-round',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Keep all Tailwind defaults (slate, gray, zinc, blue, etc.)
        // VCA-specific colors imported from auto-generated design tokens
        // To regenerate: npm run build:tokens
        ...vcaColors,
      },
      spacing: {
        // VCA-specific spacing imported from auto-generated design tokens
        // To regenerate: npm run build:tokens
        ...vcaSpacing,
      },
      borderRadius: {
        // VCA-specific radius imported from auto-generated design tokens
        // To regenerate: npm run build:tokens
        ...vcaRadius,
      },
      fontFamily: {
        // App shell uses system font stack
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        // VCA components use their own fonts
        'vca-text': ['"SF Pro Text"', 'system-ui', 'sans-serif'],
        'vca-display': ['"SF Pro Display"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // VCA Body XSmall (12px)
        'vca-xsmall': ['12px', { lineHeight: '1.25', fontWeight: '400' }],
        'vca-xsmall-bold': ['12px', { lineHeight: '1.25', fontWeight: '600' }],
        'vca-xsmall-open': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
        'vca-xsmall-bold-open': ['12px', { lineHeight: '1.5', fontWeight: '600' }],
        
        // VCA Body Small (14px)
        'vca-small': ['14px', { lineHeight: '1.25', fontWeight: '400' }],
        'vca-small-bold': ['14px', { lineHeight: '1.25', fontWeight: '600' }],
        'vca-small-open': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'vca-small-bold-open': ['14px', { lineHeight: '1.5', fontWeight: '600' }],
        
        // VCA Body Medium (16px)
        'vca-medium': ['16px', { lineHeight: '1.25', fontWeight: '400' }],
        'vca-medium-bold': ['16px', { lineHeight: '1.25', fontWeight: '600' }],
        'vca-medium-open': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'vca-medium-bold-open': ['16px', { lineHeight: '1.5', fontWeight: '600' }],
        
        // VCA Body Large (20px)
        'vca-large': ['20px', { lineHeight: '1.25', fontWeight: '400' }],
        'vca-large-bold': ['20px', { lineHeight: '1.25', fontWeight: '600' }],
        'vca-large-open': ['20px', { lineHeight: '1.5', fontWeight: '400' }],
        'vca-large-bold-open': ['20px', { lineHeight: '1.5', fontWeight: '600' }],
        
        // VCA Heading Small (14px)
        'vca-heading-small': ['14px', { lineHeight: '1.25', fontWeight: '600' }],
        
        // VCA Heading Medium (16px)
        'vca-heading-medium': ['16px', { lineHeight: '1.25', fontWeight: '600' }],
        
        // VCA Heading Large (20px)
        'vca-heading-large': ['20px', { lineHeight: '1.25', fontWeight: '600' }],
        
        // VCA Heading XLarge (24px)
        'vca-heading-xlarge': ['24px', { lineHeight: '1.25', fontWeight: '600' }],
        
        // VCA Display Large (48px)
        'vca-display-large': ['48px', { lineHeight: '1.25', fontWeight: '400' }],
        'vca-display-large-bold': ['48px', { lineHeight: '1.25', fontWeight: '600' }],
        
        // VCA Display XLarge (64px)
        'vca-display-xlarge': ['64px', { lineHeight: '1.25', fontWeight: '400' }],
        'vca-display-xlarge-bold': ['64px', { lineHeight: '1.25', fontWeight: '600' }],
        
        // Custom app shell sizes
        '2xs': '13px',
        '15': ['15px', { lineHeight: '1.6' }], // Custom size for body text
      },
      boxShadow: {
        // VCA shadows
        'vca': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'vca-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

