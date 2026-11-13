/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0A1128',
          800: '#001F54',
          700: '#034078',
        },
        clinical: {
          teal: '#0D9488',
          cyan: '#06B6D4',
          emerald: '#10B981',
          blue: '#2563EB',
          slate: '#1E293B',
          light: '#F8FAFC'
        }
      }
    },
  },
  plugins: [],
}
