import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: { colors: { ink: "#111111", paper: "#f8f8f5", fog: "#e7e7e3", acid: "#d8ff38" } },
  },
  plugins: [],
} satisfies Config;
