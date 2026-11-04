/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#09090B',
        surface: {
          1: '#111114',
          2: '#16161C',
          3: '#222228',
        },
        cardboard: {
          amber: '#F59E0B',
          emerald: '#10B981',
          purple: '#8B5CF6',
          blue: '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        serif: ['Newsreader', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
