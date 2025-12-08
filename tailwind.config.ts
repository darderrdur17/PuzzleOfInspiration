import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Puzzle Design Colors - Global (from responsive UI components design)
        'puzzle-purple': '#9333EA', // Royal Purple
        'puzzle-orange': '#F97316', // Sunset Orange
        'puzzle-green': '#10B981', // Emerald Green
        'puzzle-gold': '#FCD34D', // Classic Gold
        'puzzle-bg': '#F5F5F7', // Light Grey (BG)
        'puzzle-text': '#1F2937', // Dark Grey (Text)

        // Observatory Hub
        'hub-space': '#1E3A8A',
        'hub-gold': '#FCD34D',
        'hub-cosmic': '#7C3AED',
        'hub-nebula': '#EC4899',

        // Alchemist's Workshop
        'alchemist-purple': '#6B21A8',
        'alchemist-green': '#059669',
        'alchemist-gold': '#D97706',
        'alchemist-blue': '#0EA5E9',

        // Gardener's Journey
        'gardener-brown': '#92400E',
        'gardener-green': '#16A34A',
        'gardener-pink': '#F472B6',
        'gardener-sky': '#38BDF8',

        // Explorer's Map
        'explorer-parchment': '#FEF3C7',
        'explorer-gold': '#CA8A04',
        'explorer-ocean': '#0284C7',
        'explorer-forest': '#15803D',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-in": {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(59, 130, 246, 0.7)" },
          "50%": { boxShadow: "0 0 20px 10px rgba(59, 130, 246, 0.4)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(147, 51, 234, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(147, 51, 234, 0.6)" },
        },
        "portal-enter": {
          from: { transform: "scale(0.8) rotate(180deg)", opacity: "0" },
          to: { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        "fade-in-up": {
          from: { transform: "translateY(30px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite",
        "portal-enter": "portal-enter 0.6s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out",
      },
    },
  },
  plugins: [],
}

export default config

