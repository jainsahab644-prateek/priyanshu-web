/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#7d2630',
          DEFAULT: '#580F17', // Deep Royal Maroon
          dark: '#3a080d',
        },
        gold: {
          light: '#f4df91',
          DEFAULT: '#D4AF37', // Heritage Gold
          dark: '#a8861c',
        },
        cream: {
          light: '#fdfbf9',
          DEFAULT: '#FAF6F0', // Warm Cream Background
          dark: '#f0e6d2',
        },
        charcoal: {
          light: '#4b5563',
          DEFAULT: '#1f2937', // Slate Dark Charcoal
          dark: '#111827',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
