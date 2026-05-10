'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { ordersApi } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { OrderStatus } from '@/types';
import { clsx } from 'clsx';

const statusConfig: Record<OrderStatus, { label: string; icon: any; color: string }> = {
  pending: { label: 'Pendiente', icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
  confirmed: { label: 'Confirmado', icon: CheckCircle, color: 'text-blue-600 bg-blue-50' },
  preparing: { label: 'Preparando', icon: Package, color: 'text-orange-600 bg-orange-50' },
  shipped: { label: 'Despachado', icon: Truck, color: 'text-purple-600 bg-purple-50' },
  delivered: { label: 'Entregado', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
  cancelled: { label: 'Cancelado', icon: XCircle, color: 'text-red-600 bg-red-50' },
  refunded: { label: 'Reembolsado', icon: XCircle, color: 'text-gray-600 bg-gray-50' },
};

export default function OrdersPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => { if (!isAuthenticated) router.push('/auth/login'); }, [isAuthenticated]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersApi.myOrders(),
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Mis Pedidos</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">📦 Mis Pedidos</h1>

      {!orders?.data?.length ? (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">📭</p>
          <h3 className="text-xl font-semibold mb-2">No tienes pedidos aún</h3>
          <p className="text-gray-500 mb-8">Cuando realices una compra, aparecerá aquí</p>
          <Link href="/catalog" className="btn-primary">Ver Catálogo</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.data.map((order: any) => {
            const StatusIcon = statusConfig[order.status as OrderStatus]?.icon ?? Clock;
            const statusStyle = statusConfig[order.status as OrderStatus]?.color ?? 'text-gray-600 bg-gray-50';
            return (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <div className="card p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">#{order.orderNumber}</h3>
                        <span className={clsx('badge', statusStyle)}>
                          <StatusIcon size={12} className="mr-1" />
                          {statusConfig[order.status as OrderStatus]?.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('es-CO', {
                          day: '2-digit', month: 'long', year: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        {order.items?.length} {order.items?.length === 1 ? 'producto' : 'productos'}
                        {order.trackingCode && ` · Guía: ${order.trackingCode}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ${Number(order.total).toLocaleString('es-CO')}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {order.paymentMethod.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
