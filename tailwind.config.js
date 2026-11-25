/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg-canvas)',
        surface: {
          DEFAULT: 'var(--bg-card)',
          subtle: 'var(--bg-subtle)',
          hover: 'var(--bg-hover)',
        },
        ink: {
          DEFAULT: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        lavender: {
          DEFAULT: '#DECAFF',
          soft: '#EFE6FF',
          ink: '#3B0764',
        },
      },
      fontFamily: {
        sans: [
          '"Instrument Sans"',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          '"Instrument Sans"',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        'border': 'var(--shadow-border)',
        'border-hover': 'var(--shadow-border-hover)',
        'dialog': '0 0 0 1px rgba(24, 24, 27, 0.08), 0 12px 32px -4px rgba(24, 24, 27, 0.12)',
      },
    },
  },
  plugins: [],
};
