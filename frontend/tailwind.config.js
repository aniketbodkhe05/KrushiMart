/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: '#f2f9f1',
          100: '#e0f1de',
          200: '#c3e3bf',
          300: '#96cd90',
          400: '#62ae5b',
          500: '#3f8f38',
          600: '#2f722a',
          700: '#275a24',
          800: '#234821',
          900: '#1e3c1d',
        },
        harvest: {
          50: '#fffaeb',
          100: '#fdf0c8',
          200: '#fbdf8c',
          300: '#f8c84f',
          400: '#f6b127',
          500: '#e08f0d',
          600: '#c26b08',
          700: '#9a4a0b',
          800: '#7f3a10',
          900: '#6c3112',
        },
        soil: {
          50: '#faf7f2',
          100: '#f2eadf',
          200: '#e4d4c1',
          300: '#d1b79b',
          400: '#ba9673',
          500: '#a97e59',
          600: '#94694a',
          700: '#78533e',
          800: '#654638',
          900: '#553c32',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 12px 40px -20px rgba(35, 72, 33, 0.35)',
      },
    },
  },
  plugins: [],
}
