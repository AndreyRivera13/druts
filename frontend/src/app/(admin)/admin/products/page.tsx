'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { productsApi, categoriesApi, brandsApi } from '@/services/api';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

export default function AdminProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);

  const { data: products } = useQuery({
    queryKey: ['admin-products', search, page],
    queryFn: () => productsApi.getAll({ search, page, limit: 15 }),
  });

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.getAll });
  const { data: brands } = useQuery({ queryKey: ['brands'], queryFn: brandsApi.getAll });

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Producto desactivado'); },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 mt-1">{products?.total ?? 0} productos en el catálogo</p>
        </div>
        <button onClick={() => { setEditProduct(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-4 py-2 flex-1 max-w-md">
          <Search size={16} className="text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="outline-none text-sm w-full"
          />
        </div>
      </div>

      {/* Products table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left font-medium text-gray-600">Producto</th>
                <th className="px-6 py-4 text-left font-medium text-gray-600">Categoría</th>
                <th className="px-6 py-4 text-left font-medium text-gray-600">Precio</th>
                <th className="px-6 py-4 text-left font-medium text-gray-600">Stock Total</th>
                <th className="px-6 py-4 text-left font-medium text-gray-600">Vendidos</th>
                <th className="px-6 py-4 text-left font-medium text-gray-600">Estado</th>
                <th className="px-6 py-4 text-left font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products?.data?.map((product: any) => {
                const primaryImage = product.images?.find((i: any) => i.isPrimary)?.url ?? product.images?.[0]?.url;
                return (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 relative">
                          {primaryImage && (
                            <Image src={primaryImage} alt={product.name} fill className="object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.brand?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{product.category?.name}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold">${Number(product.price).toLocaleString('es-CO')}</p>
                      {product.salePrice && (
                        <p className="text-xs text-green-600">Oferta: ${Number(product.salePrice).toLocaleString('es-CO')}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        'font-semibold',
                        product.totalStock === 0 ? 'text-red-600' : product.totalStock <= 5 ? 'text-orange-600' : 'text-gray-900',
                      )}>
                        {product.totalStock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{product.totalSold}</td>
                    <td className="px-6 py-4">
                      <span className={clsx('badge', product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>
                        {product.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditProduct(product); setShowForm(true); }}
                          className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(product.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {products && products.pages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100">
            <p className="text-sm text-gray-500">Página {page} de {products.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50">Anterior</button>
              <button onClick={() => setPage(p => Math.min(products.pages, p + 1))} disabled={page === products.pages} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50">Siguiente</button>
            </div>
          </div>
        )}
      </div>

      {/* Product form modal */}
      {showForm && (
        <ProductFormModal
          product={editProduct}
          categories={categories || []}
          brands={brands || []}
          onClose={() => setShowForm(false)}
          onSave={() => { qc.invalidateQueries({ queryKey: ['admin-products'] }); setShowForm(false); }}
        />
      )}
    </div>
  );
}

function ProductFormModal({ product, categories, brands, onClose, onSave }: any) {
  const [form, setForm] = useState(product || { name: '', price: '', categoryId: '', brandId: '', gender: 'U', description: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (product) {
        await productsApi.update(product.id, form);
        toast.success('Producto actualizado');
      } else {
        await productsApi.create({ ...form, variants: [] });
        toast.success('Producto creado');
      }
      onSave();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">{product ? 'Editar' : 'Nuevo'} Producto</h2>
        <div className="space-y-4">
          {[
            { key: 'name', label: 'Nombre', type: 'text', placeholder: 'Nike Air Max 270' },
            { key: 'price', label: 'Precio', type: 'number', placeholder: '280000' },
            { key: 'salePrice', label: 'Precio oferta (opcional)', type: 'number', placeholder: '220000' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} value={form[f.key] || ''} onChange={e => setForm((p: any) => ({ ...p, [f.key]: e.target.value }))} className="input" placeholder={f.placeholder} />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select value={form.categoryId} onChange={e => setForm((p: any) => ({ ...p, categoryId: e.target.value }))} className="input">
              <option value="">Seleccionar</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
            <select value={form.brandId} onChange={e => setForm((p: any) => ({ ...p, brandId: e.target.value }))} className="input">
              <option value="">Seleccionar</option>
              {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
            <select value={form.gender} onChange={e => setForm((p: any) => ({ ...p, gender: e.target.value }))} className="input">
              <option value="U">Unisex</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="K">Niños</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={form.description || ''} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))} className="input" rows={3} />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
