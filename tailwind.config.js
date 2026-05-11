/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#07111f',
        mist: '#d7e4f8',
        ember: '#ff7b39',
        glow: '#ffe3c4',
      },
      boxShadow: {
        panel: '0 22px 60px rgba(7, 17, 31, 0.24)',
      },
    },
  },
  plugins: [],
};
