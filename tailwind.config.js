/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
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
        // Add VCA-specific colors with vca- prefix
        
        // VCA Action Colors
        'vca-action': {
          DEFAULT: '#0a66c2',
          hover: '#004182',
          active: '#004182',
        },
        'vca-action-transparent': {
          hover: '#378fe91a',
          active: '#378fe933',
        },
        
        // VCA Text Colors
        'vca-text': {
          DEFAULT: '#000000e5',
          meta: '#00000099',
          disabled: '#0000004d',
          negative: '#cb112d',
          positive: '#01754f',
          neutral: '#56687a',
          overlay: '#ffffff',
        },
        
        // VCA Background Colors
        'vca-background': {
          DEFAULT: '#ffffff',
          disabled: '#8c8c8c33',
          'neutral-soft': '#f4f2ee',
          'tint-soft': '#e8f3ff',
          knockout: '#ffffff',
          overlay: '#000000bf',
          'overlay-hover': '#000000e5',
          'overlay-active': '#000000e5',
          'transparent-hover': '#8c8c8c1a',
          'transparent-active': '#8c8c8c33',
        },
        
        // VCA Border Colors
        'vca-border': {
          DEFAULT: '#000000bf',
          subtle: '#0000004d',
          faint: '#8c8c8c33',
          active: '#000000e5',
          hover: '#000000e5',
        },
        
        // VCA Surface Colors
        'vca-surface': {
          tint: '#f6fbff',
          'tint-active': '#e8f3ff',
        },
        
        // VCA Link Colors
        'vca-link': {
          DEFAULT: '#0a66c2',
          hover: '#004182',
          active: '#004182',
          visited: '#8443ce',
          disabled: '#0000004d',
        },
        
        // VCA Icon Colors
        'vca-icon': {
          DEFAULT: '#000000bf',
          disabled: '#0000004d',
          hover: '#000000e5',
          active: '#000000e5',
          knockout: '#ffffff',
          'knockout-hover': '#ffffff',
          'knockout-active': '#ffffff99',
        },
        
        // VCA Label Colors
        'vca-label': {
          DEFAULT: '#000000bf',
          disabled: '#0000004d',
          hover: '#000000e5',
          active: '#000000e5',
          knockout: '#ffffff',
          'knockout-hover': '#ffffff',
          'knockout-active': '#ffffff99',
        },
        
        // VCA Status Colors
        'vca-negative': '#cb112d',
        'vca-positive': '#01754f',
        'vca-neutral': '#56687a',
        
        // VCA Other Colors
        'vca-premium': '#c37d16',
        'vca-accent': '#56687a',
        'vca-track': '#00000099',
        'vca-shadow': '#0000004d',
        'vca-shadow-supplemental': '#8c8c8c33',
        'vca-white': '#ffffff',
        'vca-spec-orange': '#ED4400',
      },
      spacing: {
        // VCA-specific spacing (namespaced)
        'vca-none': '0',
        'vca-xs': '4px',
        'vca-s': '8px',
        'vca-md': '12px',
        'vca-lg': '16px',
        'vca-xl': '20px',
        'vca-xxl': '24px',
      },
      borderRadius: {
        // VCA-specific radius (namespaced)
        'vca-none': '0',
        'vca-sm': '8px',
        'vca-md': '16px',
        'vca-lg': '24px',
        'vca-round': '360px',
      },
      fontFamily: {
        // App shell uses Geist
        sans: ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
        // VCA components use their own fonts
        'vca-text': ['"SF Pro Text"', 'system-ui', 'sans-serif'],
        'vca-display': ['"SF Pro Display"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // VCA text sizes
        'vca-xsmall': ['12px', { lineHeight: '15px', fontWeight: '400' }],
        'vca-xsmall-bold': ['12px', { lineHeight: '15px', fontWeight: '600' }],
        'vca-xsmall-open': ['12px', { lineHeight: '18px', fontWeight: '400' }],
        'vca-xsmall-bold-open': ['12px', { lineHeight: '18px', fontWeight: '600' }],
        'vca-small': ['14px', { lineHeight: '18px', fontWeight: '400' }],
        'vca-small-bold': ['14px', { lineHeight: '18px', fontWeight: '600' }],
        'vca-small-open': ['14px', { lineHeight: '21px', fontWeight: '400' }],
        'vca-small-bold-open': ['14px', { lineHeight: '21px', fontWeight: '600' }],
        'vca-large': ['20px', { lineHeight: '25px', fontWeight: '600' }],
        'vca-display-large': ['48px', { lineHeight: '60px', fontWeight: '600' }],
        
        // Custom app shell sizes
        '2xs': '13px',
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

