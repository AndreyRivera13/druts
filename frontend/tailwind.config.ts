import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta inspirada en Velez: cueros y champaña
        ink:    '#1A1A1A',  // negro carbón (texto principal)
        bone:   '#FAF7F2',  // crema cálido (fondos)
        stone:  '#EFEAE0',  // beige hueso (sections alternas)
        sand:   '#D9CFBE',  // arena (sutil)
        cuero:  '#7B5C3A',  // marrón cuero (acento)
        cognac: '#A06B3B',  // cognac (accent secundario)
        gold:   '#B8975A',  // champaña (CTAs sutiles)
        wine:   '#5A1F1F',  // burdeos (sale tags)

        primary: {
          50:  '#FAF7F2',
          100: '#EFEAE0',
          200: '#D9CFBE',
          300: '#A06B3B',
          400: '#7B5C3A',
          500: '#1A1A1A',
          600: '#1A1A1A',
          700: '#000000',
          800: '#000000',
          900: '#000000',
        },
      },
      fontFamily: {
        sans:    ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        serif:   ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        display: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
      },
      letterSpacing: {
        widest: '0.22em',
      },
    },
  },
  plugins: [],
};

export default config;
