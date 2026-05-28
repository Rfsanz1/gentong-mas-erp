'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LogOut, BarChart2, Package, ShoppingCart, Truck,
  ChevronRight, Zap, Shield, Bell, Settings, ArrowUpRight,
} from 'lucide-react';
import { useAuthStore } from '../lib/store/useAuthStore';
import { APPS, canAccessApp } from '../lib/app-configs';

const C = {
  primary: '#5B52D1',
  light: '#8B80F9',
  bg: '#F5F3FF',
  border: '#EDE9FE',
  borderLight: '#DDD6FE',
  dark: '#1E1B4B',
  mid: '#6B7280',
  muted: '#9CA3AF',
  white: '#FFFFFF',
  pill: 'rgba(91,82,209,0.08)',
  pillBorder: 'rgba(91,82,209,0.15)',
};

const APP_ICONS: Record<string, any> = {
  '/dashboard': BarChart2,
  '/sales': ShoppingCart,
  '/gudang': Package,
  '/driver': Truck,
};

const APP_SUBTITLES: Record<string, string> = {
  '/dashboard': 'Owner & Admin',
  '/sales': 'Sales Team',
  '/gudang': 'Warehouse',
  '/driver': 'Delivery',
};

const APP_GRADIENTS: Record<string, string> = {
  '/dashboard': 'linear-gradient(135deg, #5B52D1, #8B80F9)',
  '/sales': 'linear-gradient(135deg, #0891B2, #22D3EE)',
  '/gudang':  'linear-gradient(135deg, #D97706, #FBBF24)',
  '/driver':  'linear-gradient(135deg, #1D4ED8, #60A5FA)',
};

const APP_GLOW: Record<string, string> = {
  '/dashboard': 'rgba(91,82,209,0.25)',
  '/sales':     'rgba(8,145,178,0.25)',
  '/gudang':    'rgba(217,119,6,0.25)',
  '/driver':    'rgba(29,78,216,0.25)',
};

