'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ArrowRight, Trash2 } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlist.store';
import { productsApi } from '@/services/api';
import ProductCard from '@/components/ui/ProductCard';

export default function WishlistPage() {
  const ids = useWishlistStore(s => s.ids);
  const clear = useWishlistStore(s => s.clear);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      if (ids.length === 0) {
        if (!cancelled) { setProducts([]); setLoading(false); }
        return;
      }
      const results = await Promise.allSettled(ids.map(id => productsApi.getOne(id)));
      if (!cancelled) {
        setProducts(results.filter(r => r.status === 'fulfilled').map((r: any) => r.value));
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [ids]);

  return (
    <div className="bg-white min-h-[60vh]">
      {/* Encabezado editorial */}
      <div className="bg-bone border-b border-stone">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
          <p className="label-eyebrow mb-3">Tu colección</p>
          <h1 className="font-serif text-4xl md:text-5xl text-ink flex items-center gap-3 justify-center">
            <Heart className="text-cuero fill-cuero" size={28} strokeWidth={1.5} /> Favoritos
          </h1>
          <p className="text-gray-500 mt-3 text-sm font-light">
            {ids.length} {ids.length === 1 ? 'producto guardado' : 'productos guardados'}
          </p>
          {ids.length > 0 && (
            <button
              onClick={() => { if (confirm('¿Vaciar tu lista de favoritos?')) clear(); }}
              className="text-[11px] uppercase tracking-[0.18em] text-cuero hover:text-cognac flex items-center gap-1.5 mx-auto mt-4 link-underline"
            >
              <Trash2 size={12} strokeWidth={1.5} /> Vaciar lista
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-stone" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 border border-stone bg-bone">
            <div className="w-16 h-16 mx-auto bg-white border border-stone flex items-center justify-center mb-5">
              <Heart size={24} strokeWidth={1.5} className="text-cuero" />
            </div>
            <p className="font-serif text-2xl text-ink mb-2">Tu lista está vacía</p>
            <p className="text-gray-500 mb-8 text-sm font-light max-w-md mx-auto">
              Guarda los productos que más te gusten haciendo clic en el corazón. Aquí los encontrarás siempre.
            </p>
            <Link href="/catalog" className="btn-primary inline-flex items-center gap-2 group">
              Explorar catálogo
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
            {products.map((p: any, i: number) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
