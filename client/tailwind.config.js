/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        // Neutral surfaces, darkest at the page level so cards lift off it.
        ink: {
          950: "#0a0b0d",
          900: "#131519",
          800: "#1b1e24",
          700: "#252932",
          600: "#343a45",
        },
        // UI accent. Deliberately not green so it never reads as "money in".
        brand: {
          400: "#8b8cf9",
          500: "#6366f1",
          600: "#4f46e5",
        },
        // One colour per kind of money, used everywhere it appears.
        money: {
          in: "#34d399",
          out: "#f87171",
          family: "#c084fc",
          debt: "#fbbf24",
          tax: "#38bdf8",
        },
      },
      fontFamily: {
        sans: ["Inter", "Lato", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.4), 0 12px 32px -20px rgba(0,0,0,0.8)",
      },
    },
  },
  plugins: [],
};
