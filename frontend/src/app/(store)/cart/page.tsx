'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { couponsApi } from '@/services/api';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cart, fetchCart, updateItem, removeItem, isLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState<{ amount: number; code: string } | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      const res = await couponsApi.validate(couponCode, cart?.subtotal ?? 0);
      setDiscount({ amount: res.discountAmount, code: couponCode.toUpperCase() });
      toast.success(`¡Cupón aplicado! Descuento: $${res.discountAmount.toLocaleString('es-CO')}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cupón inválido');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const subtotal = cart?.subtotal ?? 0;
  const discountAmount = discount?.amount ?? 0;
  const shippingCost = subtotal >= 200000 ? 0 : 12000;
  const total = subtotal - discountAmount + shippingCost;

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-6xl mb-6">🔒</p>
        <h2 className="text-2xl font-bold mb-4">Inicia sesión para ver tu carrito</h2>
        <Link href="/auth/login" className="btn-primary inline-block">Iniciar sesión</Link>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-6xl mb-6">🛒</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-8">Explora nuestro catálogo y encuentra los zapatos perfectos</p>
        <Link href="/catalog" className="btn-primary inline-flex items-center gap-2">
          <ShoppingBag size={18} /> Ver Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        🛒 Mi Carrito ({cart.itemCount} {cart.itemCount === 1 ? 'producto' : 'productos'})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map(item => {
            const itemPrice = Number(item.product.currentPrice) + Number(item.variant.priceAdjustment || 0);
            const primaryImage = item.product.images?.find(i => i.isPrimary)?.url ?? item.product.images?.[0]?.url;
            return (
              <div key={item.id} className="card p-4 flex gap-4">
                <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                  <Image
                    src={primaryImage || 'https://via.placeholder.com/100'}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.product.slug || item.product.id}`}
                    className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-1">
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    {item.product.brand?.name} · Talla {item.variant.size} · {item.variant.color}
                  </p>
                  <p className="font-bold text-lg text-gray-900 mt-2">
                    ${itemPrice.toLocaleString('es-CO')}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => updateItem(item.id, item.quantity - 1)}
                      className="px-3 py-1.5 hover:bg-gray-50 font-semibold"
                    >-</button>
                    <span className="px-3 font-semibold min-w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateItem(item.id, item.quantity + 1)}
                      className="px-3 py-1.5 hover:bg-gray-50 font-semibold"
                    >+</button>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    ${(itemPrice * item.quantity).toLocaleString('es-CO')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-lg text-gray-900 mb-6">Resumen del pedido</h2>

            {/* Coupon */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Cupón de descuento</label>
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="PROMO10"
                  className="input flex-1 text-sm"
                />
                <button
                  onClick={applyCoupon}
                  disabled={applyingCoupon}
                  className="btn-secondary py-2 px-4 text-sm"
                >
                  <Tag size={16} />
                </button>
              </div>
              {discount && (
                <p className="text-green-600 text-sm mt-2 font-medium">
                  ✅ {discount.code} — Descuento aplicado
                </p>
              )}
            </div>

            <div className="space-y-3 text-sm border-t border-gray-100 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toLocaleString('es-CO')}</span>
              </div>
              {discount && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento ({discount.code})</span>
                  <span>-${discountAmount.toLocaleString('es-CO')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Envío</span>
                <span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>
                  {shippingCost === 0 ? '¡Gratis!' : `$${shippingCost.toLocaleString('es-CO')}`}
                </span>
              </div>
              {shippingCost > 0 && (
                <p className="text-xs text-gray-400">
                  Envío gratis en compras +$200.000
                </p>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3 mt-3">
                <span>Total</span>
                <span className="text-primary-600">${total.toLocaleString('es-CO')}</span>
              </div>
            </div>

            <Link
              href={{ pathname: '/checkout', query: discount ? { coupon: discount.code } : {} }}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
            >
              Proceder al pago <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
