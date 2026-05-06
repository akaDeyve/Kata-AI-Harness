/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vscode': {
          'bg': '#1e1e1e',
          'sidebar': '#252526',
          'activity': '#333333',
          'editor': '#1e1e1e',
          'panel': '#1e1e1e',
          'border': '#3c3c3c',
          'text': '#cccccc',
          'text-secondary': '#858585',
          'accent': '#007acc',
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
        'sans': ['DM Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
