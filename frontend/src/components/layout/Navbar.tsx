'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  ShoppingBag, Search, Menu, X, User, LogOut, LayoutDashboard, Heart, ChevronRight, ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { useWishlistStore } from '@/store/wishlist.store';
import { productsApi } from '@/services/api';

// ─── Categorías reales DRUTS con sub-grupos para el mega-menú ─────
const NAV: Array<{
  name: string;
  href: string;
  blocks?: Array<{ title: string; links: Array<{ label: string; href: string }> }>;
  feature?: { img: string; title: string; subtitle: string; href: string };
  highlight?: boolean;
}> = [
  {
    name: 'Sneakers',
    href: '/catalog?category=sneakers',
    blocks: [
      {
        title: 'Por estilo',
        links: [
          { label: 'Todos los sneakers', href: '/catalog?category=sneakers' },
          { label: 'Cuero genuino',      href: '/catalog?category=sneakers&search=cuero' },
          { label: 'Edición premium',    href: '/catalog?category=premium' },
        ],
      },
      {
        title: 'Por color',
        links: [
          { label: 'Marino',    href: '/catalog?category=sneakers&search=marino' },
          { label: 'Chocolate', href: '/catalog?category=sneakers&search=chocolate' },
          { label: 'Negro',     href: '/catalog?category=sneakers&search=negro' },
        ],
      },
    ],
    feature: {
      img: '/druts/sneaker-navy-1.png',
      title: 'Drake Marino',
      subtitle: 'El sneaker más vendido',
      href: '/catalog?category=sneakers',
    },
  },
  {
    name: 'Botas',
    href: '/catalog?category=botas',
    blocks: [
      {
        title: 'Por estilo',
        links: [
          { label: 'Todas las botas', href: '/catalog?category=botas' },
          { label: 'Chukka',          href: '/catalog?category=botas&search=chukka' },
          { label: 'Desert',          href: '/catalog?category=botas&search=desert' },
        ],
      },
      {
        title: 'Por color',
        links: [
          { label: 'Camel',     href: '/catalog?category=botas&search=camel' },
          { label: 'Cognac',    href: '/catalog?category=botas&search=cognac' },
          { label: 'Chocolate', href: '/catalog?category=botas&search=chocolate' },
        ],
      },
    ],
    feature: {
      img: '/druts/chukka-camel-1.png',
      title: 'Sahara Chukka',
      subtitle: 'Cuero camel · Suela crepe',
      href: '/catalog?category=botas',
    },
  },
  { name: 'Casuales',  href: '/catalog?category=casuales' },
  { name: 'Lifestyle', href: '/catalog?category=lifestyle' },
  { name: 'Premium',   href: '/catalog?category=premium', highlight: true },
];

