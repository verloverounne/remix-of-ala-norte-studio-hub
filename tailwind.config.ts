import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['"bebas-neue-pro-expanded"', 'system-ui', 'sans-serif'],
        heading: ['"bebas-neue-pro-expanded"', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
          light: "hsl(var(--primary-light))",
          lighter: "hsl(var(--primary-lighter))",
          dark: "hsl(var(--primary-dark))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          hover: "hsl(var(--secondary-hover))",
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
        gray: {
          dark: "hsl(var(--gray-dark))",
          medium: "hsl(var(--gray-medium))",
          light: "hsl(var(--gray-light))",
          lighter: "hsl(var(--gray-lighter))",
        },
      },
      borderRadius: {
        lg: "calc(var(--radius) + 4px)",
        md: "var(--radius)",
        sm: "calc(var(--radius) - 2px)",
      },
      boxShadow: {
        'cinema': 'var(--shadow-cinema)',
        'cinema-sm': 'var(--shadow-cinema-sm)',
        'cinema-lg': 'var(--shadow-cinema-lg)',
        'cinema-glow': 'var(--shadow-cinema-glow)',
        'cinema-red': 'var(--shadow-cinema-red)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(348 83% 47% / 0.3)" },
          "50%": { boxShadow: "0 0 40px hsl(348 83% 47% / 0.5)" },
        },
        "cinema-reveal": {
          "0%": { opacity: "0", transform: "translateY(20px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.3s ease-out",
        "accordion-up": "accordion-up 0.3s ease-out",
        "fade-in": "fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        "fade-in-up": "fade-in-up 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-in": "slide-in 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite",
        "cinema-reveal": "cinema-reveal 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
