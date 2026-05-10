'use client';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X, Check, ChevronDown } from 'lucide-react';
import { productsApi, categoriesApi, brandsApi } from '@/services/api';
import ProductCard from '@/components/ui/ProductCard';
import { clsx } from 'clsx';

const PRICE_BUCKETS = [
  { label: 'Hasta $250.000',         min: 0,      max: 250000 },
  { label: '$250.000 — $350.000',    min: 250000, max: 350000 },
  { label: '$350.000 — $450.000',    min: 350000, max: 450000 },
  { label: 'Más de $450.000',        min: 450000, max: 0      },
];

const SORT_OPTIONS = [
  { value: 'createdAt-DESC',  label: 'Recientes' },
  { value: 'totalSold-DESC',  label: 'Más vendidos' },
  { value: 'rating-DESC',     label: 'Mejor valorados' },
  { value: 'price-ASC',       label: 'Precio: menor a mayor' },
  { value: 'price-DESC',      label: 'Precio: mayor a menor' },
];

export default function CatalogPage() {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogContent />
    </Suspense>
  );
}

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const slugFromUrl = searchParams.get('category');
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.getAll });
  const { data: brands } = useQuery({ queryKey: ['brands'], queryFn: brandsApi.getAll });

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('categoryId') || '',
    brandId: searchParams.get('brandId') || '',
    gender: searchParams.get('gender') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'DESC',
    page: 1,
    limit: 12,
  });

  useEffect(() => {
    if (slugFromUrl && categories && !filters.categoryId) {
      const cat = categories.find((c: any) => c.slug === slugFromUrl);
      if (cat) setFilters(f => ({ ...f, categoryId: cat.id }));
    }
  }, [categories, slugFromUrl]);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.getAll(
      Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)),
    ),
  });

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '', categoryId: '', brandId: '', gender: '',
      minPrice: '', maxPrice: '', sortBy: 'createdAt', sortOrder: 'DESC',
      page: 1, limit: 12,
    });
    router.replace('/catalog');
  };

  const activeFiltersCount = [
    filters.categoryId, filters.brandId, filters.gender, filters.minPrice, filters.maxPrice,
  ].filter(Boolean).length;

  const activeCategory = categories?.find((c: any) => c.id === filters.categoryId);
  const activeBrand = brands?.find((b: any) => b.id === filters.brandId);

  const title = activeCategory?.name || activeBrand?.name || (filters.search ? `Resultados: "${filters.search}"` : 'Todos los productos');

  return (
    <div className="bg-white">
      {/* ─── Encabezado ─── */}
      <div className="bg-bone border-b border-stone">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
          <p className="label-eyebrow mb-3">Catálogo</p>
          <h1 className="font-serif text-4xl md:text-5xl text-ink">{title}</h1>
          {products && (
            <p className="text-gray-500 mt-3 text-sm font-light">
              {products.total} {products.total === 1 ? 'producto' : 'productos'}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-[260px_1fr] gap-10">
        {/* ─── SIDEBAR (desktop) ─── */}
        <aside className="hidden lg:block">
          <FiltersPanel
            categories={categories ?? []}
            brands={brands ?? []}
            filters={filters}
            updateFilter={updateFilter}
            clearFilters={clearFilters}
            activeCount={activeFiltersCount}
          />
        </aside>

        {/* ─── PRODUCTS ─── */}
        <div>
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone">
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] border border-ink px-4 py-2.5 hover:bg-ink hover:text-white transition-all"
            >
              <SlidersHorizontal size={13} strokeWidth={1.5} />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="bg-cuero text-white text-[9px] w-4 h-4 flex items-center justify-center font-medium ml-1">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-3 ml-auto">
              <label className="text-[10px] uppercase tracking-[0.22em] text-gray-500 hidden sm:block">Ordenar</label>
              <div className="relative">
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={e => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                  }}
                  className="appearance-none bg-transparent border-b border-ink pl-1 pr-7 py-2 text-[11px] uppercase tracking-[0.18em] cursor-pointer focus:outline-none"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} strokeWidth={1.5} className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {(activeCategory || activeBrand || filters.gender || filters.minPrice || filters.maxPrice) && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {activeCategory && (
                <Chip onClear={() => updateFilter('categoryId', '')}>{activeCategory.name}</Chip>
              )}
              {activeBrand && (
                <Chip onClear={() => updateFilter('brandId', '')}>{activeBrand.name}</Chip>
              )}
              {filters.gender && (
                <Chip onClear={() => updateFilter('gender', '')}>
                  {{ M: 'Hombre', F: 'Mujer', U: 'Unisex', K: 'Niños' }[filters.gender as 'M']}
                </Chip>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <Chip onClear={() => { updateFilter('minPrice', ''); updateFilter('maxPrice', ''); }}>
                  {filters.minPrice ? `$${Number(filters.minPrice).toLocaleString('es-CO')}` : '$0'}
                  {' — '}
                  {filters.maxPrice ? `$${Number(filters.maxPrice).toLocaleString('es-CO')}` : '∞'}
                </Chip>
              )}
              <button
                onClick={clearFilters}
                className="text-[11px] uppercase tracking-[0.18em] text-cuero hover:text-cognac link-underline"
              >
                Limpiar todo
              </button>
            </div>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
              {Array(9).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] bg-stone" />
                  <div className="pt-4 space-y-2 text-center">
                    <div className="h-2 bg-stone w-1/3 mx-auto" />
                    <div className="h-3 bg-stone w-2/3 mx-auto" />
                    <div className="h-3 bg-stone w-1/4 mx-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : products?.data?.length === 0 ? (
            <div className="text-center py-24 border border-stone bg-bone">
              <p className="font-serif text-2xl mb-3">Sin resultados</p>
              <p className="text-gray-500 text-sm font-light mb-7">Prueba con otros filtros o explora otra categoría</p>
              <button onClick={clearFilters} className="btn-primary">
                Limpiar filtros
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
                {products?.data?.map((product: any, i: number) => (
                  <ProductCard key={product.id} product={product} priority={i < 4} />
                ))}
              </div>

              {/* Pagination */}
              {products && products.pages > 1 && (
                <div className="flex justify-center items-center gap-1 mt-16 pt-10 border-t border-stone">
                  <button
                    disabled={filters.page === 1}
                    onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                    className="px-4 py-2 text-[11px] uppercase tracking-[0.18em] hover:text-cuero disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ← Anterior
                  </button>
                  {Array.from({ length: products.pages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setFilters(prev => ({ ...prev, page: p }))}
                      className={clsx(
                        'w-10 h-10 text-xs transition-all border',
                        filters.page === p
                          ? 'bg-ink text-white border-ink'
                          : 'border-transparent hover:border-stone text-ink',
                      )}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    disabled={filters.page === products.pages}
                    onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                    className="px-4 py-2 text-[11px] uppercase tracking-[0.18em] hover:text-cuero disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ─── DRAWER mobile ─── */}
      {drawerOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setDrawerOpen(false)} />
          <div className="lg:hidden fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-stone bg-bone">
              <p className="font-serif text-lg">Filtros</p>
              <button onClick={() => setDrawerOpen(false)} className="p-2 hover:text-cuero">
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FiltersPanel
                categories={categories ?? []}
                brands={brands ?? []}
                filters={filters}
                updateFilter={updateFilter}
                clearFilters={clearFilters}
                activeCount={activeFiltersCount}
              />
            </div>
            <div className="p-4 border-t border-stone">
              <button onClick={() => setDrawerOpen(false)} className="btn-primary w-full">
                Ver {products?.total ?? 0} productos
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Sub-componentes ────────────────────────────────────────────────────────

function FiltersPanel({ categories, brands, filters, updateFilter, clearFilters, activeCount }: any) {
  return (
    <div className="space-y-8">
      {activeCount > 0 && (
        <button
          onClick={clearFilters}
          className="text-[11px] uppercase tracking-[0.18em] text-cuero hover:text-cognac flex items-center gap-1.5 link-underline"
        >
          <X size={12} strokeWidth={1.5} /> Limpiar filtros ({activeCount})
        </button>
      )}

      <FilterGroup title="Categoría">
        <CheckList options={[{ id: '', name: 'Todas' }, ...categories]} value={filters.categoryId} onChange={(v: any) => updateFilter('categoryId', v)} field="id" label="name" />
      </FilterGroup>

      <FilterGroup title="Marca">
        <CheckList options={[{ id: '', name: 'Todas' }, ...brands]} value={filters.brandId} onChange={(v: any) => updateFilter('brandId', v)} field="id" label="name" />
      </FilterGroup>

      <FilterGroup title="Género">
        <CheckList
          options={[
            { id: '', name: 'Todos' },
            { id: 'M', name: 'Hombre' },
            { id: 'F', name: 'Mujer' },
            { id: 'U', name: 'Unisex' },
            { id: 'K', name: 'Niños' },
          ]}
          value={filters.gender}
          onChange={(v: any) => updateFilter('gender', v)}
          field="id"
          label="name"
        />
      </FilterGroup>

      <FilterGroup title="Precio">
        <div className="space-y-1">
          {PRICE_BUCKETS.map(b => {
            const active = filters.minPrice == String(b.min) && (b.max ? filters.maxPrice == String(b.max) : !filters.maxPrice);
            return (
              <button
                key={b.label}
                onClick={() => {
                  updateFilter('minPrice', String(b.min));
                  updateFilter('maxPrice', b.max ? String(b.max) : '');
                }}
                className={clsx(
                  'w-full text-left text-sm py-1.5 flex items-center gap-2 transition-colors',
                  active ? 'text-ink font-medium' : 'text-gray-600 hover:text-cuero',
                )}
              >
                <span className={clsx(
                  'w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all',
                  active ? 'border-ink bg-ink' : 'border-gray-300',
                )}>
                  {active && <Check size={9} className="text-white" strokeWidth={2.5} />}
                </span>
                {b.label}
              </button>
            );
          })}
          <button
            onClick={() => { updateFilter('minPrice', ''); updateFilter('maxPrice', ''); }}
            className="text-[10px] uppercase tracking-[0.18em] text-gray-400 hover:text-cuero mt-2"
          >
            Quitar filtro
          </button>
        </div>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label-eyebrow mb-4 pb-3 border-b border-stone">{title}</p>
      {children}
    </div>
  );
}

function CheckList({ options, value, onChange, field, label }: any) {
  return (
    <div className="space-y-1">
      {options.map((opt: any) => {
        const active = value === opt[field];
        return (
          <button
            key={opt[field] || 'all'}
            onClick={() => onChange(opt[field])}
            className={clsx(
              'w-full text-left text-sm py-1.5 flex items-center gap-2 transition-colors',
              active ? 'text-ink font-medium' : 'text-gray-600 hover:text-cuero',
            )}
          >
            <span className={clsx(
              'w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all',
              active ? 'border-ink bg-ink' : 'border-gray-300',
            )}>
              {active && <Check size={9} className="text-white" strokeWidth={2.5} />}
            </span>
            {opt[label]}
          </button>
        );
      })}
    </div>
  );
}

function Chip({ children, onClear }: { children: React.ReactNode; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-bone border border-stone text-ink text-[11px] uppercase tracking-[0.12em] px-3 py-1.5">
      {children}
      <button onClick={onClear} className="hover:text-cuero transition-colors" aria-label="Quitar">
        <X size={11} strokeWidth={2} />
      </button>
    </span>
  );
}

function CatalogSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="h-10 w-64 bg-stone animate-pulse mx-auto mb-12" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[4/5] bg-stone" />
          </div>
        ))}
      </div>
    </div>
  );
}
