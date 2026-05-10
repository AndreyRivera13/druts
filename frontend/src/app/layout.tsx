import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import QueryProvider from '@/components/providers/QueryProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'DRUTS — Cuero · Calzado hombre',
  description: 'Sneakers, chukkas y marroquinería de cuero hechos a mano en Colombia. ' +
    'Cuero full grain, construcción Goodyear-welt y diseño atemporal.',
  keywords: 'druts, calzado cuero, sneakers cuero, bota chukka, marroquinería, hombre, Colombia',
  openGraph: {
    title: 'DRUTS — Cuero · Calzado hombre',
    description: 'Sneakers y chukkas de cuero hechos a mano en Colombia.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans bg-white text-ink">
        <QueryProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '0px',
                fontFamily: 'var(--font-inter)',
                fontSize: '12px',
                letterSpacing: '0.05em',
                padding: '12px 16px',
                background: '#1A1A1A',
                color: '#fff',
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
