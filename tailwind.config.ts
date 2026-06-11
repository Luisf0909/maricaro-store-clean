import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ─── PRIMARY: Rosa / Pastel Pink ───────────────────────
        warm: {
          50:  '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe4',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',  // main buttons & CTAs
          800: '#9d174d',
          900: '#831843',  // admin sidebar, dark elements
        },
        // ─── NEUTRAL: Lila claro / Lavender white ──────────────
        cream: {
          50:  '#fdf8ff',
          100: '#f5eeff',
          200: '#ead5fe',
          300: '#d9b4fd',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        // ─── SAGE (keep for subtle green) ─────────────────────
        sage: {
          100: '#f0f4ee',
          200: '#dde8d9',
          300: '#bfd3b8',
          400: '#96b58c',
          500: '#729664',
          600: '#5a7b4e',
        },
        // ─── BABY YELLOW ───────────────────────────────────────
        gold: {
          50:  '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        // ─── LILAC / Lavender accent ───────────────────────────
        petal: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',  // soft lilac
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        // ─── BLUSH / Rosa pastel suave (alias semántico) ──────
        blush: {
          50:  '#FFF5F7',
          100: '#FFE4EC',
          200: '#FFC5D8',
          300: '#FF9EC0',
          400: '#FF6FA8',
          500: '#F0508E',
          600: '#D63575',
        },
        // ─── SKY (azul bebé más suave) ────────────────────────
        sky: {
          50:  '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
        },
        // ─── VANILLA (crema verdadero) ────────────────────────
        vanilla: {
          50:  '#FFFDF5',
          100: '#FFFBEB',
          200: '#FEF3C7',
          300: '#FDE68A',
          400: '#FCD34D',
          500: '#FBBF24',
        },
        // ─── LAVENDER (lila pastel verdadero) ─────────────────
        lavender: {
          50:  '#FAF8FF',
          100: '#F3EFFF',
          200: '#E6DFFF',
          300: '#D4C5FE',
          400: '#B99EFD',
          500: '#9B7AF5',
        },
        // ─── BABY BLUE ─────────────────────────────────────────
        aqua: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',  // baby blue
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // ─── CSS-var-driven semantic tokens ────────────────────
        border:     'hsl(var(--border))',
        input:      'hsl(var(--input))',
        ring:       'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
      },
      fontFamily: {
        sans:      ['var(--font-inter)',      'system-ui', 'sans-serif'],
        serif:     ['var(--font-playfair)',   'Georgia',   'serif'],
        cormorant: ['var(--font-cormorant)', 'Georgia',   'serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'wave-bar': {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%':      { transform: 'scaleY(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'wave-1':         'wave-bar 1.2s ease-in-out infinite 0s',
        'wave-2':         'wave-bar 1.2s ease-in-out infinite 0.2s',
        'wave-3':         'wave-bar 1.2s ease-in-out infinite 0.4s',
        'wave-4':         'wave-bar 1.2s ease-in-out infinite 0.15s',
        'wave-5':         'wave-bar 1.2s ease-in-out infinite 0.35s',
        float:            'float 3s ease-in-out infinite',
        'fade-up':        'fade-up 0.6s ease-out forwards',
        shimmer:          'shimmer 3s linear infinite',
        'pulse-glow':     'pulse-glow 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
