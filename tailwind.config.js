/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg': '#0a0b0d',
        's1': '#111318',
        's2': '#16181f',
        's3': '#1c1f28',
        'borderc': 'rgba(255,255,255,0.06)',
        'border2': 'rgba(255,255,255,0.09)',
        'accent': '#6c63ff',
        'accent-dim': '#6c63ff22',
        'green': '#3ecf8e',
        'green-dim': '#3ecf8e18',
        'yellow': '#f5c542',
        'red': '#f07070',
        'text': '#e2e4ed',
        't2': '#8b8fa8',
        't3': '#4e5168',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
        'sans': ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        'app': '8px',
      }
    },
  },
  plugins: [],
}
