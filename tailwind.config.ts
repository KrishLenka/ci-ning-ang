import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["'Instrument Serif'", "serif"],
        body: ["'Barlow'", "sans-serif"],
        hand: ["'Caveat'", "cursive"],
      },
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        accent: "hsl(var(--accent) / <alpha-value>)",
        ink: "#34194F",
        "ink-soft": "#563A73",
        plum: "#5B3590",
        "plum-dark": "#4A2878",
        lilac: "#8A5CC4",
        paper: "#FAF7FD",
        cream: "#FFF5D9",
      },
      borderRadius: {
        lg: "var(--radius)",
      },
    },
  },
  plugins: [],
} satisfies Config;
