/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tell Tailwind which files to scan for class names so unused styles are purged in production
  content: [
    './src/**/*.{html,ts}',
  ],

  // "class" strategy: dark mode is enabled by adding the "dark" class to <html>
  // This is toggled programmatically in AppComponent and persisted to localStorage
  darkMode: 'class',

  theme: {
    extend: {},
  },
  plugins: [],
};

