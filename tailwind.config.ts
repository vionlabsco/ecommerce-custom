import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Vionlabs — dark-first tech palette
        ink: '#0a0a0a',           // canvas
        surface: '#141414',       // cards / raised sections
        'surface-2': '#1c1c1c',   // hover / nested surface
        line: '#262626',          // dividers / borders on dark
        paper: '#f5f5f4',         // primary text on dark
        'paper-soft': '#a8a29e',  // secondary text
        'paper-mute': '#6b6864',  // tertiary / disabled
        accent: '#ff5c28',        // CTAs, highlights, hot orange
        'accent-hover': '#ff7a4d',
        'accent-deep': '#cc4720',
        lime: '#a3ff12',          // electric lime — sparing use
      },
      fontFamily: {
        // Two fonts only: Satoshi (display, bold) + Inter (body).
        // `mono` is kept as an alias to body so existing `font-mono` utility
        // classes still resolve cleanly — labels just render in Inter with
        // wide tracking instead of a true monospace face.
        display: ['Satoshi', 'var(--font-body)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        shell: '88rem',
      },
      letterSpacing: {
        tightest: '-0.04em',
        widest2: '0.32em',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        drawerIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        glow: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(255,92,40,0.5)' },
          '50%': { boxShadow: '0 0 0 8px rgba(255,92,40,0)' },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        rise: 'rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        fade: 'fade 0.9s ease both',
        drawerIn: 'drawerIn 0.42s cubic-bezier(0.16, 1, 0.3, 1) both',
        glow: 'glow 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
