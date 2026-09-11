/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        poke: {
          yellow: '#FFD000',
          gold: '#FFA200',
          blue: '#00E5FF',
          darkblue: '#0284C7',
          red: '#FF2A54',
          crimson: '#E11D48',
        },
        dark: {
          bg: '#070a13',
          surface: '#0d1322',
          card: '#131b2e',
          border: '#1f2b48',
          accent: '#00E5FF'
        },
        orient: {
          torii: '#FF2A54',
          sakura: '#FF4D6D',
          matcha: '#00F59B',
          yamabuki: '#FFD000',
          ai: '#00E5FF',
          sumi: '#070a13',
          washi: '#F8FAFC'
        },
        type: {
          grass: '#00F59B',
          fire: '#FF5400',
          water: '#00B4D8',
          lightning: '#FFD000',
          psychic: '#F72585',
          fighting: '#E63946',
          darkness: '#7209B7',
          metal: '#94A3B8',
          colorless: '#CBD5E1',
          dragon: '#7B2CBF',
          fairy: '#FF70A6'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        japanese: ['"Noto Sans JP"', '"Hiragino Kaku Gothic ProN"', 'sans-serif']
      },
      keyframes: {
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'forge-spin': {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.15)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        'forge-pulse': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(0.95)' },
          '50%': { opacity: '1', transform: 'scale(1.08)' },
        }
      },
      animation: {
        'shimmer': 'shimmer 2.5s infinite linear',
        'pulse-glow': 'pulse-glow 2s infinite ease-in-out',
        'float-slow': 'float-slow 4s ease-in-out infinite',
        'forge-spin': 'forge-spin 3s infinite linear',
        'forge-pulse': 'forge-pulse 1.5s infinite ease-in-out',
      }
    },
  },
  plugins: [],
}
