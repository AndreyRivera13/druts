'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/services/api';
import { OrderStatus } from '@/types';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  shipped: 'Despachado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};

export default function AdminOrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [page, setPage] = useState(1);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const qc = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders', selectedStatus, page],
    queryFn: () => ordersApi.getAll({ status: selectedStatus || undefined, page, limit: 20 }),
  });

  const mutation = useMutation({
    mutationFn: ({ id, status, trackingCode }: { id: string; status: OrderStatus; trackingCode?: string }) =>
      ordersApi.updateStatus(id, status, trackingCode),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Estado actualizado');
    },
    onError: () => toast.error('Error al actualizar'),
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-500 mt-1">{orders?.total ?? 0} pedidos en total</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setSelectedStatus('')}
          className={clsx('px-4 py-2 rounded-xl text-sm font-medium transition-all', !selectedStatus ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 hover:border-primary-300')}
        >
          Todos
        </button>
        {Object.entries(statusLabels).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setSelectedStatus(value as OrderStatus)}
            className={clsx('px-4 py-2 rounded-xl text-sm font-medium transition-all', selectedStatus === value ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 hover:border-primary-300')}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="card p-8 text-center text-gray-400">Cargando pedidos...</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left font-medium text-gray-600"># Pedido</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-600">Cliente</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-600">Fecha</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-600">Total</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-600">Estado</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-600">Guía / Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders?.data?.map((order: any) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium">#{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{order.user?.name}</p>
                      <p className="text-gray-400 text-xs">{order.shippingCity}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-6 py-4 font-bold">
                      ${Number(order.total).toLocaleString('es-CO')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx('badge', statusColors[order.status as OrderStatus])}>
                        {statusLabels[order.status as OrderStatus]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          value={trackingInputs[order.id] || ''}
                          onChange={e => setTrackingInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                          placeholder="Código guía"
                          className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-28 focus:outline-none focus:border-primary-400"
                        />
                        <select
                          value={order.status}
                          onChange={e => mutation.mutate({
                            id: order.id,
                            status: e.target.value as OrderStatus,
                            trackingCode: trackingInputs[order.id],
                          })}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-primary-400"
                        >
                          {Object.entries(statusLabels).map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orders && orders.pages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Página {page} de {orders.pages}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50">Anterior</button>
                <button onClick={() => setPage(p => Math.min(orders.pages, p + 1))} disabled={page === orders.pages} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50">Siguiente</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
