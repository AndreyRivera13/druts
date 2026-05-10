'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Trash2, Copy, X, Tag, Percent, DollarSign, Calendar,
  CheckCircle2, AlertCircle, XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { couponsApi } from '@/services/api';
import { clsx } from 'clsx';

type DiscountType = 'percentage' | 'fixed';

interface CouponForm {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  minimumPurchase: string;
  maximumDiscount: string;
  maxUsages: string;
  perUserLimit: string;
  expiresAt: string;
  isActive: boolean;
}

const emptyForm: CouponForm = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  minimumPurchase: '',
  maximumDiscount: '',
  maxUsages: '',
  perUserLimit: '',
  expiresAt: '',
  isActive: true,
};

export default function CouponsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CouponForm>(emptyForm);

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: couponsApi.getAll,
  });

  const createMut = useMutation({
    mutationFn: (data: any) => couponsApi.create(data),
    onSuccess: () => {
      toast.success('Cupón creado correctamente');
      qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      setShowModal(false);
      setForm(emptyForm);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Error al crear cupón');
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => couponsApi.delete(id),
    onSuccess: () => {
      toast.success('Cupón eliminado');
      qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
    onError: () => toast.error('No se pudo eliminar'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.discountValue) {
      toast.error('Código y valor del descuento son requeridos');
      return;
    }
    const payload: any = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || undefined,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      isActive: form.isActive,
    };
    if (form.minimumPurchase) payload.minimumPurchase = Number(form.minimumPurchase);
    if (form.maximumDiscount) payload.maximumDiscount = Number(form.maximumDiscount);
    if (form.maxUsages) payload.maxUsages = Number(form.maxUsages);
    if (form.perUserLimit) payload.perUserLimit = Number(form.perUserLimit);
    if (form.expiresAt) payload.expiresAt = new Date(form.expiresAt).toISOString();
    createMut.mutate(payload);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copiado: ${code}`);
  };

  const status = (c: any) => {
    if (!c.isActive) return { label: 'Inactivo', cls: 'bg-gray-100 text-gray-600', icon: XCircle };
    if (c.expiresAt && new Date(c.expiresAt) < new Date())
      return { label: 'Expirado', cls: 'bg-red-100 text-red-700', icon: AlertCircle };
    if (c.maxUsages && c.usageCount >= c.maxUsages)
      return { label: 'Agotado', cls: 'bg-amber-100 text-amber-700', icon: AlertCircle };
    return { label: 'Activo', cls: 'bg-green-100 text-green-700', icon: CheckCircle2 };
  };

  const list: any[] = coupons ?? [];
  const active = list.filter(c => status(c).label === 'Activo').length;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cupones</h1>
          <p className="text-gray-500 mt-1">{list.length} cupones · {active} activos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm rounded-xl transition-colors"
        >
          <Plus size={16} /> Nuevo cupón
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total" value={list.length} icon={<Tag size={20} className="text-blue-500" />} />
        <StatCard label="Activos" value={active} icon={<CheckCircle2 size={20} className="text-green-500" />} />
        <StatCard
          label="Usos totales"
          value={list.reduce((acc, c) => acc + Number(c.usageCount ?? 0), 0)}
          icon={<Percent size={20} className="text-purple-500" />}
        />
        <StatCard
          label="Por expirar"
          value={list.filter(c => {
            if (!c.expiresAt) return false;
            const days = (new Date(c.expiresAt).getTime() - Date.now()) / 86400000;
            return days > 0 && days <= 7;
          }).length}
          icon={<Calendar size={20} className="text-amber-500" />}
        />
      </div>

      {/* Grid */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Cargando…</div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-5xl mb-4">🎟️</p>
            <p className="font-bold text-lg text-gray-900 mb-1">Sin cupones</p>
            <p className="text-gray-500 text-sm mb-6">Crea tu primer cupón para empezar a ofrecer descuentos.</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm rounded-xl"
            >
              Crear cupón
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 font-medium">Código</th>
                  <th className="px-6 py-3 font-medium">Descripción</th>
                  <th className="px-6 py-3 font-medium">Descuento</th>
                  <th className="px-6 py-3 font-medium">Mín. compra</th>
                  <th className="px-6 py-3 font-medium">Usos</th>
                  <th className="px-6 py-3 font-medium">Vence</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                  <th className="px-6 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {list.map(c => {
                  const s = status(c);
                  const Icon = s.icon;
                  return (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => copyCode(c.code)}
                          className="font-mono font-bold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1.5"
                        >
                          {c.code} <Copy size={11} className="opacity-40" />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{c.description ?? '—'}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {c.discountType === 'percentage'
                          ? `${Number(c.discountValue)}%`
                          : `$${Number(c.discountValue).toLocaleString('es-CO')}`}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {c.minimumPurchase
                          ? `$${Number(c.minimumPurchase).toLocaleString('es-CO')}`
                          : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700 font-medium">{c.usageCount ?? 0}</span>
                        {c.maxUsages && <span className="text-gray-400"> / {c.maxUsages}</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        {c.expiresAt
                          ? new Date(c.expiresAt).toLocaleDateString('es-CO')
                          : 'Sin vencimiento'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide', s.cls)}>
                          <Icon size={11} /> {s.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar el cupón "${c.code}"?`)) deleteMut.mutate(c.id);
                          }}
                          className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg text-gray-400 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <CouponModal
          form={form}
          setForm={setForm}
          onClose={() => { setShowModal(false); setForm(emptyForm); }}
          onSubmit={handleSubmit}
          loading={createMut.isPending}
        />
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

