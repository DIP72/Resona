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
          bg: '#070B19',
          card: '#0C1327',
          surface: '#111A38',
          border: 'rgba(0, 242, 254, 0.2)',
          cyan: '#00F2FE',
          green: '#00F59B',
          amber: '#FFB703',
          red: '#FF0055',
          orange: '#FF6B00',
          purple: '#8B5CF6',
          muted: '#8E9BAE',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Fira Code', 'Courier New', 'monospace'],
        display: ['"Rajdhani"', '"Orbitron"', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 242, 254, 0.4), 0 0 30px rgba(0, 242, 254, 0.2)',
        'neon-green': '0 0 15px rgba(0, 245, 155, 0.4), 0 0 30px rgba(0, 245, 155, 0.2)',
        'neon-red': '0 0 15px rgba(255, 0, 85, 0.5), 0 0 35px rgba(255, 0, 85, 0.3)',
        'neon-amber': '0 0 15px rgba(255, 183, 3, 0.4), 0 0 30px rgba(255, 183, 3, 0.2)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'line-flow': 'lineFlow 2s linear infinite',
        'beacon': 'beacon 1.5s cubic-bezier(0, 0.2, 0.8, 1) infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 8px rgba(0, 242, 254, 0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 18px rgba(0, 242, 254, 0.8))' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        lineFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        beacon: {
          '0%': { transform: 'scale(0.95)', opacity: '1' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
