/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#242323",
        "bg-card": "#2e2d2d",
        "bg-card2": "#363535",
        green: {
          DEFAULT: "#25cc1d",
          dim: "#1a9913",
          glow: "rgba(37,204,29,0.15)",
          faint: "rgba(37,204,29,0.07)",
        },
        border: {
          DEFAULT: "rgba(37,204,29,0.2)",
          muted: "rgba(255,255,255,0.06)",
        },
        text: {
          DEFAULT: "#e8e8e0",
          muted: "#9a9890",
          dim: "#636159",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
    },
  },
  plugins: [],
}
