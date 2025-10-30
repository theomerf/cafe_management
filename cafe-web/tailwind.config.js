/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        'hero-gradient': 'linear-gradient(94deg, rgba(73,159,163,1) 0%, rgba(12,168,240,1) 35%, rgba(0,212,255,1) 100%)',
      },
      fontFamily: {
        dm: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}

