/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.25rem',
        lg: '1.5rem',
        xl: '2rem',
      },
    },
    extend: {
      screens: {
        xs: '360px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      fontSize: {
        'fluid-xs': ['clamp(0.75rem, 0.7rem + 0.3vw, 0.875rem)', { lineHeight: '1.2' }],
        'fluid-sm': ['clamp(0.875rem, 0.8rem + 0.4vw, 1rem)', { lineHeight: '1.4' }],
        'fluid-base': ['clamp(1rem, 0.9rem + 0.6vw, 1.125rem)', { lineHeight: '1.6' }],
        'fluid-lg': ['clamp(1.125rem, 1rem + 0.8vw, 1.5rem)', { lineHeight: '1.4' }],
        'fluid-xl': ['clamp(1.5rem, 1.2rem + 1.4vw, 2.25rem)', { lineHeight: '1.2' }],
      },
      spacing: {
        'fluid-2': 'clamp(0.5rem, 0.4rem + 0.6vw, 0.75rem)',
        'fluid-4': 'clamp(1rem, 0.8rem + 0.8vw, 1.5rem)',
        'fluid-6': 'clamp(1.5rem, 1.1rem + 1vw, 2rem)',
        'fluid-8': 'clamp(2rem, 1.5rem + 1.5vw, 3rem)',
      },
      borderRadius: {
        'fluid-xl': 'clamp(1rem, 0.8rem + 0.8vw, 1.5rem)',
      },
    },
  },
  plugins: [],
}

