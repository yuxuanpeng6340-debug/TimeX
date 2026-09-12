/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebeeff',
          500: '#6b7cff',
          600: '#5768f4',
          700: '#4454d9',
        },
      },
      boxShadow: {
        card: '0 12px 40px rgba(100, 116, 255, 0.12)',
      },
    },
  },
  plugins: [],
};
