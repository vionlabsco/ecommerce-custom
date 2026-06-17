import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Vionlabs — light, modern, with hot-orange accent.
        // `paper` is the page canvas (white). `ink` is type + inverted elements.
        // `*-soft` and `*-mute` are muted text colours, paired with their
        // background ("ink-soft" = dark grey for light bgs, "paper-soft" =
        // light grey for the rare dark CTAs/sections).
        paper: '#ffffff',
        surface: '#fafafa',
        'surface-2': '#f4f4f5',
        line: '#e5e7eb',
        ink: '#0a0a0a',
        'ink-soft': '#525252',
        'ink-mute': '#9ca3af',
        'paper-soft': '#d4d4d4',
        'paper-mute': '#737373',
        accent: '#ff5c28',
        'accent-hover': '#e84a1a',
        'accent-deep': '#cc4720',
        lime: '#65a30d',
      },
      fontFamily: {
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
      },
      animation: {
        rise: 'rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        fade: 'fade 0.9s ease both',
        drawerIn: 'drawerIn 0.42s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
}

export default config
