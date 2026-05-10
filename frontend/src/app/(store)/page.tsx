'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ArrowRight, Truck, ShieldCheck, RefreshCw, Award, Tag, Copy, Check } from 'lucide-react';
import { productsApi, categoriesApi, brandsApi } from '@/services/api';
import ProductCard from '@/components/ui/ProductCard';
import toast from 'react-hot-toast';

export default function HomePage() {
  const { data: featured } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productsApi.getFeatured(8),
  });
  const { data: bestSellers } = useQuery({
    queryKey: ['products', 'best-sellers'],
    queryFn: () => productsApi.getBestSellers(4),
  });
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  return (
    <div className="bg-white">
      {/* ════════════════════ HERO EDITORIAL (split) ════════════════════ */}
      <section className="grid md:grid-cols-2 min-h-[78vh] items-stretch border-b border-stone">
        {/* Texto */}
        <div className="bg-bone flex items-center px-6 sm:px-12 lg:px-20 py-20 md:py-0">
          <div className="max-w-md">
            <p className="label-eyebrow mb-5">Colección 2026</p>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6 text-ink">
              El cuero<br />
              <em className="text-cuero not-italic">que perdura</em>.
            </h1>
            <p className="text-base md:text-lg text-gray-600 mb-9 max-w-md leading-relaxed font-light">
              Marroquinería artesanal colombiana. Sneakers y botas de cuero
              full grain hechos a mano, pensados para envejecer con tu historia.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/catalog" className="btn-primary inline-flex items-center gap-2 group">
                Comprar ahora
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/catalog?category=botas"
                className="btn-secondary"
              >
                Ver chukkas
              </Link>
            </div>
          </div>
        </div>
        {/* Producto destacado */}
        <div className="relative bg-stone min-h-[60vh] md:min-h-0 flex items-center justify-center p-8 md:p-12">
          <Image
            src="/druts/chukka-camel-1.png"
            alt="Bota Chukka Camel DRUTS"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain p-8 md:p-16"
          />
          <div className="absolute bottom-6 right-6 hidden md:block text-right">
            <p className="text-[10px] tracking-[0.28em] uppercase mb-1 text-cuero">Editorial</p>
            <p className="font-serif text-xl text-ink">Sahara Chukka</p>
            <p className="text-xs text-gray-500">Camel · Cuero full grain</p>
          </div>
        </div>
      </section>

      {/* ════════════════════ TRUST BAR ════════════════════ */}
      <section className="bg-white border-b border-stone">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-stone">
            {[
              { icon: Truck,        title: 'Envío gratis',     desc: 'En compras +$300K' },
              { icon: ShieldCheck,  title: 'Pago seguro',      desc: '100% protegido' },
              { icon: RefreshCw,    title: 'Cambios fáciles',  desc: '15 días sin costo' },
              { icon: Award,        title: 'Cuero genuino',    desc: 'Hecho a mano en Colombia' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-3 sm:px-6 py-6">
                <item.icon size={22} strokeWidth={1.3} className="text-cuero flex-shrink-0" />
                <div>
                  <p className="text-[11px] tracking-[0.18em] uppercase text-ink">{item.title}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 font-light">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ CATEGORÍAS ════════════════════ */}
      {categories && categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center mb-12">
            <p className="label-eyebrow mb-3">Explorar</p>
            <h2 className="font-serif text-4xl md:text-5xl">Categorías</h2>
            <div className="w-16 h-px bg-cuero mx-auto mt-5" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
            {categories.slice(0, 5).map((cat: any, i: number) => (
              <CategoryTile key={cat.id} category={cat} large={i === 0} />
            ))}
          </div>
        </section>
      )}

      {/* ════════════════════ BANNER EDITORIAL DOBLE ════════════════════ */}
      <section className="grid md:grid-cols-2">
        <DualBannerCard
          eyebrow="Recién llegados"
          title="Sneakers Cuero"
          subtitle="Diseño limpio, comodidad todo el día"
          cta="Comprar sneakers"
          href="/catalog?category=sneakers"
          img="/druts/sneaker-navy-1.png"
          bg="bg-stone"
          dark={false}
        />
        <DualBannerCard
          eyebrow="Edición premium"
          title="Chukka Camel"
          subtitle="Cuero full grain · suela crepe natural"
          cta="Ver chukkas"
          href="/catalog?category=botas"
          img="/druts/chukka-camel-1.png"
          bg="bg-ink"
          dark={true}
        />
      </section>

      {/* ════════════════════ DESTACADOS ════════════════════ */}
      {featured && featured.length > 0 && (
        <section className="bg-bone py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="label-eyebrow mb-3">Curaduría</p>
                <h2 className="font-serif text-4xl md:text-5xl">Destacados</h2>
                <div className="w-16 h-px bg-cuero mt-5" />
              </div>
              <Link href="/catalog?featured=true" className="hidden sm:flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-cuero hover:text-cognac group">
                Ver todo
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {featured.slice(0, 4).map((p: any, i: number) => (
                <ProductCard key={p.id} product={p} priority={i < 4} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════ EDITORIAL SPLIT (cuero) ════════════════════ */}
      <section className="grid md:grid-cols-2 min-h-[80vh]">
        <div className="relative bg-stone min-h-[60vh] md:min-h-0 flex items-center justify-center">
          <Image
            src="/druts/sneaker-navy-1.png"
            alt="Sneaker Marino DRUTS"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain p-10 md:p-20"
          />
        </div>
        <div className="bg-ink text-white flex items-center px-6 sm:px-12 lg:px-20 py-20 md:py-0">
          <div className="max-w-md">
            <p className="label-eyebrow text-gold mb-4">Manufactura</p>
            <h2 className="font-serif text-4xl md:text-5xl mb-6 leading-tight">
              Cuero seleccionado.<br />Cosido a mano.
            </h2>
            <p className="text-white/70 text-base leading-relaxed mb-8 font-light">
              Cada par DRUTS pasa por las manos de artesanos colombianos. Usamos cuero
              full grain seleccionado, suelas de goma natural y costuras dobles que duran décadas.
              No fabricamos sneakers desechables.
            </p>
            <div className="space-y-4 mb-9">
              {[
                'Cuero full grain colombiano',
                'Construcción Goodyear-welt en botas',
                'Garantía estructural de 2 años',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-gold flex-shrink-0" />
                  <p className="text-sm font-light">{item}</p>
                </div>
              ))}
            </div>
            <Link href="/catalog?category=premium" className="btn-cuero inline-flex items-center gap-2 group">
              Ver línea Premium
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════ SOBRE DRUTS (historia de marca) ════════════════════ */}
      <section className="bg-white py-24 md:py-32 border-b border-stone">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Image
            src="/druts/logo.png"
            alt="DRUTS"
            width={200}
            height={80}
            className="h-20 w-auto object-contain mx-auto mb-10 opacity-90"
          />
          <p className="label-eyebrow mb-5">Sobre la marca</p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-ink leading-[1.1] mb-8">
            Cuero noble.<br />
            <em className="text-cuero not-italic">Diseño atemporal.</em>
          </h2>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed font-light max-w-2xl mx-auto mb-10">
            Nacimos en Cúcuta con una idea simple: hacer calzado para hombre que envejezca con dignidad.
            Trabajamos con curtidores colombianos que llevan generaciones perfeccionando el oficio,
            seleccionamos solo cuero full grain de primera calidad, y cosemos a mano cada par
            con la paciencia que el oficio exige.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mt-14 mb-12 text-left max-w-3xl mx-auto">
            {[
              { num: '100%', title: 'Cuero genuino', desc: 'Full grain colombiano seleccionado a mano.' },
              { num: '7+',   title: 'Años de oficio',  desc: 'Artesanos con décadas perfeccionando el detalle.' },
              { num: '2 años', title: 'Garantía', desc: 'En la estructura y suelas de cada par.' },
            ].map(s => (
              <div key={s.title} className="border-l border-stone pl-5">
                <p className="font-serif text-3xl text-cuero mb-2">{s.num}</p>
                <p className="text-[11px] uppercase tracking-[0.22em] text-ink mb-1.5">{s.title}</p>
                <p className="text-sm text-gray-500 font-light leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <Link href="/catalog" className="btn-secondary inline-flex items-center gap-2 group">
            Conocer toda la colección
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ════════════════════ MÁS VENDIDOS ════════════════════ */}
      {bestSellers && bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="label-eyebrow mb-3">Top ventas</p>
              <h2 className="font-serif text-4xl md:text-5xl">Los más amados</h2>
              <div className="w-16 h-px bg-cuero mt-5" />
            </div>
            <Link href="/catalog?sortBy=totalSold" className="hidden sm:flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-cuero hover:text-cognac group">
              Ver todo
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {bestSellers.map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ════════════════════ PROMOS ════════════════════ */}
      <PromoSection />

      {/* ════════════════════ INSTAGRAM-STYLE ════════════════════ */}
      <section className="bg-bone py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="label-eyebrow mb-3">@druts.co</p>
          <h3 className="font-serif text-3xl mb-2">Síguenos en Instagram</h3>
          <p className="text-sm text-gray-500 mb-10 max-w-md mx-auto">
            Inspiración diaria, looks de la comunidad y los drops más esperados.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {[
              { src: '/druts/sneaker-navy-1.png',   bg: 'bg-stone' },
              { src: '/druts/chukka-camel-1.png',   bg: 'bg-bone' },
              { src: '/druts/sneaker-chocolate.png', bg: 'bg-stone' },
              { src: '/druts/sneaker-navy-2.png',   bg: 'bg-bone' },
            ].map((it, i) => (
              <a
                key={i}
                href="#"
                className={`relative aspect-square overflow-hidden ${it.bg} group`}
              >
                <Image
                  src={it.src}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-contain p-6 transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════

function CategoryTile({ category, large = false }: { category: any; large?: boolean }) {
  // Mapeo de fotos por slug — usa nuestras fotos reales
  const images: Record<string, { src: string; bg: string }> = {
    'sneakers':  { src: '/druts/sneaker-navy-1.png',    bg: 'bg-stone' },
    'botas':     { src: '/druts/chukka-camel-1.png',    bg: 'bg-bone'  },
    'casuales':  { src: '/druts/sneaker-chocolate.png', bg: 'bg-stone' },
    'premium':   { src: '/druts/chukka-camel-2.png',    bg: 'bg-sand'  },
    'lifestyle': { src: '/druts/sneaker-navy-2.png',    bg: 'bg-bone'  },
  };
  const conf = images[category.slug] ?? images['sneakers'];

  return (
    <Link
      href={`/catalog?categoryId=${category.id}`}
      className={`group relative overflow-hidden ${conf.bg} ${large ? 'md:row-span-2 aspect-square md:aspect-auto' : 'aspect-[4/5]'}`}
    >
      <Image
        src={conf.src}
        alt={category.name}
        fill
        sizes={large ? '(max-width: 768px) 50vw, 50vw' : '(max-width: 768px) 50vw, 33vw'}
        className="object-contain p-8 md:p-12 transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute bottom-0 inset-x-0 p-5 md:p-7 bg-gradient-to-t from-white via-white/80 to-transparent">
        <p className="font-serif text-2xl md:text-3xl text-ink mb-2">{category.name}</p>
        <p className="text-[11px] uppercase tracking-[0.22em] text-cuero inline-flex items-center gap-2 group-hover:gap-3 transition-all">
          Comprar <ArrowRight size={12} />
        </p>
      </div>
    </Link>
  );
}

function DualBannerCard({
  eyebrow, title, subtitle, cta, href, img, bg, dark,
}: {
  eyebrow: string; title: string; subtitle: string;
  cta: string; href: string; img: string;
  bg: string; dark: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden ${bg} aspect-[4/3] md:aspect-[4/3] flex items-end`}
    >
      <Image
        src={img}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-contain p-12 md:p-20 transition-transform duration-700 group-hover:scale-105"
      />
      <div className={`relative z-10 p-8 md:p-12 lg:p-16 max-w-md ${dark ? 'text-white' : 'text-ink'}`}>
        <p className={`label-eyebrow mb-3 ${dark ? 'text-gold' : ''}`}>{eyebrow}</p>
        <h3 className="font-serif text-3xl md:text-4xl mb-2 leading-tight">{title}</h3>
        <p className={`text-sm font-light mb-5 ${dark ? 'text-white/70' : 'text-gray-600'}`}>{subtitle}</p>
        <span className={`text-[11px] uppercase tracking-[0.22em] inline-flex items-center gap-2 group-hover:gap-3 transition-all ${
          dark ? 'text-gold' : 'text-cuero'
        }`}>
          {cta} <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}

function PromoSection() {
  const [copied, setCopied] = useState<string | null>(null);
  const promos = [
    { code: 'BIENVENIDO10', desc: '10% en tu primera compra' },
    { code: 'DRUTS25',      desc: '$25.000 OFF en compras +$300.000' },
    { code: 'CUERO20',      desc: '20% en toda la línea Premium — 7 días' },
  ];
  const copy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopied(code);
    toast.success(`Cupón ${code} copiado`);
    setTimeout(() => setCopied(null), 2000);
  };
  return (
    <section className="bg-stone py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="label-eyebrow mb-3">Beneficios</p>
          <h3 className="font-serif text-3xl md:text-4xl">Cupones activos</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {promos.map(p => (
            <button
              key={p.code}
              onClick={() => copy(p.code)}
              className="group bg-white hover:bg-ink hover:text-white transition-all p-7 text-left border border-stone hover:border-ink"
            >
              <div className="flex items-center gap-3 mb-3">
                <Tag size={16} strokeWidth={1.5} className="text-cuero group-hover:text-gold" />
                <p className="font-serif text-xl">{p.code}</p>
                {copied === p.code
                  ? <Check size={14} className="ml-auto text-emerald-500" />
                  : <Copy size={12} className="ml-auto opacity-30 group-hover:opacity-100" />
                }
              </div>
              <p className="text-sm font-light leading-relaxed">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
