/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          bg: '#F5F8F8',
          surface: '#FFFFFF',
          border: '#DCE6E4',
        },
        ink: {
          900: '#132524',
          700: '#33504D',
          500: '#5C7A76',
        },
        brand: {
          50: '#EAF5F2',
          100: '#CFE9E2',
          300: '#7FBFB0',
          500: '#0F6E5E',
          600: '#0C5A4D',
          700: '#0B4F43',
          900: '#073430',
        },
        status: {
          safe: '#0F6E5E',
          warn: '#C98A1D',
          danger: '#C4453D',
          info: '#3568B5',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(19,37,36,0.06), 0 1px 12px rgba(19,37,36,0.04)',
      },
      borderRadius: {
        xl: '14px',
      },
    },
  },
  plugins: [],
};
