import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core brand palette from your swatch
        background: "#0d1410",   // Graphite
        foreground: "#f3f4e9",   // Ivory
        muted: "#a8b1a9",

        // 2026 Design Trends accents
        lime: {
          DEFAULT: "#d6fa60",
          foreground: "#0d1410",
        },
        purple: {
          DEFAULT: "#a855f7",
          bright: "#c084fc",
          deep: "#7e22ce",
        },
        accent: {
          DEFAULT: "#d6fa60",
          foreground: "#0d1410",
        },
        border: "#2c3930",
        card: "#141e17",
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
        display: ["Arial", "Helvetica", "sans-serif"],
      },
      fontSize: {
        "display-2xl": ["4.5rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-xl": ["3.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-lg": ["3rem", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
      },
    },
  },
  plugins: [],
};

export default config;
