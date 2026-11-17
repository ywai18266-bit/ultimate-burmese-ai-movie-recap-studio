import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { gold: { 400: "#e6b85c", 500: "#d4a03c", 600: "#b8862b" } },
      fontFamily: { sans: ["Padauk", "Noto Sans Myanmar", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
