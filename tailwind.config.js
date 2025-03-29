/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            color: 'var(--chapter-text)',
            a: {
              color: 'var(--accent)',
              '&:hover': {
                color: 'var(--accent-hover)',
              },
            },
            h1: {
              color: 'var(--chapter-text)',
            },
            h2: {
              color: 'var(--chapter-text)',
            },
            h3: {
              color: 'var(--chapter-text)',
            },
            h4: {
              color: 'var(--chapter-text)',
            },
            h5: {
              color: 'var(--chapter-text)',
            },
            h6: {
              color: 'var(--chapter-text)',
            },
            strong: {
              color: 'var(--chapter-text)',
            },
            code: {
              color: 'var(--chapter-text)',
            },
            pre: {
              backgroundColor: 'var(--code-bg)',
              color: 'var(--code-text)',
            },
            blockquote: {
              color: 'var(--chapter-text)',
              borderLeftColor: 'var(--border)',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 