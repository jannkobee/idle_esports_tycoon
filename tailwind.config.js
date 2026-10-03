/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0a0d14',
          card: '#121824',
          cardHover: '#182030',
          border: '#232e42',
          neonBlue: '#00d2ff',
          neonGreen: '#00ff88',
          neonPurple: '#a855f7',
          neonGold: '#ffb703',
          neonRed: '#ff3366',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
