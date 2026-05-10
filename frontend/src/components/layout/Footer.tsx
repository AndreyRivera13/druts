'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Instagram, Facebook, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success('¡Gracias por suscribirte!');
    setEmail('');
  };

  return (
    <footer className="bg-ink text-white mt-20">
      {/* ─── NEWSLETTER ─── */}
      <section className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="label-eyebrow text-gold mb-4">Comunidad DRUTS</p>
          <h3 className="font-serif text-3xl md:text-4xl mb-4 leading-tight">
            Sé el primero en saber.
          </h3>
          <p className="text-white/60 text-sm max-w-md mx-auto mb-7">
            Lanzamientos, descuentos exclusivos y la curaduría de la temporada. Directo en tu correo.
          </p>
          <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="flex-1 bg-transparent border border-white/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-gold transition-colors"
            />
            <button
              type="submit"
              className="bg-gold hover:bg-cognac text-ink hover:text-white font-medium px-6 py-3 text-[11px] uppercase tracking-[0.22em] transition-colors flex items-center justify-center gap-2"
            >
              <Send size={14} /> Suscribir
            </button>
          </form>
        </div>
      </section>

      {/* ─── COLUMNAS ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Image
              src="/druts/logo.png"
              alt="DRUTS"
              width={160}
              height={64}
              className="h-14 w-auto object-contain mb-5"
              style={{ filter: 'invert(1)' }}
            />
            <p className="text-sm text-white/60 leading-relaxed mb-6 max-w-xs">
              Cuero · Calzado hombre · Marroquinería curada para los que viven con estilo.
            </p>
            <div className="flex gap-3">
              <SocialLink href="#" label="Instagram"><Instagram size={16} strokeWidth={1.5} /></SocialLink>
              <SocialLink href="#" label="Facebook"><Facebook size={16} strokeWidth={1.5} /></SocialLink>
              <SocialLink href="https://wa.me/573001234567" label="WhatsApp">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.768.967-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </SocialLink>
            </div>
          </div>

          <FooterColumn title="Tienda">
            <FooterLink href="/catalog">Todos los productos</FooterLink>
            <FooterLink href="/catalog?category=sneakers">Sneakers</FooterLink>
            <FooterLink href="/catalog?category=botas">Botas Chukka</FooterLink>
            <FooterLink href="/catalog?category=casuales">Casuales</FooterLink>
            <FooterLink href="/catalog?category=premium">Línea Premium</FooterLink>
            <FooterLink href="/catalog?category=lifestyle">Lifestyle</FooterLink>
          </FooterColumn>

          <FooterColumn title="Ayuda">
            <FooterLink href="/orders">Mis pedidos</FooterLink>
            <FooterLink href="#">Política de cambios</FooterLink>
            <FooterLink href="#">Guía de tallas</FooterLink>
            <FooterLink href="#">Preguntas frecuentes</FooterLink>
            <FooterLink href="#">Términos y condiciones</FooterLink>
            <FooterLink href="#">Política de privacidad</FooterLink>
          </FooterColumn>

          <FooterColumn title="Contacto">
            <li className="flex items-start gap-3 text-sm text-white/60">
              <MapPin size={14} strokeWidth={1.5} className="mt-1 flex-shrink-0" />
              Cúcuta, Norte de Santander
            </li>
            <li className="flex items-start gap-3 text-sm text-white/60">
              <Phone size={14} strokeWidth={1.5} className="mt-1 flex-shrink-0" />
              +57 300 123 4567
            </li>
            <li className="flex items-start gap-3 text-sm text-white/60">
              <Mail size={14} strokeWidth={1.5} className="mt-1 flex-shrink-0" />
              hola@druts.co
            </li>
            <li className="pt-3 mt-3 border-t border-white/10">
              <p className="label-eyebrow text-gold mb-2">Horario</p>
              <p className="text-xs text-white/60">Lun—Sáb · 8am — 7pm</p>
            </li>
          </FooterColumn>
        </div>

        {/* ─── BAR INFERIOR ─── */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-white/40 tracking-[0.18em] uppercase">
            © 2026 DRUTS · Todos los derechos reservados
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] text-white/40 tracking-[0.18em] uppercase">Pagamos con</span>
            <div className="flex items-center gap-2">
              {['VISA', 'MASTER', 'PSE', 'NEQUI'].map(p => (
                <span key={p} className="text-[10px] font-bold tracking-wider text-white/60 border border-white/20 px-2 py-1">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label-eyebrow text-gold mb-5">{title}</p>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-white/60 hover:text-white link-underline transition-colors">
        {children}
      </Link>
    </li>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-9 h-9 border border-white/20 hover:border-gold hover:bg-gold hover:text-ink flex items-center justify-center transition-all"
    >
      {children}
    </a>
  );
}
