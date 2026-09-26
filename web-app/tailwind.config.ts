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
        background: "#000000",
        foreground: "#f5f5f0",
        muted: "#a1a1aa",
        // 2026 Design Trends palette
        lime: {
          DEFAULT: "#c8ff00",
          foreground: "#000000",
        },
        purple: {
          DEFAULT: "#a855f7",
          bright: "#c084fc",
          deep: "#7e22ce",
        },
        accent: {
          DEFAULT: "#c8ff00", // primary lime
          foreground: "#000000",
        },
        border: "#27272a",
        card: "#0a0a0a",
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
