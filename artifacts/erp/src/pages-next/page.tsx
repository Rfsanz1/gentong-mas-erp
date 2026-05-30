import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  Search, Bell, LogOut, BarChart2, ShoppingCart, Package, Truck,
  Store, ShoppingBag, Landmark, Users, Building2, Settings, X, Monitor,
  UserCheck, Tag,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { APPS, canAccessApp } from '@/app-configs';

const ALL_MODULES = [
  { icon: BarChart2,   label: 'ERP Core',      href: '/dashboard',              color: '#5B52D1' },
  { icon: ShoppingCart,label: 'Sales',          href: '/sales',                  color: '#3B82F6' },
  { icon: Store,       label: 'POS',            href: '/pos',                    color: '#10B981' },
  { icon: Package,     label: 'Gudang',         href: '/gudang',                 color: '#F59E0B' },
  { icon: Truck,       label: 'Driver',         href: '/driver',                 color: '#1D4ED8' },
  { icon: ShoppingBag, label: 'Purchasing',     href: '/purchasing',             color: '#8B5CF6' },
  { icon: Monitor,     label: 'Marketplace',    href: '/marketplace',            color: '#F97316' },
  { icon: Landmark,    label: 'Finance',        href: '/finance',                color: '#06B6D4' },
  { icon: Users,       label: 'CRM',            href: '/crm',                    color: '#EC4899' },
  { icon: UserCheck,   label: 'Customers',      href: '/customers',              color: '#14B8A6' },
  { icon: Building2,   label: 'Suppliers',      href: '/purchasing/suppliers',   color: '#64748B' },
  { icon: Tag,         label: 'Inventory',      href: '/inventory/products',     color: '#84CC16' },
  { icon: BarChart2,   label: 'Reports',        href: '/reports',                color: '#7C3AED' },
  { icon: Settings,    label: 'Settings',       href: '/settings',               color: '#475569' },
];

export default function RootPage() {
  const { token, user, loadProfile, logout } = useAuthStore();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    const init = async () => {
      if (!user) {
        await loadProfile().catch(() => { logout(); navigate('/login'); });
      }
      setLoading(false);
      setTimeout(() => setMounted(true), 50);
    };
    init();
  }, [token, user, loadProfile, logout, navigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchFocused(true);
        document.getElementById('launcher-search')?.focus();
      }
      if (e.key === 'Escape') { setSearch(''); setSearchFocused(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!token || loading) return null;

  const userInitial = (user?.name ?? user?.email ?? 'U')[0].toUpperCase();
  const userName = user?.name ?? user?.email ?? 'User';

  const filtered = search.trim()
    ? ALL_MODULES.filter(m => m.label.toLowerCase().includes(search.toLowerCase()))
    : ALL_MODULES;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: '#FFFFFF',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.25s ease',
      }}
    >
      {/* TOP BAR */}
      <header
        className="flex items-center px-4 sm:px-6"
        style={{
          height: 48,
          borderBottom: '1px solid #F0F0F0',
          backgroundColor: '#FFFFFF',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #5B52D1, #8B80F9)' }}
          >
            G
          </div>
          <span className="hidden sm:block text-sm font-semibold" style={{ color: '#1E1B4B' }}>
            Gentong Mas
          </span>
        </div>

        {/* Search bar — center */}
        <div className="flex-1 flex justify-center px-4">
          <div
            className="relative flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all duration-150"
            style={{
              backgroundColor: searchFocused ? '#F8FAFC' : '#F5F5F5',
              border: `1px solid ${searchFocused ? '#D0CBF9' : 'transparent'}`,
              width: '100%',
              maxWidth: 400,
            }}
          >
            <Search className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#9CA3AF' }} />
            <input
              id="launcher-search"
              type="text"
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="flex-1 bg-transparent outline-none text-sm min-w-0"
              style={{ color: '#1E1B4B' }}
            />
            {search ? (
              <button onClick={() => setSearch('')}>
                <X className="h-3.5 w-3.5" style={{ color: '#9CA3AF' }} />
              </button>
            ) : (
              <span
                className="hidden sm:flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded flex-shrink-0"
                style={{ backgroundColor: '#E5E7EB', color: '#9CA3AF' }}
              >
                Ctrl+K
              </span>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            className="relative p-2 rounded-lg transition-colors hover:bg-gray-100"
            title="Notifikasi"
          >
            <Bell className="h-4.5 w-4.5" style={{ color: '#6B7280', width: 18, height: 18 }} />
          </button>

          {/* User avatar with dropdown trigger */}
          <div className="group relative">
            <button
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white ml-1"
              style={{ background: 'linear-gradient(135deg, #5B52D1, #8B80F9)' }}
              title={userName}
            >
              {userInitial}
            </button>
            {/* Tooltip dropdown */}
            <div
              className="absolute right-0 top-full mt-1 w-44 rounded-xl py-1.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150 z-20"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                border: '1px solid #F0F0F0',
              }}
            >
              <div className="px-3 py-2" style={{ borderBottom: '1px solid #F0F0F0' }}>
                <p className="text-[13px] font-semibold truncate" style={{ color: '#1E1B4B' }}>{userName}</p>
                <p className="text-[11px] truncate" style={{ color: '#9CA3AF' }}>{user?.roles?.join(', ')}</p>
              </div>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                style={{ color: '#6B7280' }}
              >
                <LogOut className="h-3.5 w-3.5" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* APP GRID */}
      <main className="flex-1 px-6 py-10 sm:py-14">
        <div
          className="mx-auto"
          style={{ maxWidth: 900 }}
        >
          {search && (
            <p className="text-xs mb-6" style={{ color: '#9CA3AF' }}>
              {filtered.length} hasil untuk "<span style={{ color: '#5B52D1' }}>{search}</span>"
            </p>
          )}

          <div className="grid gap-x-6 gap-y-8" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))' }}>
            {filtered.map(({ icon: Icon, label, href, color }) => (
              <AppTile key={href} icon={Icon} label={label} href={href} color={color} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-sm" style={{ color: '#9CA3AF' }}>Tidak ada modul yang cocok.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function AppTile({
  icon: Icon,
  label,
  href,
  color,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  color: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      className="flex flex-col items-center gap-2.5 cursor-pointer select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon box */}
      <div
        className="flex items-center justify-center rounded-2xl transition-all duration-150"
        style={{
          width: 64,
          height: 64,
          backgroundColor: hovered ? color : `${color}18`,
          boxShadow: hovered ? `0 8px 20px ${color}44` : 'none',
          transform: hovered ? 'scale(1.06) translateY(-2px)' : 'scale(1)',
        }}
      >
        <Icon
          style={{
            width: 28,
            height: 28,
            color: hovered ? '#FFFFFF' : color,
          }}
        />
      </div>
      {/* Label */}
      <span
        className="text-center text-[12px] leading-snug font-medium"
        style={{ color: hovered ? '#1E1B4B' : '#6B7280', maxWidth: 80 }}
      >
        {label}
      </span>
    </a>
  );
}
