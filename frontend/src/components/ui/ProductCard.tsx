'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { useWishlistStore } from '@/store/wishlist.store';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Props {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: Props) {
  const { addItem, isLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const wishHas = useWishlistStore(s => s.has(product.id));
  const wishToggle = useWishlistStore(s => s.toggle);

  const mainImage = product.images?.find(i => i.isPrimary)?.url
    ?? product.images?.[0]?.url
    ?? 'https://via.placeholder.com/600x600?text=Sin+imagen';
  const hoverImage = product.images?.[1]?.url ?? mainImage;

  const totalStock = product.variants?.reduce((sum, v) => sum + Number(v.stock ?? 0), 0) ?? 0;
  const hasStock = totalStock > 0;
  const defaultVariant = product.variants?.find(v => Number(v.stock) > 0);

  const priceNum = Number(product.price);
  const salePriceNum = product.salePrice != null ? Number(product.salePrice) : null;
  const currentPrice = salePriceNum != null && salePriceNum < priceNum ? salePriceNum : priceNum;
  const discountPercent =
    salePriceNum != null && salePriceNum < priceNum
      ? Math.round(((priceNum - salePriceNum) / priceNum) * 100)
      : 0;

  const uniqueColors = product.variants
    ? Array.from(new Map(product.variants.map(v => [v.color, v])).values()).slice(0, 5)
    : [];

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (!defaultVariant) return;
    try {
      await addItem(product.id, defaultVariant.id, 1);
      toast.success(`${product.name} añadido al carrito`);
    } catch {
      toast.error('No pudimos añadirlo, intenta de nuevo');
    }
  };

  const handleToggleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    wishToggle(product.id);
    toast.success(wishHas ? 'Quitado de favoritos' : 'Guardado en favoritos');
  };

  return (
    <Link href={`/product/${product.slug ?? product.id}`} className="group block product-card">
      {/* ── Imagen ── */}
      <div className="relative aspect-[4/5] overflow-hidden bg-bone">
        <Image
          src={mainImage}
          alt={product.name}
          fill
          priority={priority}
          className="object-contain p-5 sm:p-7 transition-all duration-700 group-hover:opacity-0 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {hoverImage !== mainImage && (
          <Image
            src={hoverImage}
            alt={product.name}
            fill
            className="object-contain p-5 sm:p-7 opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {discountPercent > 0 && (
            <span className="bg-wine text-white text-[10px] font-medium px-2.5 py-1 uppercase tracking-[0.18em]">
              -{discountPercent}%
            </span>
          )}
          {product.isFeatured && discountPercent === 0 && (
            <span className="bg-cuero text-white text-[10px] font-medium px-2.5 py-1 uppercase tracking-[0.18em]">
              Top
            </span>
          )}
          {!hasStock && (
            <span className="bg-ink text-white text-[10px] font-medium px-2.5 py-1 uppercase tracking-[0.18em]">
              Agotado
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleToggleWish}
          className={clsx(
            'absolute top-3 right-3 w-9 h-9 transition-all flex items-center justify-center z-10',
            wishHas
              ? 'bg-cuero text-white opacity-100'
              : 'bg-white/95 text-ink opacity-0 group-hover:opacity-100 hover:bg-ink hover:text-white',
          )}
          aria-label={wishHas ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <Heart size={15} strokeWidth={1.5} className={wishHas ? 'fill-white' : ''} />
        </button>

        {/* Quick add (slide up) */}
        {hasStock && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10">
            <button
              onClick={handleAddToCart}
              disabled={isLoading}
              className="w-full bg-ink hover:bg-cuero text-white py-3.5 text-[10px] font-medium uppercase tracking-[0.22em] disabled:opacity-50 transition-colors"
            >
              Añadir al carrito
            </button>
          </div>
        )}

        {!hasStock && (
          <div className="absolute inset-0 bg-bone/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-ink text-white px-4 py-2 text-[10px] font-medium uppercase tracking-[0.22em]">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* ── Info ── */}
      <div className="pt-4 pb-2 text-center">
        <p className="text-[10px] text-gray-400 uppercase tracking-[0.22em] mb-1.5">
          {product.brand?.name}
        </p>
        <h3 className="font-serif text-base text-ink leading-snug line-clamp-1 mb-2">
          {product.name}
        </h3>

        {/* Swatches */}
        {uniqueColors.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mb-2.5">
            {uniqueColors.map(c => (
              <div
                key={c.color}
                title={c.color}
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: c.colorHex || '#999',
                  border: c.colorHex === '#FFFFFF' || c.colorHex?.toLowerCase() === '#fff'
                    ? '1px solid #D9CFBE' : 'none',
                }}
              />
            ))}
            {product.variants && uniqueColors.length < new Set(product.variants.map(v => v.color)).size && (
              <span className="text-[10px] text-gray-400">+{new Set(product.variants.map(v => v.color)).size - uniqueColors.length}</span>
            )}
          </div>
        )}

        {/* Precio */}
        <div className="flex items-baseline justify-center gap-2">
          <p className={clsx('text-sm tracking-wide', salePriceNum && salePriceNum < priceNum ? 'text-wine font-medium' : 'text-ink font-medium')}>
            ${currentPrice.toLocaleString('es-CO')}
          </p>
          {salePriceNum != null && salePriceNum < priceNum && (
            <p className="text-xs text-gray-400 line-through">
              ${priceNum.toLocaleString('es-CO')}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
