/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg': 'var(--bg)',
        's1': 'var(--s1)',
        's2': 'var(--s2)',
        's3': 'var(--s3)',
        'borderc': 'var(--border)',
        'border2': 'var(--border2)',
        'accent': 'var(--accent)',
        'accent-dim': 'var(--accent-dim)',
        'green': 'var(--green)',
        'green-dim': 'var(--green-dim)',
        'yellow': 'var(--yellow)',
        'yellow-dim': 'var(--yellow-dim)',
        'red': 'var(--red)',
        'red-dim': 'var(--red-dim)',
        'text': 'var(--text)',
        't2': 'var(--t2)',
        't3': 'var(--t3)',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
        'sans': ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        'app': '8px',
      },
      fontSize: {
        'xs': ['0.8125rem', { lineHeight: '1.125rem' }],  // 13px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],    // 14px
        'base': ['0.9375rem', { lineHeight: '1.375rem' }],// 15px
        'lg': ['1.0625rem', { lineHeight: '1.5rem' }],    // 17px
        'xl': ['1.1875rem', { lineHeight: '1.625rem' }],  // 19px
      }
    },
  },
  plugins: [],
}
