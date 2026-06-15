import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f4f0e7',
        card: '#fbf9f2',
        ink: '#1b1a16',
        'ink-soft': '#615d52',
        line: '#ddd5c4',
        clay: '#c0492b',
        'clay-deep': '#97361f',
        sage: '#5f6b55',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        shell: '80rem',
      },
      letterSpacing: {
        tightest: '-0.04em',
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
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        rise: 'rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        fade: 'fade 0.9s ease both',
        drawerIn: 'drawerIn 0.42s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
}

export default config
