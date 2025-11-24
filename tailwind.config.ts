import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors from Shopify theme
        primary: "#2C128F", // Main brand color (dark purple/blue)
        secondary: "#9C27B0", // Base purple
        accent: "#BA67ED", // Light purple background
        success: "#4CAF50", // Add to cart green
        danger: "#FF367A", // Sale price/alert pink
        warning: "#FB8C00", // Featured badge orange
        highlight: "#D6F37A", // Button hover lime

        // Backgrounds
        "bg-primary": "#FFFFFF",
        "bg-secondary": "#EAE7F4", // Input background (light purple)

        // Text colors
        "text-primary": "#2C128F",
        "text-secondary": "#FFFFFF",

        // Borders
        "border-primary": "#2C128F",

        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
        body: ['system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