// ─── Announcement bar (mensajes rotativos) ──────────────────────────
const ANNOUNCEMENTS = [
  '✦  Envío gratis en compras superiores a $300.000  ✦',
  '✦  10% en tu primera compra con el cupón BIENVENIDO10  ✦',
  '✦  Cambios sin costo durante 15 días  ✦',
  '✦  WhatsApp +57 300 123 4567 · lun—sáb · 8am—7pm  ✦',
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [annIdx, setAnnIdx] = useState(0);

  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart, fetchCart } = useCartStore();
  const wishlistCount = useWishlistStore(s => s.ids.length);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { if (isAuthenticated) fetchCart(); }, [isAuthenticated]);

  useEffect(() => {
    setIsMenuOpen(false);
    setSearchOpen(false);
    setShowSuggestions(false);
    setHoveredItem(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  // Rotación de la announcement bar
  useEffect(() => {
    const id = setInterval(() => setAnnIdx(i => (i + 1) % ANNOUNCEMENTS.length), 4000);
    return () => clearInterval(id);
  }, []);

  // Búsqueda con debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim() || searchQuery.length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await productsApi.getAll({ search: searchQuery, limit: 6 });
        setSuggestions(res.data ?? []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  const itemCount = cart?.itemCount ?? 0;

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const activeItem = hoveredItem ? NAV.find(n => n.name === hoveredItem) : null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white">
      {/* ─── Top announcement bar (rotativa) ─── */}
      <div className="bg-ink text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center text-[10px] tracking-[0.18em] uppercase py-2 h-7 relative">
          {ANNOUNCEMENTS.map((msg, i) => (
            <span
              key={i}
              className={`absolute left-0 right-0 text-center transition-all duration-500 ${
                i === annIdx ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}
            >
              {msg}
            </span>
          ))}
        </div>
      </div>

      {/* ─── Main header (logo central) ─── */}
      <div className="border-b border-stone bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 items-center h-20">
            {/* Left */}
            <div className="flex items-center gap-2 justify-start">
              <button
                onClick={() => { setSearchOpen(s => !s); setTimeout(() => inputRef.current?.focus(), 50); }}
                className="hidden md:flex items-center gap-2 text-xs uppercase tracking-[0.18em] hover:text-cuero transition-colors py-2"
                aria-label="Buscar"
              >
                <Search size={16} strokeWidth={1.5} />
                <span className="hidden lg:inline">Buscar</span>
              </button>
              <button
                onClick={() => { setSearchOpen(s => !s); setTimeout(() => inputRef.current?.focus(), 50); }}
                className="md:hidden p-2"
                aria-label="Buscar"
              >
                <Search size={20} strokeWidth={1.5} />
              </button>
              <button className="md:hidden p-2" onClick={() => setIsMenuOpen(s => !s)} aria-label="Menú">
                <Menu size={22} strokeWidth={1.5} />
              </button>
            </div>

            {/* Center: Logo */}
            <Link href="/" className="flex items-center justify-center select-none" aria-label="Inicio">
              <Image
                src="/druts/logo.png"
                alt="DRUTS"
                width={180}
                height={72}
                priority
                className="h-12 md:h-14 w-auto object-contain"
              />
            </Link>

            {/* Right */}
            <div className="flex items-center justify-end gap-1 sm:gap-2">
              {isAuthenticated ? (
                <div className="relative group hidden sm:block">
                  <button className="p-2 hover:text-cuero transition-colors" aria-label="Mi cuenta">
                    <User size={20} strokeWidth={1.5} />
                  </button>
                  <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 w-56">
                    <div className="bg-white border border-stone shadow-lg">
                      <div className="p-4 border-b border-stone bg-bone">
                        <p className="font-serif text-base text-ink">{user?.name}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate">{user?.email}</p>
                      </div>
                      <div className="py-2">
                        <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 text-xs uppercase tracking-[0.15em] hover:bg-bone hover:text-cuero">
                          <ShoppingBag size={14} strokeWidth={1.5} /> Mis pedidos
                        </Link>
                        <Link href="/wishlist" className="flex items-center gap-3 px-4 py-2.5 text-xs uppercase tracking-[0.15em] hover:bg-bone hover:text-cuero">
                          <Heart size={14} strokeWidth={1.5} /> Favoritos
                        </Link>
                        {user?.role === 'admin' && (
                          <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-xs uppercase tracking-[0.15em] hover:bg-bone hover:text-cuero">
                            <LayoutDashboard size={14} strokeWidth={1.5} /> Panel Admin
                          </Link>
                        )}
                        <button onClick={logout} className="flex items-center gap-3 px-4 py-2.5 text-xs uppercase tracking-[0.15em] hover:bg-bone w-full text-left text-wine">
                          <LogOut size={14} strokeWidth={1.5} /> Cerrar sesión
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href="/auth/login" className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-[0.18em] hover:text-cuero transition-colors">
                  <User size={18} strokeWidth={1.5} />
                  <span className="hidden lg:inline">Ingresar</span>
                </Link>
              )}

              <Link href="/wishlist" className="relative p-2 hover:text-cuero transition-colors hidden sm:block" aria-label="Favoritos">
                <Heart size={20} strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-cuero text-white text-[9px] w-4 h-4 flex items-center justify-center font-medium">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              <Link href="/cart" className="relative p-2 hover:text-cuero transition-colors" aria-label="Carrito">
                <ShoppingBag size={20} strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-cuero text-white text-[9px] w-4 h-4 flex items-center justify-center font-medium">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Subnav: categorías horizontales con MEGA MENÚ (desktop) ─── */}
      <div
        className="hidden md:block border-b border-stone bg-white relative"
        onMouseLeave={() => setHoveredItem(null)}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-10 h-11">
          <Link
            href="/catalog"
            className="text-[11px] uppercase tracking-[0.22em] text-ink hover:text-cuero transition-colors"
            onMouseEnter={() => setHoveredItem(null)}
          >
            Todos
          </Link>
          {NAV.map(item => (
            <div key={item.name} onMouseEnter={() => setHoveredItem(item.name)}>
              <Link
                href={item.href}
                className={`text-[11px] uppercase tracking-[0.22em] transition-colors flex items-center h-11 ${
                  item.highlight
                    ? 'text-cuero hover:text-cognac'
                    : hoveredItem === item.name ? 'text-cuero' : 'text-ink hover:text-cuero'
                }`}
              >
                {item.name}
              </Link>
            </div>
          ))}
          <Link
            href="/catalog?sortBy=createdAt&sortOrder=DESC"
            className="text-[11px] uppercase tracking-[0.22em] text-cognac hover:text-cuero transition-colors"
            onMouseEnter={() => setHoveredItem(null)}
          >
            Nuevo
          </Link>
        </nav>

        {/* ─── MEGA MENÚ panel ─── */}
        {activeItem && activeItem.blocks && (
          <div
            className="absolute top-full left-0 right-0 bg-white border-b border-stone shadow-lg z-40"
            onMouseEnter={() => setHoveredItem(activeItem.name)}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-12 gap-10">
              {activeItem.blocks.map(block => (
                <div key={block.title} className="col-span-3">
                  <p className="label-eyebrow mb-5">{block.title}</p>
                  <ul className="space-y-2.5">
                    {block.links.map(l => (
                      <li key={l.label}>
                        <Link
                          href={l.href}
                          className="text-sm text-gray-600 hover:text-cuero hover:translate-x-1 inline-block transition-all link-underline"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Feature destacada */}
              {activeItem.feature && (
                <Link
                  href={activeItem.feature.href}
                  className="col-span-6 group flex items-center gap-6 bg-bone p-6 hover:bg-stone transition-colors"
                >
                  <div className="relative w-40 h-40 flex-shrink-0">
                    <Image
                      src={activeItem.feature.img}
                      alt={activeItem.feature.title}
                      fill
                      sizes="160px"
                      className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div>
                    <p className="label-eyebrow mb-2">Destacado</p>
                    <p className="font-serif text-2xl text-ink mb-1">{activeItem.feature.title}</p>
                    <p className="text-sm text-gray-500 mb-4 font-light">{activeItem.feature.subtitle}</p>
                    <span className="text-[11px] uppercase tracking-[0.22em] text-cuero inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                      Ver producto <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Search overlay ─── */}
      {searchOpen && (
        <div className="absolute top-full inset-x-0 bg-white border-b border-stone shadow-lg">
          <div className="max-w-3xl mx-auto px-4 py-6">
            <form onSubmit={submitSearch} className="flex items-center gap-3 border-b-2 border-ink pb-3">
              <Search size={20} strokeWidth={1.5} className="text-gray-400" />
              <input
                ref={inputRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Buscar por nombre, color o estilo..."
                className="flex-1 text-base outline-none bg-transparent placeholder:text-gray-400 placeholder:font-light"
              />
              <button
                type="button"
                onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                className="p-1 hover:text-cuero"
                aria-label="Cerrar"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="mt-5 space-y-1 max-h-80 overflow-y-auto">
                <p className="label-eyebrow mb-3">Sugerencias</p>
                {suggestions.map((p: any) => {
                  const img = p.images?.find((i: any) => i.isPrimary)?.url ?? p.images?.[0]?.url;
                  return (
                    <Link
                      key={p.id}
                      href={`/product/${p.slug ?? p.id}`}
                      className="flex items-center gap-4 p-3 hover:bg-bone group transition-colors"
                      onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                    >
                      {img && (
                        <div className="relative w-14 h-14 bg-bone overflow-hidden flex-shrink-0">
                          <Image src={img} alt={p.name} fill sizes="56px" className="object-contain p-1" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-gray-400 uppercase tracking-[0.18em]">{p.brand?.name}</p>
                        <p className="text-sm text-ink truncate">{p.name}</p>
                      </div>
                      <p className="text-sm font-medium text-ink">
                        ${Number(p.salePrice ?? p.price).toLocaleString('es-CO')}
                      </p>
                    </Link>
                  );
                })}
                <button
                  type="button"
                  onClick={submitSearch}
                  className="w-full mt-3 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-cuero hover:text-cognac py-3"
                >
                  Ver todos los resultados →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Mobile drawer ─── */}
      {isMenuOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMenuOpen(false)} />
          <div className="md:hidden fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-stone bg-bone">
              <Image src="/druts/logo.png" alt="DRUTS" width={120} height={48} className="h-10 w-auto object-contain" />
              <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:text-cuero">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="py-3">
                <p className="px-4 py-2 label-eyebrow">Categorías</p>
                <Link href="/catalog" className="flex items-center justify-between px-4 py-3 text-sm uppercase tracking-[0.18em] hover:bg-bone hover:text-cuero">
                  Todos
                  <ChevronRight size={14} strokeWidth={1.5} />
                </Link>
                {NAV.map(item => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between px-4 py-3 text-sm uppercase tracking-[0.18em] hover:bg-bone hover:text-cuero ${
                      item.highlight ? 'text-cuero' : ''
                    }`}
                  >
                    {item.name}
                    <ChevronRight size={14} strokeWidth={1.5} />
                  </Link>
                ))}
                <Link href="/catalog?sortBy=createdAt&sortOrder=DESC" className="flex items-center justify-between px-4 py-3 text-sm uppercase tracking-[0.18em] text-cognac hover:bg-bone">
                  Novedades
                  <ChevronRight size={14} strokeWidth={1.5} />
                </Link>
              </div>
              <div className="border-t border-stone py-3">
                <p className="px-4 py-2 label-eyebrow">Cuenta</p>
                <Link href="/wishlist" className="flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-[0.15em] hover:bg-bone">
                  <Heart size={16} strokeWidth={1.5} /> Favoritos
                  {wishlistCount > 0 && <span className="ml-auto text-[10px] bg-cuero text-white px-2 py-0.5">{wishlistCount}</span>}
                </Link>
                <Link href="/cart" className="flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-[0.15em] hover:bg-bone">
                  <ShoppingBag size={16} strokeWidth={1.5} /> Carrito
                  {itemCount > 0 && <span className="ml-auto text-[10px] bg-cuero text-white px-2 py-0.5">{itemCount}</span>}
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link href="/orders" className="flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-[0.15em] hover:bg-bone">
                      <ShoppingBag size={16} strokeWidth={1.5} /> Mis pedidos
                    </Link>
                    {user?.role === 'admin' && (
                      <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-[0.15em] hover:bg-bone">
                        <LayoutDashboard size={16} strokeWidth={1.5} /> Panel Admin
                      </Link>
                    )}
                    <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-[0.15em] w-full text-left text-wine hover:bg-bone">
                      <LogOut size={16} strokeWidth={1.5} /> Cerrar sesión
                    </button>
                  </>
                ) : (
                  <Link href="/auth/login" className="flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-[0.15em] hover:bg-bone">
                    <User size={16} strokeWidth={1.5} /> Iniciar sesión
                  </Link>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-stone bg-bone text-center">
              <p className="text-[10px] uppercase tracking-[0.22em] text-cuero">+57 300 123 4567</p>
              <p className="text-[10px] tracking-[0.05em] text-gray-500 mt-1">Atención lun—sáb 8am—7pm</p>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
