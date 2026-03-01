/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#10B981", // Emerald 500
        "primary-dark": "#059669", // Emerald 600
        secondary: "#84CC16", // Lime 500
        "background-light": "#F8FAFC",
        "background-dark": "#0B1120",
        "surface-light": "#FFFFFF",
        "surface-dark": "#1E293B",
        "sidebar-bg": "#0f172a", // Slate 900
        "card-bg-light": "#ffffff",
        "card-bg-dark": "#1e293b",
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(16, 185, 129, 0.5)',
        'glow-secondary': '0 0 20px rgba(132, 204, 22, 0.4)',
      }
    },
  },
  plugins: [],
}

