import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Three clear palettes: light, dark, accessible
        // Each palette is intentionally minimal (one distinct tone per semantic role)
        light: {
          primary: "#3f6b4f", // forest green
          secondary: "#7aa179",
          background: "#ffffff",
          surface: "#f6f7f6",
          text: "#010703ff",
          textSecondary: "#115a30",
          muted: "#829182",
          accent: "#9fb8ad",
          success: "#1f8a3d",
          danger: "#c74641",
        },

        dark: {
          primary: "#2f4f36",
          secondary: "#3f6b4f",
          background: "#07120d",
          surface: "#0b1a12",
          text: "#e6efe8",
          textSecondary: "#c8d4ca",
          muted: "#7a8878",
          accent: "#6fa38f",
          success: "#2ea44f",
          danger: "#ff6b6b",
        },

        accessible: {
          primary: "#006400", // high-contrast dark green
          secondary: "#004d00",
          background: "#ffffff",
          surface: "#ffffff",
          text: "#000000",
          textSecondary: "#333333",
          muted: "#666666",
          accent: "#ffb703", // yellow accent for visibility
          success: "#007a3d",
          danger: "#b00020",
        },

        // Small neutral set and legacy aliases for compatibility
        neutral: {
          100: "#f6f7f6",
          200: "#e6e8e6",
          300: "#ced0ce",
          DEFAULT: "#9ea09e",
        },

        // Legacy aliases
        pa_white1: "#e6e8e6",
        pa_white2: "#ced0ce",
      },
      spacing: {
        // Espacements personnalisés si nécessaire
      },
    },
  },
  plugins: [],
};

export default config;
