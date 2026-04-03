import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "primary-dim": "rgb(var(--color-primary-dim) / <alpha-value>)",
        "primary-container":
          "rgb(var(--color-primary-container) / <alpha-value>)",
        "on-primary": "rgb(var(--color-on-primary) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        "secondary-container":
          "rgb(var(--color-secondary-container) / <alpha-value>)",
        "on-secondary-container":
          "rgb(var(--color-on-secondary-container) / <alpha-value>)",
        tertiary: "rgb(var(--color-tertiary) / <alpha-value>)",
        "tertiary-container":
          "rgb(var(--color-tertiary-container) / <alpha-value>)",
        "on-tertiary-container":
          "rgb(var(--color-on-tertiary-container) / <alpha-value>)",
        error: "rgb(var(--color-error) / <alpha-value>)",
        "error-container":
          "rgb(var(--color-error-container) / <alpha-value>)",
        "on-error-container":
          "rgb(var(--color-on-error-container) / <alpha-value>)",
        "on-surface": "rgb(var(--color-on-surface) / <alpha-value>)",
        "on-surface-variant":
          "rgb(var(--color-on-surface-variant) / <alpha-value>)",
        "surface-container-low":
          "rgb(var(--color-surface-container-low) / <alpha-value>)",
        "surface-container-high":
          "rgb(var(--color-surface-container-high) / <alpha-value>)",
        "surface-container-highest":
          "rgb(var(--color-surface-container-highest) / <alpha-value>)",
        "surface-container-lowest":
          "rgb(var(--color-surface-container-lowest) / <alpha-value>)",
        outline: "rgb(var(--color-outline) / <alpha-value>)",
        "outline-variant":
          "rgb(var(--color-outline-variant) / <alpha-value>)",
        brand: "rgb(var(--color-primary) / <alpha-value>)",
        "brand-deep": "rgb(var(--color-primary-dim) / <alpha-value>)",
        accent: "rgb(var(--color-primary-container) / <alpha-value>)",
        text: "rgb(var(--color-on-surface) / <alpha-value>)",
        "text-soft": "rgb(var(--color-on-surface-variant) / <alpha-value>)",
        success: "rgb(var(--color-secondary) / <alpha-value>)",
        warning: "rgb(var(--color-tertiary) / <alpha-value>)",
        danger: "rgb(var(--color-error) / <alpha-value>)",
        border: "rgb(var(--color-outline-variant) / <alpha-value>)"
      },
      boxShadow: {
        shell: "var(--shadow-shell)",
        editorial: "var(--shadow-editorial)",
        fab: "var(--shadow-fab)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      fontFamily: {
        sans: ["\"Be Vietnam Pro\"", "sans-serif"],
        body: ["\"Be Vietnam Pro\"", "sans-serif"],
        label: ["\"Be Vietnam Pro\"", "sans-serif"],
        headline: ["\"Plus Jakarta Sans\"", "sans-serif"],
        display: ["\"Plus Jakarta Sans\"", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
