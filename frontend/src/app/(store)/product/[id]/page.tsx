'use client';
import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import {
  Heart, Star, Truck, ShieldCheck, RefreshCw, ChevronRight,
  Ruler, Minus, Plus, Check, X,
} from 'lucide-react';
import { productsApi, recommendationsApi } from '@/services/api';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { useWishlistStore } from '@/store/wishlist.store';
import ProductCard from '@/components/ui/ProductCard';
import { clsx } from 'clsx';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem, isLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const wishHas = useWishlistStore(s => s.has(id));
  const wishToggle = useWishlistStore(s => s.toggle);

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getBySlug(id).catch(() => productsApi.getOne(id)),
  });

  useEffect(() => {
    if (!product) return;
    const p = product as any;
    const primary = p.images?.find((i: any) => i.isPrimary)?.url ?? p.images?.[0]?.url;
    if (primary) setMainImage(primary);
    const defaultVariant = p.variants?.find((v: any) => Number(v.stock) > 0);
    if (defaultVariant) {
      setSelectedColor(defaultVariant.color);
      setSelectedSize(defaultVariant.size);
    }
  }, [product]);

  const { data: similar } = useQuery({
    queryKey: ['recommendations', 'similar', id],
    queryFn: () => recommendationsApi.getSimilar(id).catch(() => []),
    enabled: !!id,
  });

  const variants = (product as any)?.variants;
  const uniqueColors = useMemo(() => {
    if (!variants) return [];
    const map = new Map<string, any>();
    for (const v of variants) if (!map.has(v.color)) map.set(v.color, v);
    return Array.from(map.values());
  }, [variants]);

  const sizesForColor = useMemo(() => {
    if (!variants || !selectedColor) return [];
    return variants
      .filter((v: any) => v.color === selectedColor)
      .sort((a: any, b: any) => Number(a.size) - Number(b.size));
  }, [variants, selectedColor]);

  const selectedVariant = useMemo(
    () => variants?.find((v: any) => v.color === selectedColor && v.size === selectedSize),
    [variants, selectedColor, selectedSize],
  );

  if (loadingProduct) return <ProductSkeleton />;
  if (!product) {
    return (
      <div className="text-center py-32">
        <p className="font-serif text-3xl text-ink mb-3">Producto no encontrado</p>
        <Link href="/catalog" className="btn-primary inline-block mt-6">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const p = product as any;
  const priceNum = Number(p.price);
  const salePriceNum = p.salePrice != null ? Number(p.salePrice) : null;
  const ratingNum = Number(p.rating ?? 0);
  const discountPercent = salePriceNum != null && salePriceNum < priceNum
    ? Math.round(((priceNum - salePriceNum) / priceNum) * 100) : 0;
  const basePrice = salePriceNum != null && salePriceNum < priceNum ? salePriceNum : priceNum;

  const currentPrice = selectedVariant?.priceAdjustment
    ? basePrice + Number(selectedVariant.priceAdjustment)
    : basePrice;

  const totalStock = p.variants?.reduce((s: number, v: any) => s + Number(v.stock ?? 0), 0) ?? 0;
  const isLowStock = selectedVariant && Number(selectedVariant.stock) > 0 && Number(selectedVariant.stock) <= 5;

  const handleAddToCart = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (!selectedVariant) { toast.error('Selecciona color y talla'); return; }
    if (Number(selectedVariant.stock) <= 0) { toast.error('Variante agotada'); return; }
    try {
      await addItem(p.id, selectedVariant.id, quantity);
      toast.success(`${p.name} añadido al carrito`);
    } catch {
      toast.error('No pudimos añadirlo, intenta de nuevo');
    }
  };

  return (
    <>
      <div className="bg-white">
        {/* Breadcrumb */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center gap-1.5 text-[11px] text-gray-500 uppercase tracking-[0.12em]">
          <Link href="/" className="hover:text-cuero">Inicio</Link>
          <ChevronRight size={11} />
          <Link href="/catalog" className="hover:text-cuero">Catálogo</Link>
          <ChevronRight size={11} />
          {p.category && (
            <>
              <Link href={`/catalog?categoryId=${p.category.id}`} className="hover:text-cuero">
                {p.category.name}
              </Link>
              <ChevronRight size={11} />
            </>
          )}
          <span className="text-ink truncate max-w-[200px]">{p.name}</span>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-10 lg:gap-20">
          {/* ─── GALERÍA ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-[80px_1fr] gap-4">
            {/* Thumbs verticales */}
            <div className="hidden sm:flex flex-col gap-2">
              {p.images?.map((img: any) => (
                <button
                  key={img.id}
                  onClick={() => setMainImage(img.url)}
                  className={clsx(
                    'relative w-20 h-20 overflow-hidden bg-bone transition-all',
                    mainImage === img.url
                      ? 'ring-1 ring-ink ring-offset-1'
                      : 'opacity-60 hover:opacity-100',
                  )}
                >
                  <Image src={img.url} alt={img.altText || ''} fill sizes="80px" className="object-contain p-2" />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="relative aspect-square bg-bone overflow-hidden">
              <Image
                src={mainImage || 'https://via.placeholder.com/800x800?text=Sin+imagen'}
                alt={p.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-contain p-8 md:p-16"
              />
              {discountPercent > 0 && (
                <span className="absolute top-5 left-5 bg-wine text-white text-[10px] font-medium px-3 py-1.5 uppercase tracking-[0.18em]">
                  -{discountPercent}%
                </span>
              )}
              {totalStock === 0 && (
                <div className="absolute inset-0 bg-bone/60 backdrop-blur-sm flex items-center justify-center">
                  <span className="bg-ink text-white px-5 py-2.5 text-[10px] font-medium uppercase tracking-[0.22em]">
                    Agotado
                  </span>
                </div>
              )}
            </div>

            {/* Thumbs mobile */}
            <div className="flex sm:hidden gap-2 overflow-x-auto -mx-4 px-4 py-1 col-span-full">
              {p.images?.map((img: any) => (
                <button
                  key={img.id}
                  onClick={() => setMainImage(img.url)}
                  className={clsx(
                    'relative w-16 h-16 flex-shrink-0 overflow-hidden bg-bone transition-all',
                    mainImage === img.url ? 'ring-1 ring-ink' : 'opacity-60',
                  )}
                >
                  <Image src={img.url} alt="" fill sizes="64px" className="object-contain p-1.5" />
                </button>
              ))}
            </div>
          </div>

          {/* ─── INFO ─── */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <p className="label-eyebrow">{p.brand?.name}</p>
              <button
                onClick={() => { wishToggle(id); toast.success(wishHas ? 'Quitado de favoritos' : 'Guardado en favoritos'); }}
                className={clsx(
                  'p-2 transition-all',
                  wishHas ? 'bg-cuero text-white' : 'border border-stone hover:border-cuero',
                )}
                aria-label="Favorito"
              >
                <Heart size={16} strokeWidth={1.5} className={wishHas ? 'fill-white' : ''} />
              </button>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-ink leading-tight mb-4">
              {p.name}
            </h1>

            {ratingNum > 0 && (
              <div className="flex items-center gap-2 mb-5">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={13} className={s <= ratingNum ? 'fill-cuero text-cuero' : 'text-stone'} />
                  ))}
                </div>
                <span className="text-sm text-ink font-medium">{ratingNum.toFixed(1)}</span>
                <span className="text-xs text-gray-400">·  {p.reviewCount} reseñas</span>
              </div>
            )}

            {/* Precio */}
            <div className="flex items-baseline gap-3 mb-7 pb-7 border-b border-stone">
              <span className={clsx('font-serif text-3xl', salePriceNum && salePriceNum < priceNum ? 'text-wine' : 'text-ink')}>
                ${currentPrice.toLocaleString('es-CO')}
              </span>
              {salePriceNum != null && salePriceNum < priceNum && (
                <>
                  <span className="text-base text-gray-400 line-through font-light">
                    ${priceNum.toLocaleString('es-CO')}
                  </span>
                  <span className="bg-wine/10 text-wine text-[10px] font-medium uppercase tracking-[0.18em] px-2 py-1">
                    Ahorras ${Math.round(priceNum - salePriceNum).toLocaleString('es-CO')}
                  </span>
                </>
              )}
            </div>

            {/* Colores */}
            {uniqueColors.length > 0 && (
              <div className="mb-7">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-ink">
                    Color: <span className="text-gray-500">{selectedColor}</span>
                  </p>
                  <span className="text-[11px] text-gray-400 uppercase tracking-[0.12em]">{uniqueColors.length} disponibles</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {uniqueColors.map((v: any) => (
                    <button
                      key={v.color}
                      onClick={() => {
                        setSelectedColor(v.color);
                        const sameSize = p.variants?.find((x: any) => x.color === v.color && x.size === selectedSize);
                        if (!sameSize) setSelectedSize(null);
                      }}
                      title={v.color}
                      className={clsx(
                        'w-9 h-9 transition-all relative',
                        selectedColor === v.color
                          ? 'ring-1 ring-offset-2 ring-ink'
                          : 'ring-1 ring-stone hover:ring-cuero',
                      )}
                      style={{ background: v.colorHex || '#999' }}
                    >
                      {selectedColor === v.color && (
                        <Check
                          size={13}
                          strokeWidth={2}
                          className={clsx(
                            'absolute inset-0 m-auto',
                            v.colorHex && (v.colorHex.toLowerCase() === '#ffffff' || v.colorHex === '#F5F0E1' || v.colorHex === '#FBCFE8') ? 'text-ink' : 'text-white',
                          )}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tallas */}
            {sizesForColor.length > 0 && (
              <div className="mb-7">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-ink">
                    Talla: <span className="text-gray-500">{selectedSize ?? '—'}</span>
                  </p>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-[11px] uppercase tracking-[0.18em] text-cuero hover:text-cognac flex items-center gap-1.5 link-underline"
                  >
                    <Ruler size={12} strokeWidth={1.5} /> Guía de tallas
                  </button>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                  {sizesForColor.map((v: any) => {
                    const stock = Number(v.stock);
                    const inStock = stock > 0;
                    const active = selectedSize === v.size;
                    return (
                      <button
                        key={v.id}
                        onClick={() => inStock && setSelectedSize(v.size)}
                        disabled={!inStock}
                        className={clsx(
                          'h-12 border text-sm font-medium transition-all',
                          active
                            ? 'border-ink bg-ink text-white'
                            : inStock
                              ? 'border-stone hover:border-ink text-ink'
                              : 'border-stone/50 text-gray-300 cursor-not-allowed line-through',
                        )}
                      >
                        {v.size}
                      </button>
                    );
                  })}
                </div>
                {isLowStock && (
                  <p className="text-cognac text-[11px] uppercase tracking-[0.12em] mt-3 font-medium">
                    Solo quedan {selectedVariant?.stock} unidades
                  </p>
                )}
              </div>
            )}

            {/* Cantidad */}
            <div className="flex items-center gap-4 mb-6">
              <p className="text-[11px] uppercase tracking-[0.18em] text-ink">Cantidad</p>
              <div className="flex items-center border border-stone">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 hover:bg-bone flex items-center justify-center"
                >
                  <Minus size={13} strokeWidth={1.5} />
                </button>
                <span className="w-10 text-center font-medium text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(Number(selectedVariant?.stock ?? 99), q + 1))}
                  className="w-10 h-10 hover:bg-bone flex items-center justify-center"
                >
                  <Plus size={13} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* CTA — desktop */}
            <div className="hidden sm:block mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || Number(selectedVariant?.stock) <= 0 || isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? 'Agregando...' : 'Añadir al carrito'}
              </button>
            </div>

            {/* Beneficios */}
            <div className="space-y-4 p-6 bg-bone border border-stone mb-8">
              <Benefit icon={Truck}      title="Envío gratis"   desc="En compras desde $200.000" />
              <Benefit icon={RefreshCw}  title="Cambios fáciles" desc="15 días sin costo extra" />
              <Benefit icon={ShieldCheck} title="100% original"  desc="Garantía oficial de marca" />
            </div>

            {/* Descripción */}
            {p.description && (
              <div className="border-t border-stone pt-7">
                <h3 className="label-eyebrow mb-3">Descripción</h3>
                <p className="text-gray-600 leading-relaxed text-sm font-light">{p.description}</p>
              </div>
            )}

            {/* Specs */}
            <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
              <Spec label="Marca"      value={p.brand?.name} />
              <Spec label="Categoría"  value={p.category?.name} />
              <Spec label="Género"     value={
                { M: 'Hombre', F: 'Mujer', U: 'Unisex', K: 'Niños' }[p.gender as 'M']
              } />
              {p.material && <Spec label="Material" value={p.material} />}
              {p.season && <Spec label="Temporada" value={p.season} />}
              {selectedVariant && <Spec label="SKU" value={selectedVariant.sku} />}
            </div>
          </div>
        </div>

        {/* ─── PRODUCTOS RELACIONADOS ─── */}
        {similar && Array.isArray(similar) && similar.length > 0 && (
          <section className="border-t border-stone py-20 bg-bone">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <p className="label-eyebrow mb-3">También te puede gustar</p>
                <h2 className="font-serif text-3xl md:text-4xl">Productos similares</h2>
                <div className="w-12 h-px bg-cuero mx-auto mt-5" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
                {similar.slice(0, 4).map((r: any) => <ProductCard key={r.id} product={r} />)}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ─── STICKY CTA mobile ─── */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white border-t border-stone p-3 z-40 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.18em]">Total</p>
            <p className="font-serif text-lg text-ink">${(currentPrice * quantity).toLocaleString('es-CO')}</p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || Number(selectedVariant?.stock) <= 0 || isLoading}
            className="flex-1 bg-ink hover:bg-cuero text-white py-3.5 text-[11px] font-medium uppercase tracking-[0.22em] disabled:opacity-40 transition-colors"
          >
            Añadir al carrito
          </button>
        </div>
      </div>

      {showSizeGuide && <SizeGuideModal onClose={() => setShowSizeGuide(false)} />}
    </>
  );
}

// ─── Sub-componentes ────────────────────────────────────────────────────────

function Benefit({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 bg-white border border-stone flex items-center justify-center text-cuero flex-shrink-0">
        <Icon size={15} strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink font-medium">{title}</p>
        <p className="text-[11px] text-gray-500 mt-0.5 font-light">{desc}</p>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value?: string | number }) {
  if (!value) return null;
  return (
    <div className="border-b border-stone pb-2">
      <p className="text-[10px] uppercase tracking-[0.22em] text-gray-400">{label}</p>
      <p className="text-sm text-ink mt-1 truncate">{value}</p>
    </div>
  );
}

function SizeGuideModal({ onClose }: { onClose: () => void }) {
  const sizes = [
    { eu: '36', us: '4',   cm: '22.5' },
    { eu: '37', us: '5',   cm: '23.5' },
    { eu: '38', us: '6',   cm: '24.0' },
    { eu: '39', us: '6.5', cm: '24.5' },
    { eu: '40', us: '7',   cm: '25.0' },
    { eu: '41', us: '8',   cm: '26.0' },
    { eu: '42', us: '9',   cm: '26.5' },
    { eu: '43', us: '10',  cm: '27.5' },
    { eu: '44', us: '11',  cm: '28.5' },
    { eu: '45', us: '12',  cm: '29.5' },
  ];
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md p-7 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-stone">
          <div>
            <p className="label-eyebrow mb-1">Equivalencia</p>
            <h3 className="font-serif text-2xl">Guía de tallas</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 hover:text-cuero flex items-center justify-center">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-5 font-light">
          Mide la longitud de tu pie en centímetros y compara con la tabla.
        </p>
        <table className="w-full text-sm">
          <thead className="border-b border-ink">
            <tr>
              <th className="text-left py-2 label-eyebrow text-ink">EU</th>
              <th className="text-left py-2 label-eyebrow text-ink">US</th>
              <th className="text-left py-2 label-eyebrow text-ink">CM</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map(s => (
              <tr key={s.eu} className="border-b border-stone">
                <td className="py-3 font-medium text-ink">{s.eu}</td>
                <td className="py-3 text-gray-600">{s.us}</td>
                <td className="py-3 text-gray-600">{s.cm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-12 animate-pulse">
      <div className="aspect-square bg-stone" />
      <div className="space-y-4">
        <div className="h-3 w-24 bg-stone" />
        <div className="h-8 bg-stone" />
        <div className="h-8 w-2/3 bg-stone" />
        <div className="h-12 w-1/2 bg-stone mt-6" />
        <div className="h-32 bg-stone mt-8" />
      </div>
    </div>
  );
}
