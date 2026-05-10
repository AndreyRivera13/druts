'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Mail, Phone, MapPin, Award, ShoppingBag, Eye, X } from 'lucide-react';
import { usersApi } from '@/services/api';
import { clsx } from 'clsx';

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page],
    queryFn: () => usersApi.getAll({ page, limit: 20 }),
  });

  const { data: top } = useQuery({
    queryKey: ['admin', 'top-customers'],
    queryFn: () => usersApi.topCustomers(5),
  });

  const filtered = data?.data?.filter((u: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name?.toLowerCase().includes(q)
      || u.email?.toLowerCase().includes(q)
      || u.phone?.toLowerCase().includes(q);
  }) ?? [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">
            {data?.total ?? 0} {data?.total === 1 ? 'cliente registrado' : 'clientes registrados'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total clientes"
          value={data?.total ?? 0}
          icon={<ShoppingBag size={20} className="text-blue-500" />}
        />
        <StatCard
          label="Administradores"
          value={data?.data?.filter((u: any) => u.role === 'admin').length ?? 0}
          icon={<Award size={20} className="text-amber-500" />}
        />
        <StatCard
          label="Activos"
          value={data?.data?.filter((u: any) => u.isActive !== false).length ?? 0}
          icon={<Award size={20} className="text-green-500" />}
        />
      </div>

      {/* Top customers */}
      {top && top.length > 0 && (
        <div className="card p-6 mb-8">
          <h2 className="font-bold text-lg text-gray-900 mb-5 flex items-center gap-2">
            <Award size={18} className="text-amber-500" /> Top clientes por compras
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {top.slice(0, 5).map((u: any, i: number) => (
              <div key={u.id} className="text-center p-4 border border-gray-100 rounded-2xl hover:border-primary-400 transition-colors">
                <div className={clsx(
                  'w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-lg font-bold',
                  i === 0 ? 'bg-amber-100 text-amber-700' :
                  i === 1 ? 'bg-gray-100 text-gray-700' :
                  i === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-50 text-blue-600',
                )}>
                  {u.name?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
                <p className="font-medium text-gray-900 text-sm truncate">{u.name}</p>
                <p className="text-xs text-gray-500 truncate mb-2">{u.email}</p>
                <p className="text-xs font-bold text-green-600">
                  {Number(u.totalPurchases ?? 0).toLocaleString('es-CO')} compras
                </p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">
                  {u.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="card p-4 mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email o teléfono..."
            className="w-full pl-11 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Cargando…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-5xl mb-4">👥</p>
            <p className="font-bold text-lg text-gray-900 mb-1">Sin clientes</p>
            <p className="text-gray-500 text-sm">No se encontraron clientes con esos criterios.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 font-medium">Cliente</th>
                    <th className="px-6 py-3 font-medium">Contacto</th>
                    <th className="px-6 py-3 font-medium">Ciudad</th>
                    <th className="px-6 py-3 font-medium">Rol</th>
                    <th className="px-6 py-3 font-medium">Estado</th>
                    <th className="px-6 py-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u: any) => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs">
                            {u.name?.charAt(0)?.toUpperCase() ?? '?'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-400">ID: {u.id?.slice(0, 8)}…</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700 text-xs flex items-center gap-1.5">
                          <Mail size={11} className="text-gray-400" /> {u.email}
                        </p>
                        {u.phone && (
                          <p className="text-gray-500 text-xs flex items-center gap-1.5 mt-1">
                            <Phone size={11} className="text-gray-400" /> {u.phone}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{u.city ?? '—'}</td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          'inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide',
                          u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700',
                        )}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          'inline-block w-2 h-2 rounded-full mr-2',
                          u.isActive !== false ? 'bg-green-500' : 'bg-gray-300',
                        )} />
                        <span className="text-xs text-gray-600">{u.isActive !== false ? 'Activo' : 'Inactivo'}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedId(u.id)}
                          className="p-2 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                          title="Ver detalle"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Página {page} de {data.pages}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 text-xs font-medium border border-gray-200 rounded-lg hover:border-gray-400 disabled:opacity-30"
                  >
                    Anterior
                  </button>
                  <button
                    disabled={page === data.pages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 text-xs font-medium border border-gray-200 rounded-lg hover:border-gray-400 disabled:opacity-30"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedId && (
        <CustomerDetailModal id={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function CustomerDetailModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: u, isLoading } = useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () => usersApi.getOne(id),
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-gray-900">Detalle del cliente</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        {isLoading || !u ? (
          <p className="text-center text-gray-400 py-8">Cargando…</p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
              <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-2xl font-bold">
                {u.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-lg text-gray-900">{u.name}</p>
                <p className="text-sm text-gray-500">{u.email}</p>
                <span className={clsx(
                  'inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide mt-1',
                  u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700',
                )}>{u.role}</span>
              </div>
            </div>
            <DetailRow icon={<Phone size={14} />} label="Teléfono" value={u.phone ?? '—'} />
            <DetailRow icon={<MapPin size={14} />} label="Dirección" value={u.address ?? '—'} />
            <DetailRow icon={<MapPin size={14} />} label="Ciudad" value={u.city ?? '—'} />
            <DetailRow icon={<ShoppingBag size={14} />} label="Compras realizadas"
              value={Number(u.totalPurchases ?? 0).toLocaleString('es-CO')} />
            <DetailRow label="Estado"
              value={u.isActive !== false ? 'Activo' : 'Inactivo'} />
            <DetailRow label="Registrado"
              value={u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-CO') : '—'} />
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: any }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500 flex items-center gap-2">
        {icon} {label}
      </span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
