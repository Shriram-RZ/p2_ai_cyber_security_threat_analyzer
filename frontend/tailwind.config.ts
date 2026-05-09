import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "Menlo", "monospace"],
        display: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#03060e",
          900: "#070b18",
          800: "#0b1224",
          700: "#101a35",
          600: "#162244",
        },
        cyber: {
          cyan: "#22d3ee",
          blue: "#3b82f6",
          violet: "#a78bfa",
          purple: "#7c3aed",
          green: "#34d399",
          amber: "#fbbf24",
          red: "#f87171",
          rose: "#fb7185",
        },
        severity: {
          low: "#34d399",
          medium: "#fbbf24",
          high: "#fb923c",
          critical: "#f43f5e",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(34,211,238,0.25), 0 0 30px rgba(34,211,238,0.15)",
        glowMd: "0 0 0 1px rgba(34,211,238,0.35), 0 0 50px rgba(34,211,238,0.20)",
        glowPurple: "0 0 0 1px rgba(167,139,250,0.30), 0 0 40px rgba(124,58,237,0.25)",
        glass: "inset 0 1px 0 0 rgba(255,255,255,0.06), 0 20px 40px -20px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(56,189,248,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.07) 1px, transparent 1px)",
        radial: "radial-gradient(ellipse at top, rgba(124,58,237,0.18), transparent 60%), radial-gradient(ellipse at bottom right, rgba(34,211,238,0.18), transparent 60%)",
        holo: "linear-gradient(120deg, #22d3ee, #7c3aed 45%, #f472b6 90%)",
        holoSoft: "linear-gradient(120deg, rgba(34,211,238,0.15), rgba(124,58,237,0.15) 50%, rgba(244,114,182,0.15))",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.8)", opacity: "0.7" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        gridShift: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "60px 60px" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        glow: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        scan: "scan 2.4s linear infinite",
        pulseRing: "pulseRing 1.6s ease-out infinite",
        float: "float 6s ease-in-out infinite",
        gradient: "gradient 8s ease infinite",
        gridShift: "gridShift 22s linear infinite",
        marquee: "marquee 30s linear infinite",
        glow: "glow 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
