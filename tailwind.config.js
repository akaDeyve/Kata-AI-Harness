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
      },
      fontSize: {
        'xs': ['0.875rem', { lineHeight: '1.125rem' }],   // 14px
        'sm': ['0.9375rem', { lineHeight: '1.375rem' }],  // 15px
        'base': ['1rem', { lineHeight: '1.5rem' }],       // 16px
        'lg': ['1.125rem', { lineHeight: '1.625rem' }],   // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],     // 20px
      }
    },
  },
  plugins: [],
}
