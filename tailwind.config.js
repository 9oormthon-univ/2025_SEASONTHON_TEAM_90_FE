/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{tsx,ts,js,jsx}",
    "./features/**/*.{tsx,ts}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./shared/**/*.{tsx,ts}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    screens: { sm: "360", md: "480", lg: "768", xl: "1024" },
    extend: {
      fontFamily: {
        choco: ["PowerChocolate"],
        nanum: ["NanumPen"],
      },
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