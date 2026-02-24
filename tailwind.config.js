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
    'animate-spin',
    // Ensure all VCA radius classes are included even when dynamically generated
    'rounded-vca-none',
    'rounded-vca-xs',
    'rounded-vca-sm',
    'rounded-vca-md',
    'rounded-vca-lg',
    'rounded-vca-xl',
    'rounded-vca-xxl',
    'rounded-vca-round',
    // VCA color classes for Colors page display
    // vca-action colors
    'bg-vca-action',
    'bg-vca-action-hover',
    'bg-vca-action-active',
    'bg-vca-action-disabled',
    'bg-vca-action-background-action-transparent-hover',
    'bg-vca-action-background-action-transparent-active',
    // vca-text colors
    'bg-vca-text',
    'bg-vca-text-hover',
    'bg-vca-text-active',
    'bg-vca-text-meta',
    'bg-vca-text-meta-hover',
    'bg-vca-text-meta-active',
    'bg-vca-text-overlay',
    'bg-vca-text-overlay-hover',
    'bg-vca-text-overlay-active',
    'bg-vca-text-disabled',
    'bg-vca-text-negative',
    'bg-vca-text-negative-hover',
    'bg-vca-text-negative-active',
    'bg-vca-text-positive',
    'bg-vca-text-positive-hover',
    'bg-vca-text-positive-active',
    'bg-vca-text-neutral',
    'bg-vca-text-neutral-hover',
    'bg-vca-text-neutral-active',
    // vca-background colors
    'bg-vca-background',
    'bg-vca-background-neutral-soft',
    'bg-vca-background-neutral-strong',
    'bg-vca-background-offset',
    'bg-vca-background-mobile-background-offset',
    'bg-vca-background-knockout',
    'bg-vca-background-knockout-hover',
    'bg-vca-background-knockout-active',
    'bg-vca-background-disabled',
    'bg-vca-background-tint-soft',
    'bg-vca-background-positive-strong',
    'bg-vca-background-positive-soft',
    'bg-vca-background-negative-strong',
    'bg-vca-background-negative-soft',
    'bg-vca-background-transparent',
    'bg-vca-background-transparent-hover',
    'bg-vca-background-transparent-active',
    'bg-vca-background-overlay',
    'bg-vca-background-overlay-hover',
    'bg-vca-background-overlay-active',
    // vca-border colors
    'bg-vca-border',
    'bg-vca-border-hover',
    'bg-vca-border-active',
    'bg-vca-border-faint',
    'bg-vca-border-faint-hover',
    'bg-vca-border-faint-active',
    'bg-vca-border-subtle',
    'bg-vca-border-subtle-hover',
    'bg-vca-border-subtle-active',
    'bg-vca-border-disabled',
    'bg-vca-border-knockout',
    'bg-vca-border-knockout-hover',
    // vca-surface colors
    'bg-vca-surface-tint',
    'bg-vca-surface-tint-hover',
    'bg-vca-surface-tint-active',
    // vca-link colors
    'bg-vca-link',
    'bg-vca-link-hover',
    'bg-vca-link-active',
    'bg-vca-link-visited',
    'bg-vca-link-visited-hover',
    'bg-vca-link-visited-active',
    'bg-vca-link-disabled',
    // vca-icon colors
    'bg-vca-icon',
    'bg-vca-icon-hover',
    'bg-vca-icon-active',
    'bg-vca-icon-disabled',
    'bg-vca-icon-knockout',
    'bg-vca-icon-knockout-hover',
    'bg-vca-icon-knockout-active',
    // vca-label colors
    'bg-vca-label',
    'bg-vca-label-hover',
    'bg-vca-label-active',
    'bg-vca-label-disabled',
    'bg-vca-label-knockout',
    'bg-vca-label-knockout-hover',
    'bg-vca-label-knockout-active',
    // vca-positive colors
    'bg-vca-positive',
    'bg-vca-positive-hover',
    'bg-vca-positive-active',
    // vca-negative colors
    'bg-vca-negative',
    'bg-vca-negative-hover',
    'bg-vca-negative-active',
    // vca-neutral colors
    'bg-vca-neutral',
    'bg-vca-neutral-hover',
    'bg-vca-neutral-active',
    // vca-premium colors
    'bg-vca-premium-brand',
    'bg-vca-premium-text-brand',
    'bg-vca-premium-inbug',
    'bg-vca-premium-button-background',
    'bg-vca-premium-button-background-hover',
    'bg-vca-premium-button-background-active',
    // vca-brand colors
    'bg-vca-brand-logo-brand',
    'bg-vca-brand-logo-mono',
    // vca-accent colors
    'bg-vca-accent-4',
    'bg-vca-accent-4-hover',
    'bg-vca-accent-4-active',
    // Single value colors
    'bg-vca-shadow',
    'bg-vca-track',
    // vca-action-transparent colors
    'bg-vca-action-transparent-hover',
    'bg-vca-action-transparent-active',
    // vca-action-background-transparent colors
    'bg-vca-action-background-transparent-hover',
    'bg-vca-action-background-transparent-active',
    // vca-background-action-transparent colors
    'bg-vca-background-action-transparent-hover',
    'bg-vca-background-action-transparent-active',
    // Additional colors
    'bg-vca-shadow-supplemental',
    'bg-vca-white',
    'bg-vca-spec-orange',
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
        // Shell semantic tokens (app shell only)
        shell: {
          bg: 'rgb(var(--shell-bg) / <alpha-value>)',
          surface: 'rgb(var(--shell-surface) / <alpha-value>)',
          'surface-subtle': 'rgb(var(--shell-surface-subtle) / var(--shell-surface-subtle-alpha))',
          canvas: 'rgb(var(--shell-canvas) / <alpha-value>)',
          'canvas-grid': 'rgb(var(--shell-canvas-grid) / <alpha-value>)',
          text: 'rgb(var(--shell-text) / <alpha-value>)',
          muted: 'rgb(var(--shell-muted) / <alpha-value>)',
          'muted-strong': 'rgb(var(--shell-muted-strong) / <alpha-value>)',
          border: 'rgb(var(--shell-border) / <alpha-value>)',
          'border-subtle': 'rgb(var(--shell-border-subtle) / <alpha-value>)',
          accent: 'rgb(var(--shell-accent) / <alpha-value>)',
          'accent-hover': 'rgb(var(--shell-accent-hover) / <alpha-value>)',
          'accent-soft': 'rgb(var(--shell-accent-soft) / var(--shell-accent-soft-alpha))',
          'accent-border': 'rgb(var(--shell-accent-border) / <alpha-value>)',
          'accent-text': 'rgb(var(--shell-accent-text) / <alpha-value>)',
          danger: 'rgb(var(--shell-danger) / <alpha-value>)',
          'danger-hover': 'rgb(var(--shell-danger-hover) / <alpha-value>)',
          'danger-soft': 'rgb(var(--shell-danger-soft) / var(--shell-danger-soft-alpha))',
          'danger-border': 'rgb(var(--shell-danger-border) / <alpha-value>)',
          'node-user': 'rgb(var(--shell-node-user) / <alpha-value>)',
          'node-condition': 'rgb(var(--shell-node-condition) / <alpha-value>)',
          'node-note': 'rgb(var(--shell-node-note) / <alpha-value>)',
        },
        // Shell dark semantic tokens (cinematic surfaces)
        'shell-dark': {
          bg: 'rgb(var(--shell-dark-bg) / <alpha-value>)',
          panel: 'rgb(var(--shell-dark-panel) / <alpha-value>)',
          'panel-alt': 'rgb(var(--shell-dark-panel-alt) / <alpha-value>)',
          card: 'rgb(var(--shell-dark-card) / var(--shell-dark-card-alpha))',
          surface: 'rgb(var(--shell-dark-surface) / <alpha-value>)',
          text: 'rgb(var(--shell-dark-text) / <alpha-value>)',
          muted: 'rgb(var(--shell-dark-muted) / <alpha-value>)',
          border: 'rgb(var(--shell-dark-border) / var(--shell-dark-border-alpha))',
          'border-strong': 'rgb(var(--shell-dark-border-strong) / var(--shell-dark-border-strong-alpha))',
          accent: 'rgb(var(--shell-dark-accent) / <alpha-value>)',
          'accent-hover': 'rgb(var(--shell-dark-accent-hover) / <alpha-value>)',
          'accent-soft': 'rgb(var(--shell-dark-accent-soft) / var(--shell-dark-accent-soft-alpha))',
          danger: 'rgb(var(--shell-dark-danger) / <alpha-value>)',
          'danger-soft': 'rgb(var(--shell-dark-danger-soft) / var(--shell-dark-danger-soft-alpha))',
          success: 'rgb(var(--shell-dark-success) / <alpha-value>)',
          'success-soft': 'rgb(var(--shell-dark-success-soft) / var(--shell-dark-success-soft-alpha))',
          orb: 'rgb(var(--shell-dark-orb) / <alpha-value>)',
        },
        // Keep all Tailwind defaults (slate, gray, zinc, blue, etc.)
        // VCA-specific colors imported from auto-generated design tokens
        // To regenerate: npm run build:tokens
        ...vcaColors,
      },
      spacing: {
        // Shell semantic spacing tokens
        'shell-0': '0px',
        'shell-1': '4px',
        'shell-2': '8px',
        'shell-3': '12px',
        'shell-4': '16px',
        'shell-5': '20px',
        'shell-6': '24px',
        // VCA-specific spacing imported from auto-generated design tokens
        // To regenerate: npm run build:tokens
        ...vcaSpacing,
      },
      borderRadius: {
        // Shell semantic radius tokens
        'shell-sm': '6px',
        'shell-md': '8px',
        'shell-lg': '12px',
        'shell-xl': '16px',
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
        // Shell semantic shadows
        'shell-sm': '0 1px 2px rgba(0, 0, 0, 0.06)',
        'shell-lg': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        // VCA shadows
        'vca': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'vca-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      "accordion-down": "accordion-down 0.2s ease-out",
      "accordion-up": "accordion-up 0.2s ease-out",
      "thinking-dot": "thinking-dot 1.4s ease-in-out infinite",
      "pop-spin": "pop-spin 2s ease-in-out infinite",
      "progress-load": "progress-load 2s ease-in-out infinite",
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
      "thinking-dot": {
        "0%, 60%, 100%": { opacity: "0.4" },
        "30%": { opacity: "1" },
      },
      "pop-spin": {
        "0%, 80%, 100%": { transform: "scale(1) rotate(0deg)" },
        "20%": { transform: "scale(1.2) rotate(15deg)" },
        "40%": { transform: "scale(1) rotate(0deg)" },
        "50%": { transform: "scale(1) rotate(0deg)" },
        "60%": { transform: "scale(1.2) rotate(-15deg)" },
      },
      "progress-load": {
        "0%": { width: "0%", opacity: "1" },
        "50%": { width: "70%", opacity: "1" },
        "100%": { width: "100%", opacity: "0" },
      },
    },
    animation: {
      "accordion-down": "accordion-down 0.2s ease-out",
      "accordion-up": "accordion-up 0.2s ease-out",
      "thinking-dot": "thinking-dot 1.4s ease-in-out infinite",
      "pop-spin": "pop-spin 2s ease-in-out infinite",
      "progress-load": "progress-load 2s ease-in-out infinite",
      "spin-slow": "spin 8s linear infinite",
      "pulse-slow": "pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    },
  },
  plugins: [require("tailwindcss-animate")],
}
