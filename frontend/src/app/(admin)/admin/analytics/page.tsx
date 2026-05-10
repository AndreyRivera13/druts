'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Package, Users,
  Award, Clock, AlertTriangle,
} from 'lucide-react';
import { analyticsApi } from '@/services/api';
import { clsx } from 'clsx';

const COLORS = ['#7B5C3A', '#A06B3B', '#B8975A', '#5A1F1F', '#D9CFBE', '#1A1A1A'];
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function AnalyticsPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const { data: summary, isLoading: l1 } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: analyticsApi.getDashboard,
  });
  const { data: monthly, isLoading: l2 } = useQuery({
    queryKey: ['analytics', 'monthly', year],
    queryFn: () => analyticsApi.getMonthlySales(year),
  });
  const { data: topProducts } = useQuery({
    queryKey: ['analytics', 'top-products', 10],
    queryFn: () => analyticsApi.getTopProducts(10),
  });
  const { data: byCategory } = useQuery({
    queryKey: ['analytics', 'by-category'],
    queryFn: analyticsApi.getSalesByCategory,
  });
  const { data: byBrand } = useQuery({
    queryKey: ['analytics', 'by-brand'],
    queryFn: analyticsApi.getSalesByBrand,
  });
  const { data: bySize } = useQuery({
    queryKey: ['analytics', 'by-size'],
    queryFn: analyticsApi.getSalesBySize,
  });
  const { data: topCustomers } = useQuery({
    queryKey: ['analytics', 'top-customers', 10],
    queryFn: () => analyticsApi.getTopCustomers(10),
  });

  const chartData = MONTHS.map((label, i) => {
    const entry = monthly?.find((m: any) => Number(m.month) === i + 1);
    return {
      mes: label,
      ingresos: entry ? Number(entry.revenue) : 0,
      pedidos: entry ? Number(entry.orders) : 0,
    };
  });

  const stats = summary ? [
    {
      title: 'Ingresos del mes',
      value: `$${Number(summary.revenue.thisMonth).toLocaleString('es-CO')}`,
      change: summary.revenue.monthGrowth,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Pedidos del mes',
      value: summary.monthOrders,
      change: summary.orderGrowth,
      icon: ShoppingBag,
      color: 'bg-blue-500',
    },
    {
      title: 'Ingresos totales',
      value: `$${Number(summary.revenue.total).toLocaleString('es-CO')}`,
      change: null,
      icon: TrendingUp,
      color: 'bg-cuero',
    },
    {
      title: 'Pendientes',
      value: summary.pendingOrders,
      change: null,
      icon: Clock,
      color: summary.pendingOrders > 0 ? 'bg-amber-500' : 'bg-gray-400',
    },
  ] : [];

  const isLoading = l1 || l2;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analíticas</h1>
          <p className="text-gray-500 mt-1">Indicadores de rendimiento de tu tienda</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs uppercase tracking-wider text-gray-500">Año</label>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="px-4 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-primary-400"
          >
            {[currentYear, currentYear - 1, currentYear - 2].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {(isLoading ? Array(4).fill(null) : stats).map((stat, i) => (
          <div key={i} className="card p-6">
            {!stat ? (
              <div className="h-24 bg-gray-100 animate-pulse rounded-lg" />
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 break-all">{stat.value}</p>
                  {stat.change !== null && stat.change !== undefined && (
                    <div className={clsx(
                      'flex items-center gap-1 mt-2 text-sm font-medium',
                      stat.change >= 0 ? 'text-green-600' : 'text-red-600',
                    )}>
                      {stat.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {Math.abs(stat.change).toFixed(1)}% vs mes anterior
                    </div>
                  )}
                </div>
                <div className={`${stat.color} text-white p-3 rounded-xl`}>
                  <stat.icon size={20} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pending alert */}
      {summary?.pendingOrders > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex items-center gap-3">
          <AlertTriangle className="text-amber-600 flex-shrink-0" size={22} />
          <div>
            <p className="font-semibold text-amber-900">
              Tienes {summary.pendingOrders} pedido{summary.pendingOrders > 1 ? 's' : ''} pendiente{summary.pendingOrders > 1 ? 's' : ''}
            </p>
            <a href="/admin/orders" className="text-amber-700 text-sm underline">Ver pedidos →</a>
          </div>
        </div>
      )}

      {/* Monthly + Category */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg text-gray-900">Ingresos mensuales {year}</h2>
            <p className="text-xs text-gray-500">
              Total: ${chartData.reduce((acc, d) => acc + d.ingresos, 0).toLocaleString('es-CO')}
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                formatter={(v: any, name: string) =>
                  name === 'Ingresos'
                    ? [`$${Number(v).toLocaleString('es-CO')}`, name]
                    : [Number(v).toLocaleString('es-CO'), name]
                }
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="ingresos"
                name="Ingresos"
                stroke="#7B5C3A"
                strokeWidth={3}
                dot={{ fill: '#7B5C3A', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="pedidos"
                name="Pedidos"
                stroke="#5A1F1F"
                strokeWidth={2}
                dot={{ fill: '#5A1F1F', r: 3 }}
                yAxisId={0}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-6">Ventas por categoría</h2>
          {byCategory && byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="revenue"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {byCategory.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => `$${Number(v).toLocaleString('es-CO')}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </div>
      </div>

      {/* Brand + Size */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-6">Ventas por marca</h2>
          {byBrand && byBrand.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byBrand} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                <YAxis dataKey="brand" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip formatter={(v: any) => `$${Number(v).toLocaleString('es-CO')}`} />
                <Bar dataKey="revenue" fill="#7B5C3A" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-6">Tallas más vendidas</h2>
          {bySize && bySize.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={bySize}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="size" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => `${Number(v).toLocaleString('es-CO')} unidades`} />
                <Bar dataKey="unitsSold" fill="#A06B3B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
            <Award size={18} className="text-amber-500" /> Productos más vendidos
          </h2>
          {topProducts && topProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-3 font-medium">#</th>
                    <th className="pb-3 font-medium">Producto</th>
                    <th className="pb-3 font-medium text-right">Unid.</th>
                    <th className="pb-3 font-medium text-right">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p: any, i: number) => (
                    <tr key={p.productId ?? i} className="border-b border-gray-50">
                      <td className="py-3 text-gray-400">{i + 1}</td>
                      <td className="py-3 font-medium text-gray-900">{p.name}</td>
                      <td className="py-3 text-right text-gray-700">
                        {Number(p.unitsSold).toLocaleString()}
                      </td>
                      <td className="py-3 text-right font-semibold text-green-600">
                        ${Number(p.revenue).toLocaleString('es-CO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyChart />
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
            <Users size={18} className="text-blue-500" /> Mejores clientes
          </h2>
          {topCustomers && topCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-3 font-medium">#</th>
                    <th className="pb-3 font-medium">Cliente</th>
                    <th className="pb-3 font-medium text-right">Pedidos</th>
                    <th className="pb-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((c: any, i: number) => (
                    <tr key={c.userId ?? i} className="border-b border-gray-50">
                      <td className="py-3 text-gray-400">{i + 1}</td>
                      <td className="py-3">
                        <p className="font-medium text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.email}</p>
                      </td>
                      <td className="py-3 text-right text-gray-700">
                        {Number(c.orderCount).toLocaleString()}
                      </td>
                      <td className="py-3 text-right font-semibold text-green-600">
                        ${Number(c.totalSpent).toLocaleString('es-CO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyChart />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-60 flex flex-col items-center justify-center text-gray-400">
      <Package size={32} className="mb-2 opacity-40" />
      <p className="text-sm">Aún no hay datos</p>
    </div>
  );
}
