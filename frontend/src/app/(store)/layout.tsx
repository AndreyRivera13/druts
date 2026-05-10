import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-[108px] md:pt-[152px] pb-20 sm:pb-0">
        {children}
      </main>
      <Footer />
    </div>
  );
}
