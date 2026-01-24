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
          blue: '#2563EB',
          green: '#16A34A',
        },
        light: {
          blue: '#DBEAFE',
          green: '#DCFCE7',
        },
        gray: {
          text: '#6B7280',
          bg: '#F9FAFB',
        },
      },
    },
  },
  plugins: [],
}
