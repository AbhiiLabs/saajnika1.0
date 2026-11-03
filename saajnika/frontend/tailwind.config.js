/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saaj: {
          bg: '#FAF8F5',
          surface: '#FFFFFF',
          cream: '#F5F1EB',
          sand: '#ECE7DF',
          border: '#E8E2D9',
          'border-light': '#F0EBE3',
          text: '#231F1D',
          muted: '#766F68',
          accent: '#966355',
          'accent-hover': '#7D4F43',
          'accent-light': '#F7EFEA',
          charcoal: '#1A1817',
          gold: '#C5A880',
          success: '#3D6B52',
          danger: '#A43E38',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'widest-xl': '0.25em',
        'tracked': '0.18em',
      },
      aspectRatio: {
        'portrait': '3/4',
        'fashion': '4/5',
        'editorial': '16/9',
      }
    },
  },
  plugins: [],
}
