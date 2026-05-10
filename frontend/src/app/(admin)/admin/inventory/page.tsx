'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { inventoryApi } from '@/services/api';
import { AlertTriangle, Package, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

export default function InventoryPage() {
  const qc = useQueryClient();
  const [movementForm, setMovementForm] = useState<any>({ variantId: '', type: 'entry', quantity: 1, reason: '' });
  const [showMoveForm, setShowMoveForm] = useState(false);

  const { data: alerts } = useQuery({
    queryKey: ['inventory', 'alerts'],
    queryFn: inventoryApi.getAlerts,
  });

  const { data: movements } = useQuery({
    queryKey: ['inventory', 'movements'],
    queryFn: () => inventoryApi.getMovements(),
  });

  const mutation = useMutation({
    mutationFn: inventoryApi.registerMovement,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Movimiento registrado');
      setShowMoveForm(false);
      setMovementForm({ variantId: '', type: 'entry', quantity: 1, reason: '' });
    },
    onError: () => toast.error('Error al registrar movimiento'),
  });

  const typeIcons = {
    entry: <ArrowDown size={14} className="text-green-600" />,
    exit: <ArrowUp size={14} className="text-red-600" />,
    adjustment: <RefreshCw size={14} className="text-blue-600" />,
    return: <ArrowDown size={14} className="text-orange-600" />,
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-500 mt-1">Control de stock y movimientos</p>
        </div>
        <button onClick={() => setShowMoveForm(true)} className="btn-primary">
          + Registrar Movimiento
        </button>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={20} className="text-orange-500" />
            <h2 className="font-bold text-gray-900">Stock Bajo ({alerts?.lowStock?.length ?? 0})</h2>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {alerts?.lowStock?.length === 0 && <p className="text-gray-400 text-sm">Sin alertas 🎉</p>}
            {alerts?.lowStock?.map((v: any) => (
              <div key={v.id} className="flex items-center justify-between bg-orange-50 rounded-xl px-4 py-3">
                <div>
                  <p className="font-medium text-sm">{v.product?.name}</p>
                  <p className="text-xs text-gray-500">T{v.size} · {v.color}</p>
                </div>
                <span className="text-orange-600 font-bold text-sm">{v.stock} uds</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Package size={20} className="text-red-500" />
            <h2 className="font-bold text-gray-900">Agotados ({alerts?.outOfStock?.length ?? 0})</h2>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {alerts?.outOfStock?.length === 0 && <p className="text-gray-400 text-sm">Sin productos agotados 🎉</p>}
            {alerts?.outOfStock?.map((v: any) => (
              <div key={v.id} className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-3">
                <div>
                  <p className="font-medium text-sm">{v.product?.name}</p>
                  <p className="text-xs text-gray-500">T{v.size} · {v.color} · SKU: {v.sku || 'N/A'}</p>
                </div>
                <span className="text-red-600 font-bold text-sm">AGOTADO</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Movements */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-bold text-lg text-gray-900">Historial de Movimientos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-600">Tipo</th>
                <th className="px-6 py-3 text-left font-medium text-gray-600">Producto</th>
                <th className="px-6 py-3 text-left font-medium text-gray-600">Cantidad</th>
                <th className="px-6 py-3 text-left font-medium text-gray-600">Stock Antes → Después</th>
                <th className="px-6 py-3 text-left font-medium text-gray-600">Motivo</th>
                <th className="px-6 py-3 text-left font-medium text-gray-600">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {movements?.data?.map((m: any) => (
                <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2 capitalize">
                      {typeIcons[m.type as keyof typeof typeIcons]}
                      {m.type}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <p className="font-medium">{m.variant?.product?.name}</p>
                    <p className="text-xs text-gray-400">T{m.variant?.size} · {m.variant?.color}</p>
                  </td>
                  <td className="px-6 py-3 font-medium">{m.quantity}</td>
                  <td className="px-6 py-3 text-gray-600">
                    {m.stockBefore} → <span className="font-medium">{m.stockAfter}</span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{m.reason || '—'}</td>
                  <td className="px-6 py-3 text-gray-400">
                    {new Date(m.createdAt).toLocaleDateString('es-CO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement modal */}
      {showMoveForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">Registrar Movimiento</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID de Variante</label>
                <input
                  value={movementForm.variantId}
                  onChange={e => setMovementForm((p: any) => ({ ...p, variantId: e.target.value }))}
                  className="input"
                  placeholder="UUID de la variante"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={movementForm.type}
                  onChange={e => setMovementForm((p: any) => ({ ...p, type: e.target.value }))}
                  className="input"
                >
                  <option value="entry">Entrada</option>
                  <option value="exit">Salida</option>
                  <option value="adjustment">Ajuste</option>
                  <option value="return">Devolución</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                <input
                  type="number"
                  value={movementForm.quantity}
                  onChange={e => setMovementForm((p: any) => ({ ...p, quantity: +e.target.value }))}
                  className="input"
                  min={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                <input
                  value={movementForm.reason}
                  onChange={e => setMovementForm((p: any) => ({ ...p, reason: e.target.value }))}
                  className="input"
                  placeholder="Ej: Compra a proveedor, daño, etc."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowMoveForm(false)} className="btn-secondary flex-1">Cancelar</button>
              <button
                onClick={() => mutation.mutate(movementForm)}
                disabled={!movementForm.variantId || mutation.isPending}
                className="btn-primary flex-1"
              >
                {mutation.isPending ? 'Guardando...' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