export default function RootPage() {
  const { token, user, loadProfile, logout } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!token) { router.replace('/login'); return; }
    const init = async () => {
      if (!user) {
        await loadProfile().catch(() => { logout(); router.replace('/login'); });
      }
      setLoading(false);
      setTimeout(() => setMounted(true), 60);
    };
    init();
  }, [token, user, loadProfile, logout, router]);

  if (!token || loading) return null;

  const accessibleApps = APPS.filter((app) => canAccessApp(user?.roles ?? [], app.roles));

  return (
    <div
      className="min-h-screen font-sans flex flex-col"
      style={{
        backgroundColor: C.bg,
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}
    >
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[560px] w-[560px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,128,249,0.18), transparent 70%)' }} />
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(91,82,209,0.12), transparent 70%)' }} />
        <div className="absolute top-[40%] left-[60%] h-[360px] w-[360px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(196,181,253,0.12), transparent 70%)' }} />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(${C.primary} 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }} />
      </div>

      {/* Top bar */}
      <header
        className="relative z-10 flex items-center justify-between px-6 py-4 sm:px-10"
        style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[15px] font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.light})`, boxShadow: `0 4px 14px ${APP_GLOW['/dashboard']}` }}
          >
            G
          </div>
          <div>
            <p className="text-[14px] font-bold leading-tight" style={{ color: C.dark }}>Gentong Mas</p>
            <p className="text-[10px] font-medium" style={{ color: C.muted }}>Enterprise ERP</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold"
            style={{ backgroundColor: C.pill, color: C.primary, border: `1px solid ${C.pillBorder}` }}
          >
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.light }} />
            Semua sistem aktif
          </div>
          <button
            onClick={() => { logout(); router.replace('/login'); }}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200"
            style={{ border: `1.5px solid ${C.border}`, backgroundColor: C.white, color: C.mid }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderLight; e.currentTarget.style.color = C.primary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.mid; }}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 mx-auto w-full max-w-6xl px-4 py-10 sm:px-8 lg:px-10">

        {/* Hero */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold"
              style={{ backgroundColor: C.pill, color: C.primary, border: `1px solid ${C.pillBorder}` }}
            >
              <Zap className="h-3 w-3" />
              Platform ERP Terintegrasi
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: C.dark }}>
              Selamat datang,{' '}
              <span style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.light})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {user?.name?.split(' ')[0] ?? 'Pengguna'}
              </span>
            </h1>
            <p className="mt-2 text-sm" style={{ color: C.mid }}>
              Pilih aplikasi yang sesuai dengan peran Anda.
            </p>
          </div>

          {/* User chip */}
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3 self-start sm:self-auto flex-shrink-0"
            style={{ backgroundColor: C.white, border: `1.5px solid ${C.border}`, boxShadow: '0 2px 12px rgba(91,82,209,0.07)' }}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.light})` }}
            >
              {(user?.name ?? user?.email ?? 'U')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: C.dark }}>{user?.name ?? user?.email}</p>
              <p className="text-xs" style={{ color: C.muted }}>{user?.roles?.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* App grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
          {accessibleApps.map((app, i) => (
            <AppCard key={app.href} app={app} index={i} />
          ))}
        </div>

        {/* Stats row */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { label: 'Modul Aktif', value: `${accessibleApps.length}`, icon: Zap },
            { label: 'Keamanan', value: 'SSL', icon: Shield },
            { label: 'Update', value: 'Real-time', icon: Bell },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl px-4 py-3.5"
              style={{ backgroundColor: C.white, border: `1.5px solid ${C.border}`, boxShadow: '0 1px 6px rgba(91,82,209,0.05)' }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl flex-shrink-0"
                style={{ backgroundColor: C.pill }}>
                <Icon className="h-4 w-4" style={{ color: C.primary }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: C.dark }}>{value}</p>
                <p className="text-[10px]" style={{ color: C.muted }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-5 text-center" style={{ borderTop: `1px solid ${C.border}` }}>
        <p className="text-xs" style={{ color: C.muted }}>
          © {new Date().getFullYear()} Gentong Mas — Enterprise Resource Planning &nbsp;·&nbsp; v2.0
        </p>
      </footer>
    </div>
  );
}

function AppCard({ app, index }: { app: any; index: number }) {
  const [hovered, setHovered] = useState(false);
  const gradient = APP_GRADIENTS[app.href] ?? `linear-gradient(135deg, ${C.primary}, ${C.light})`;
  const glow = APP_GLOW[app.href] ?? 'rgba(91,82,209,0.2)';
  const subtitle = APP_SUBTITLES[app.href] ?? '';
  const Icon = APP_ICONS[app.href] ?? BarChart2;

  return (
    <Link
      href={app.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative overflow-hidden rounded-[24px] flex gap-5 transition-all duration-300"
      style={{
        backgroundColor: C.white,
        border: `1.5px solid ${hovered ? C.borderLight : C.border}`,
        boxShadow: hovered
          ? `0 20px 48px -12px ${glow}, 0 4px 12px rgba(91,82,209,0.08)`
          : '0 2px 12px rgba(91,82,209,0.06)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        padding: '24px',
      }}
    >
      {/* Hover glow blob top-right */}
      <div
        className="pointer-events-none absolute -top-10 -right-10 h-36 w-36 rounded-full transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle, ${glow.replace('0.25', '0.35')}, transparent 70%)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Icon column */}
      <div className="flex-shrink-0 flex flex-col items-center gap-3 pt-1">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-white transition-all duration-300"
          style={{
            background: gradient,
            boxShadow: hovered ? `0 8px 24px ${glow}` : `0 4px 12px ${glow.replace('0.25', '0.15')}`,
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
          }}
        >
          <Icon className="h-7 w-7" />
        </div>
        <span
          className="text-[9px] font-bold uppercase tracking-[0.18em]"
          style={{ color: C.muted }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* Text column */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div>
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] mb-1"
              style={{ color: C.muted }}
            >
              {subtitle}
            </span>
            <h2 className="text-[16px] font-bold leading-snug" style={{ color: C.dark }}>
              {app.title}
            </h2>
          </div>
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full flex-shrink-0 ml-2 transition-all duration-300"
            style={{
              background: hovered ? gradient : C.pill,
              transform: hovered ? 'rotate(-45deg)' : 'none',
            }}
          >
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-colors duration-200"
              style={{ color: hovered ? C.white : C.primary }}
            />
          </div>
        </div>
        <p className="text-[13px] leading-relaxed flex-1" style={{ color: C.mid }}>
          {app.description}
        </p>
        <div className="mt-4 flex items-center gap-1.5">
          <span
            className="text-[12px] font-semibold transition-colors duration-200"
            style={{ color: hovered ? C.primary : C.muted }}
          >
            Buka aplikasi
          </span>
          <ChevronRight
            className="h-3.5 w-3.5 transition-all duration-200"
            style={{
              color: hovered ? C.primary : C.muted,
              transform: hovered ? 'translateX(3px)' : 'none',
            }}
          />
        </div>
      </div>
    </Link>
  );
}
