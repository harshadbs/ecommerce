import type { Config } from 'tailwindcss';

// Every colour resolves to a CSS custom property defined in src/styles/globals.css,
// so the theme (including the dark variant) can be swapped without touching components.
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;
const scale = (name: string) =>
  Object.fromEntries(
    [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((step) => [step, token(`${name}-${step}`)])
  );

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Semantic tokens
        canvas: token('bg-canvas'),
        surface: token('bg-surface'),
        ink: token('text-primary'),
        muted: token('text-secondary'),
        line: token('border-subtle'),
        brand: { DEFAULT: token('accent-brand'), fg: token('text-on-brand') },
        cta: { DEFAULT: token('accent-cta'), hover: token('accent-cta-hover'), fg: token('text-on-cta') },
        success: token('success'),
        warning: token('warning'),
        // Scales used by existing utility classes: primary = brand green, secondary = warm neutral
        primary: scale('brand'),
        secondary: scale('neutral'),
      },
      borderRadius: {
        md: '10px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        soft: '0 12px 32px -12px rgb(31 27 22 / 0.18)',
        lift: '0 6px 16px -6px rgb(31 27 22 / 0.28)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Fraunces', 'Georgia', 'serif'],
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        'slide-up': { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
      },
      animation: {
        'fade-up': 'fade-up 180ms ease-out both',
        'slide-in-left': 'slide-in-left 200ms ease-out both',
        'slide-up': 'slide-up 200ms ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
