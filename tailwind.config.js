/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      keyframes: {
        fadeInSlide: {
          "0%": {
            opacity: "0",
            transform: "translateX(100px) translateY(-10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0) translateY(0)",
          },
        },
      },
      animation: {
        "fade-in-slide": "fadeInSlide 0.4s ease-out",
      },
    },
  },
  plugins: [],
};