/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8b5cf6',
          dark: '#7c3aed',
          light: '#a78bfa',
        },
        accent: {
          DEFAULT: '#c026d3',
          dark: '#a21caf',
          light: '#d946ef',
        },
        background: {
          DEFAULT: '#2e1065',
          dark: '#1e1b4b',
        },
      },
      animation: {
        'pulse': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'rotate': 'rotate 20s linear infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(124, 58, 237, 0.5)',
      },
    },
  },
  plugins: [],
};