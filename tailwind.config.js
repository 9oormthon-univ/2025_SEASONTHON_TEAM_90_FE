/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{tsx,ts}",
    "./features/**/*.{tsx,ts}",
    "./shared/**/*.{tsx,ts}",
  ],
  theme: {
    screens: { sm: "360", md: "480", lg: "768", xl: "1024" },
    extend: {
      colors: {
        primary: "#22C55E",
        warn: "#F59E0B",
        danger: "#EF4444",
        bg: "#F3F4F6",
      },
    },
  },
  plugins: [],
};
