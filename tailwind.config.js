/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium Dark Theme Palette
        background: "#09090b", // Zinc 950
        surface: "#18181b", // Zinc 900
        surfaceHighlight: "#27272a", // Zinc 800
        primary: "#e4e4e7", // Zinc 200
        secondary: "#a1a1aa", // Zinc 400
        accent: "#3b82f6", // Blue 500 (subtle)
        success: "#22c55e", // Green 500
        danger: "#ef4444", // Red 500
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
