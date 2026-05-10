'use client';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Package, Users, ShoppingBag, DollarSign } from 'lucide-react';
import { analyticsApi } from '@/services/api';
import { clsx } from 'clsx';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
  const { data: summary } = useQuery({ queryKey: ['analytics', 'dashboard'], queryFn: analyticsApi.getDashboard });
  const { data: monthly } = useQuery({ queryKey: ['analytics', 'monthly'], queryFn: () => analyticsApi.getMonthlySales() });
  const { data: topProducts } = useQuery({ queryKey: ['analytics', 'top-products'], queryFn: () => analyticsApi.getTopProducts(5) });
  const { data: salesByCategory } = useQuery({ queryKey: ['analytics', 'by-category'], queryFn: () => analyticsApi.getSalesByCategory() });

  const statsCards = summary ? [
    {
      title: 'Ventas del Mes',
      value: `$${Number(summary.revenue.thisMonth).toLocaleString('es-CO')}`,
      change: summary.revenue.monthGrowth,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Pedidos del Mes',
      value: summary.monthOrders,
      change: summary.orderGrowth,
      icon: ShoppingBag,
      color: 'bg-blue-500',
    },
    {
      title: 'Productos Activos',
      value: summary.products,
      change: null,
      icon: Package,
      color: 'bg-primary-500',
    },
    {
      title: 'Clientes Totales',
      value: summary.users,
      change: null,
      icon: Users,
      color: 'bg-purple-500',
    },
  ] : [];

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const chartData = monthly?.map((m: any) => ({
    mes: monthNames[Number(m.month) - 1],
    ingresos: Number(m.revenue),
    pedidos: Number(m.orders),
  }));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Resumen de la actividad de tu tienda</p>
      </div>

      {/* Pending alert */}
      {summary?.pendingOrders > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-8 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-yellow-800">
              Tienes {summary.pendingOrders} pedido{summary.pendingOrders > 1 ? 's' : ''} pendiente{summary.pendingOrders > 1 ? 's' : ''}
            </p>
            <a href="/admin/orders" className="text-yellow-700 text-sm underline">Ver pedidos →</a>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat) => (
          <div key={stat.title} className="card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                {stat.change !== null && stat.change !== undefined && (
                  <div className={clsx('flex items-center gap-1 mt-2 text-sm font-medium', stat.change >= 0 ? 'text-green-600' : 'text-red-600')}>
                    {stat.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {Math.abs(stat.change).toFixed(1)}% vs mes anterior
                  </div>
                )}
              </div>
              <div className={`${stat.color} text-white p-3 rounded-xl`}>
                <stat.icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Revenue chart */}
        <div className="xl:col-span-2 card p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-6">Ingresos Mensuales {new Date().getFullYear()}</h2>
          {chartData && (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString('es-CO')}`, 'Ingresos']} />
                <Line type="monotone" dataKey="ingresos" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category pie */}
        <div className="card p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-6">Ventas por Categoría</h2>
          {salesByCategory && (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={salesByCategory}
                  dataKey="revenue"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {salesByCategory.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => `$${Number(v).toLocaleString('es-CO')}`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top products */}
      {topProducts && topProducts.length > 0 && (
        <div className="card p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-6">🏆 Productos Más Vendidos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">#</th>
                  <th className="pb-3 font-medium">Producto</th>
                  <th className="pb-3 font-medium text-right">Unidades</th>
                  <th className="pb-3 font-medium text-right">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p: any, i: number) => (
                  <tr key={p.productId} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 text-gray-400">{i + 1}</td>
                    <td className="py-3 font-medium">{p.name}</td>
                    <td className="py-3 text-right text-gray-700">{Number(p.unitsSold).toLocaleString()}</td>
                    <td className="py-3 text-right font-semibold text-green-600">
                      ${Number(p.revenue).toLocaleString('es-CO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
