const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Unified & Expanded Color Palette
        primary: {
          DEFAULT: '#0F766E', // Teal - Trust, calm, professional
          dark: '#0D5B54',
          light: '#14B8A6',
        },
        secondary: {
          DEFAULT: '#7C3AED', // Purple - Compassion, dignity
          dark: '#6D28D9',
          light: '#A78BFA',
        },
        accent: {
          DEFAULT: '#F59E0B', // Amber - Hope, warmth
          dark: '#D97706',
          light: '#FBBF24',
        },
        success: {
          DEFAULT: '#059669', // Green - Growth, healing
          dark: '#047857',
          light: '#10B981',
        },
        info: {
          DEFAULT: '#0891B2', // Cyan - Clarity, guidance
          dark: '#0E7490',
          light: '#22D3EE',
        },
        warm: {
          DEFAULT: '#EA580C', // Orange - Support, energy
          dark: '#C2410C',
          light: '#F97316',
        },
        // Neutral palette for backgrounds, borders, and text
        gray: colors.slate,
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-soft': 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(15, 118, 110, 0.1), 0 4px 6px -2px rgba(15, 118, 110, 0.05)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
