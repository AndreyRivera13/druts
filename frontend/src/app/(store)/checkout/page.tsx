'use client';
import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { ordersApi } from '@/services/api';
import toast from 'react-hot-toast';
import { CheckCircle } from 'lucide-react';

const schema = z.object({
  shippingRecipient: z.string().min(3, 'Nombre requerido'),
  shippingAddress: z.string().min(5, 'Dirección requerida'),
  shippingCity: z.string().min(2, 'Ciudad requerida'),
  shippingPhone: z.string().min(7, 'Teléfono requerido'),
  paymentMethod: z.enum(['cash_on_delivery', 'nequi', 'daviplata', 'pse', 'credit_card']),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof schema>;

const paymentMethods = [
  { value: 'cash_on_delivery', label: '💵 Pago contra entrega', desc: 'Paga cuando recibas' },
  { value: 'nequi', label: '💜 Nequi', desc: '3208876543' },
  { value: 'daviplata', label: '🔴 Daviplata', desc: '3001234567' },
  { value: 'pse', label: '🏦 PSE', desc: 'Transferencia bancaria' },
  { value: 'credit_card', label: '💳 Tarjeta', desc: 'Crédito / Débito' },
];

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-96"><p className="text-gray-400">Cargando checkout...</p></div>}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const couponCode = searchParams.get('coupon');
  const { cart, fetchCart, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<any>(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<CheckoutForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      shippingRecipient: user?.name || '',
      shippingAddress: user?.address || '',
      shippingCity: user?.city || '',
      shippingPhone: user?.phone || '',
      paymentMethod: 'cash_on_delivery',
    },
  });

  useEffect(() => {
    if (isAuthenticated) fetchCart();
    else router.push('/auth/login');
  }, [isAuthenticated]);

  if (!cart || cart.items.length === 0) {
    router.push('/cart');
    return null;
  }

  const subtotal = cart.subtotal;
  const shippingCost = subtotal >= 200000 ? 0 : 12000;
  const total = subtotal + shippingCost;

  const onSubmit = async (data: CheckoutForm) => {
    setLoading(true);
    try {
      const orderData = {
        items: cart.items.map(item => ({
          productId: item.product.id,
          variantId: item.variant.id,
          quantity: item.quantity,
        })),
        paymentMethod: data.paymentMethod,
        shippingAddress: data.shippingAddress,
        shippingCity: data.shippingCity,
        shippingPhone: data.shippingPhone,
        shippingRecipient: data.shippingRecipient,
        couponCode: couponCode || undefined,
        notes: data.notes,
      };

      const order = await ordersApi.create(orderData);
      await clearCart();
      setOrderPlaced(order);
      toast.success('¡Pedido realizado con éxito!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="text-green-500 flex justify-center mb-6">
          <CheckCircle size={80} strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">¡Pedido confirmado!</h1>
        <p className="text-gray-600 mb-2">
          Tu pedido <strong>#{orderPlaced.orderNumber}</strong> ha sido recibido.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Recibirás una confirmación por WhatsApp. Tiempo estimado de entrega: 2-4 días hábiles.
        </p>
        <div className="bg-gray-50 rounded-2xl p-6 text-left mb-8 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Total pagado</span>
            <span className="font-bold text-lg">${Number(orderPlaced.total).toLocaleString('es-CO')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Método de pago</span>
            <span className="capitalize">{orderPlaced.paymentMethod.replace('_', ' ')}</span>
          </div>
        </div>
        <div className="flex gap-4 justify-center">
          <button onClick={() => router.push(`/orders/${orderPlaced.id}`)} className="btn-primary">
            Ver mi pedido
          </button>
          <button onClick={() => router.push('/catalog')} className="btn-secondary">
            Seguir comprando
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar compra</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping */}
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-5">📦 Datos de entrega</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del destinatario</label>
                  <input {...register('shippingRecipient')} className="input" placeholder="Juan Pérez" />
                  {errors.shippingRecipient && <p className="text-red-500 text-xs mt-1">{errors.shippingRecipient.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input {...register('shippingAddress')} className="input" placeholder="Calle 5 #10-20, Barrio Centro" />
                  {errors.shippingAddress && <p className="text-red-500 text-xs mt-1">{errors.shippingAddress.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                  <input {...register('shippingCity')} className="input" placeholder="Cúcuta" />
                  {errors.shippingCity && <p className="text-red-500 text-xs mt-1">{errors.shippingCity.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input {...register('shippingPhone')} className="input" placeholder="3001234567" type="tel" />
                  {errors.shippingPhone && <p className="text-red-500 text-xs mt-1">{errors.shippingPhone.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas adicionales (opcional)</label>
                  <textarea {...register('notes')} className="input" rows={2} placeholder="Instrucciones de entrega..." />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-5">💳 Método de pago</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentMethods.map(method => (
                  <label
                    key={method.value}
                    className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      watch('paymentMethod') === method.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-200'
                    }`}
                  >
                    <input {...register('paymentMethod')} type="radio" value={method.value} className="hidden" />
                    <div>
                      <p className="font-medium text-sm">{method.label}</p>
                      <p className="text-xs text-gray-500">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="card p-6 sticky top-24">
              <h2 className="font-bold text-lg mb-5">Tu pedido</h2>
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.items.map(item => (
                  <div key={item.id} className="flex gap-3 text-sm">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative">
                      {item.product.images?.[0]?.url && (
                        <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{item.product.name}</p>
                      <p className="text-gray-500">T{item.variant.size} · x{item.quantity}</p>
                    </div>
                    <p className="font-medium">
                      ${(Number(item.product.currentPrice) * item.quantity).toLocaleString('es-CO')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm border-t pt-4">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>${subtotal.toLocaleString('es-CO')}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Envío</span><span className={shippingCost === 0 ? 'text-green-600' : ''}>{shippingCost === 0 ? 'Gratis' : `$${shippingCost.toLocaleString('es-CO')}`}</span></div>
                <div className="flex justify-between text-base font-bold border-t pt-3 mt-2">
                  <span>Total</span>
                  <span className="text-primary-600">${total.toLocaleString('es-CO')}</span>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full mt-6">
                {loading ? 'Procesando...' : '✅ Confirmar pedido'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