function CouponModal({
  form, setForm, onClose, onSubmit, loading,
}: {
  form: CouponForm;
  setForm: (f: CouponForm) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}) {
  const set = <K extends keyof CouponForm>(k: K, v: CouponForm[K]) => setForm({ ...form, [k]: v });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl my-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-900">Nuevo cupón</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Código *" required>
              <input
                value={form.code}
                onChange={e => set('code', e.target.value.toUpperCase())}
                placeholder="EJ. DRUTS25"
                className="w-full px-4 py-2.5 text-sm font-mono uppercase border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400"
                maxLength={30}
              />
            </Field>
            <Field label="Tipo de descuento *">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => set('discountType', 'percentage')}
                  className={clsx(
                    'flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium border rounded-xl transition-all',
                    form.discountType === 'percentage'
                      ? 'bg-primary-50 border-primary-400 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300',
                  )}
                >
                  <Percent size={14} /> Porcentaje
                </button>
                <button
                  type="button"
                  onClick={() => set('discountType', 'fixed')}
                  className={clsx(
                    'flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium border rounded-xl transition-all',
                    form.discountType === 'fixed'
                      ? 'bg-primary-50 border-primary-400 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300',
                  )}
                >
                  <DollarSign size={14} /> Fijo
                </button>
              </div>
            </Field>
          </div>

          <Field label="Descripción">
            <input
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Ej. Descuento de bienvenida"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400"
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={`Valor del descuento * ${form.discountType === 'percentage' ? '(%)' : '(COP)'}`} required>
              <input
                type="number"
                step="0.01"
                value={form.discountValue}
                onChange={e => set('discountValue', e.target.value)}
                placeholder={form.discountType === 'percentage' ? '10' : '50000'}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400"
              />
            </Field>
            <Field label="Compra mínima (COP)">
              <input
                type="number"
                value={form.minimumPurchase}
                onChange={e => set('minimumPurchase', e.target.value)}
                placeholder="100000"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400"
              />
            </Field>
          </div>

          {form.discountType === 'percentage' && (
            <Field label="Descuento máximo (COP)">
              <input
                type="number"
                value={form.maximumDiscount}
                onChange={e => set('maximumDiscount', e.target.value)}
                placeholder="200000"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400"
              />
            </Field>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Usos máximos">
              <input
                type="number"
                value={form.maxUsages}
                onChange={e => set('maxUsages', e.target.value)}
                placeholder="100"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400"
              />
            </Field>
            <Field label="Límite por usuario">
              <input
                type="number"
                value={form.perUserLimit}
                onChange={e => set('perUserLimit', e.target.value)}
                placeholder="1"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400"
              />
            </Field>
            <Field label="Vence el">
              <input
                type="date"
                value={form.expiresAt}
                onChange={e => set('expiresAt', e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400"
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={e => set('isActive', e.target.checked)}
              className="w-4 h-4 accent-primary-600"
            />
            Cupón activo desde su creación
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl"
            >
              {loading ? 'Creando…' : 'Crear cupón'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
