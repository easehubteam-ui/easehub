/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#225944',
          'green-dark': '#184232',
          'green-soft': '#4F7A65',
          'green-light': '#E9F1ED',
          yellow: '#EECA3A',
          'yellow-hover': '#E0BD2C',
          'yellow-pale': '#FFF3C4',
          bg: '#F7F5EF',
          card: '#FFFFFF',
          charcoal: '#171A18',
          muted: '#6B6B63',
          border: '#E5E1D6',
          emerald: '#10B981',
        },
        ease: {
          yellow: 'var(--ease-yellow)',
          green: 'var(--ease-green)',
          ivory: 'var(--ease-ivory)',
          white: 'var(--ease-white)',
          text: 'var(--ease-text)',
          'muted-green': 'var(--ease-muted-green)',
          'light-yellow': 'var(--ease-light-yellow)',
          'muted-text': 'var(--ease-muted-text)',
          border: 'var(--ease-border)',
        },
      },
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  safelist: [
    'transition-all',
    'duration-300',
    'ease-expo-out',
  ],
  plugins: [],
};
