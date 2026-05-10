'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag,
  BarChart3, Warehouse, Bell, Settings, LogOut, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { clsx } from 'clsx';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Package, label: 'Productos', href: '/admin/products' },
  { icon: Warehouse, label: 'Inventario', href: '/admin/inventory' },
  { icon: ShoppingBag, label: 'Pedidos', href: '/admin/orders' },
  { icon: Users, label: 'Clientes', href: '/admin/customers' },
  { icon: Tag, label: 'Cupones', href: '/admin/coupons' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (user?.role !== 'admin') router.push('/');
  }, [isAuthenticated, user]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col fixed inset-y-0 left-0 z-40">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div>
              <p className="font-serif text-xl tracking-[0.08em]">DRUTS</p>
              <p className="text-xs text-gray-400 uppercase tracking-[0.18em] mt-0.5">Panel Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
              )}
            >
              <item.icon size={18} />
              {item.label}
              {(pathname === item.href || pathname.startsWith(item.href + '/')) && (
                <ChevronRight size={14} className="ml-auto" />
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
              {user.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors mb-1">
            🏪 Ver tienda
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 rounded-lg hover:bg-gray-800 transition-colors w-full"
          >
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}
