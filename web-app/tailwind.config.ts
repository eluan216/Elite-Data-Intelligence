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
        background: "#1A202C",   // Graphite
        foreground: "#F5F2EB",   // Ivory
        muted: "#a1a1aa",

        // 2026 Design Trends accents
        lime: {
          DEFAULT: "#c8ff00",
          foreground: "#1A202C",
        },
        purple: {
          DEFAULT: "#a855f7",
          bright: "#c084fc",
          deep: "#7e22ce",
        },
        accent: {
          DEFAULT: "#c8ff00",
          foreground: "#1A202C",
        },
        border: "#2d3748",
        card: "#161b26",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
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
