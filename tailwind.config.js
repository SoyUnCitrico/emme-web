/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Matrix console palette — dark green base, shiny orange accents
        matrix: {
          black: '#050805',   // page background
          panel: '#0a140d',   // cards / panels
          panelLight: '#0f2015',
          line: '#143b22',    // borders / dividers
          dark: '#0d3b1e',
          dim: '#00b341',     // muted green
          green: '#00ff41',   // primary neon green
          text: '#7fffa8',    // body text
          glow: '#33ff77',
        },
        neon: {
          orange: '#ff8c1a',  // primary accent
          amber: '#ffae42',   // bright accent / glow
          ember: '#ff6a00',   // deep accent
        },
        // Back-compat aliases so any lingering references resolve to the theme
        primary: '#00ff41',
        secondary: '#0d3b1e',
        accent: '#ff8c1a',
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['"Share Tech Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'glow-green': '0 0 12px rgba(0, 255, 65, 0.45)',
        'glow-orange': '0 0 12px rgba(255, 140, 26, 0.55)',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        'vhs-roll': {
          '0%': { transform: 'translateY(-15vh)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      animation: {
        flicker: 'flicker 3s ease-in-out infinite',
        'vhs-roll': 'vhs-roll 7s linear infinite',
      },
    },
  },
  plugins: [],
}
