import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        spotify: "#1DB954",
        ytred: "#FF0000",
        tiktok: "#00F2EA",
        weverse: "#B8FF01",
        surface: "#111111",
        border: "#1e1e1e",
      },
    },
  },
  plugins: [],
};
export default config;
