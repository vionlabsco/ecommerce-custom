import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Vion Labs — brand palette per Vion-Labs-Brand-Package.
        //   Abyss Navy #0B1F3A  → `ink` (type + dark surfaces)
        //   Vion Blue  #2E5CFF  → `accent` (CTAs, active states)
        //   Bio Teal   #14C9B8  → `teal` (secondary accent, success indicators)
        //   Mist       #EDF2F9  → `surface` (light backgrounds)
        paper: '#ffffff',
        surface: '#edf2f9',            // Mist
        'surface-2': '#e2eaf3',
        line: '#d3ddec',
        ink: '#0b1f3a',                // Abyss Navy
        'ink-soft': '#42597a',
        'ink-mute': '#8ba3bf',
        'paper-soft': '#c8d4e2',
        'paper-mute': '#7c93ab',
        accent: '#2e5cff',             // Vion Blue
        'accent-hover': '#2249d6',
        'accent-deep': '#1e3aa8',
        'accent-soft': '#e0e8ff',
        card: '#f6f9fd',
        // Landing-page dark surfaces + highlight
        navy: '#0b1f3a',               // same as ink; kept for readability
        'navy-soft': '#132a52',
        ice: '#7cc4ff',
        teal: '#14c9b8',               // Bio Teal — success + secondary accent
        // Legacy aliases — keep existing markup working
        clay: '#2e5cff',
        lime: '#14c9b8',               // now Bio Teal (was green)
      },
      fontFamily: {
        display: ['var(--font-display)', 'var(--font-body)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        shell: '88rem',
      },
      letterSpacing: {
        // Softened from -0.04em / 0.32em — headlines now breathe a little and
        // uppercase labels no longer look like they've been stretched.
        tightest: '-0.02em',
        widest2: '0.22em',
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
