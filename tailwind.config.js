/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
      },
      colors: {
        'primary': '#0D1B2A',
        'secondary': '#1B263B',
        'accent': '#415A77',
        'highlight': '#778DA9',
        'text-primary': '#E0E1DD',
        'cyan-flare': '#00F5D4',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
