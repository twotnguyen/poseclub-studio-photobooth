/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          950: '#070707',
          900: '#0F0F0F',
          850: '#151515',
          800: '#1C1C1C',
          700: '#2A2A2A',
          600: '#404040',
          500: '#6E6E6E',
          400: '#949494',
          300: '#C2C2C2',
          200: '#E5E5E5',
          100: '#F4F4F4',
          50: '#FAFAFA',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        editorial: ['"Cormorant Garamond"', 'Didot', 'serif'],
        script: ['"Alex Brush"', '"Pinyon Script"', 'cursive'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      letterSpacing: {
        widestx2: '0.25em',
        widestx3: '0.35em',
      },
    },
  },
  plugins: [],
}
