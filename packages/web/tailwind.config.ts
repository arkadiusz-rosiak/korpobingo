import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        corpo: {
          50: "#e8eaf6",
          100: "#c5cae9",
          200: "#9fa8da",
          300: "#7986cb",
          400: "#5c6bc0",
          500: "#3f51b5",
          600: "#3949ab",
          700: "#303f9f",
          800: "#283593",
          900: "#1a237e",
        },
      },
      animation: {
        stamp: "stamp 0.25s ease-out",
        unmark: "unmark 0.2s ease-in",
        "fade-in": "fadeIn 0.2s ease-out",
        "bingo-glow": "bingoGlow 1.5s ease-in-out infinite",
        "scale-in": "scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
      keyframes: {
        stamp: {
          "0%": { transform: "scale(0.92)" },
          "60%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
        unmark: {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0.8", transform: "scale(0.97)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bingoGlow: {
          "0%, 100%": { boxShadow: "0 0 4px 1px rgba(255, 215, 0, 0.3)" },
          "50%": { boxShadow: "0 0 12px 4px rgba(255, 215, 0, 0.6)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
