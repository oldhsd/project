import type { Config } from 'tailwindcss';

const tailwindConfig: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        apple: {
          blue: '#e8590c',
          'blue-hover': '#d94f00',
          dark: '#000000',
          panel: '#0d0d11',
          card: '#141418',
          border: 'rgba(255, 255, 255, 0.09)',
          muted: '#86868b',
          subtle: '#6e6e73',
          lightBg: '#fbfbfd',
          lightPanel: '#ffffff',
          lightBorder: 'rgba(0, 0, 0, 0.08)'
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"SF Pro"',
          'system-ui',
          'Inter',
          'Segoe UI',
          'sans-serif'
        ]
      },
      letterSpacing: {
        tightest: '-0.025em',
        tighter: '-0.015em',
        tight: '-0.01em'
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px'
      }
    }
  },
  plugins: []
};

export default tailwindConfig;
