import { useState } from 'react';
import { useLocation } from 'wouter';

import { useAuthStore } from '@/store/useAuthStore';
import {
  Menu, X, Bell, ChevronDown, Home, LogOut, Settings,
  Users, Shield, Building2, Mail, Smartphone, Hash,
  Percent, Globe, HardDrive, Link2, Activity, Zap,
} from 'lucide-react';

const T = {
  primary:    '#5B52D1',
  activeBg:   'rgba(91,82,209,0.09)',
  hoverBg:    'rgba(91,82,209,0.05)',
  activeText: '#5B52D1',
  textHeading:'#1E1B4B',
  textBody:   '#374151',
  textMuted:  '#9CA3AF',
  textSection:'#A78BFA',
  border:     '#EDE8F5',
  sidebarBg:  '#FEFEFF',
  dot:        '#5B52D1',
};

interface NavGroup {
  label: string;
  items: {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: number;
  }[];
}

const SETTINGS_GROUPS: NavGroup[] = [
  {
    label: 'SISTEM',
    items: [
      { label: 'Umum',            href: '/settings',            icon: Settings },
      { label: 'Multi Perusahaan',href: '/settings/companies',  icon: Building2 },
    ],
  },
  {
    label: 'KEAMANAN',
    items: [
      { label: 'User Management',   href: '/settings/users',  icon: Users },
      { label: 'Role & Permission',  href: '/settings/roles',  icon: Shield },
      { label: 'Users & Akses',      href: '/access',          icon: Shield },
    ],
  },
  {
    label: 'KOMUNIKASI',
    items: [
      { label: 'Email Gateway', href: '/settings/email-gateway', icon: Mail },
      { label: 'WA Gateway',    href: '/settings/wa-gateway',    icon: Smartphone },
      { label: 'Notifikasi',    href: '/notifications',          icon: Bell },
    ],
  },
  {
    label: 'INTEGRASI',
    items: [
      { label: 'API Integration', href: '/settings/api', icon: Link2 },
      { label: 'Kledo',           href: '/kledo',        icon: Zap },
    ],
  },
  {
    label: 'KONFIGURASI',
    items: [
      { label: 'Format Nomor Dok',   href: '/settings/document-numbers', icon: Hash },
      { label: 'Konfigurasi Pajak',  href: '/settings/tax',              icon: Percent },
      { label: 'Mata Uang',          href: '/settings/currencies',       icon: Globe },
    ],
  },
  {
    label: 'DATA & LOG',
    items: [
      { label: 'Backup & Restore', href: '/settings/backup',       icon: HardDrive },
      { label: 'Activity Log',     href: '/settings/activity-log', icon: Activity },
    ],
  },
];

interface SidebarInnerProps {
  activeHref?: string;
  onNavigate: (href: string) => void;
  onClose?: () => void;
  onHome: () => void;
  onLogout: () => void;
  userName: string;
  userRole: string;
}

function SidebarInner({
  activeHref,
  onNavigate,
  onClose,
  onHome,
  onLogout,
  userName,
  userRole,
}: SidebarInnerProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (href: string) =>
    activeHref === href || (href !== '/settings' && activeHref?.startsWith(href));

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: T.sidebarBg }}>

      {/* Brand header */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0"
        style={{ borderBottom: `1px solid ${T.border}` }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${T.primary} 0%, #8B80F9 100%)` }}
        >
          <Settings className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold leading-none truncate" style={{ color: T.textHeading }}>
            Pengaturan
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: T.textMuted }}>Gentong Mas ERP</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-md lg:hidden transition-colors"
            style={{ color: T.textMuted }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = T.hoverBg; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-5">
        {SETTINGS_GROUPS.map((group) => (
          <div key={group.label}>
            <p
              className="px-2 mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: T.textSection }}
            >
              {group.label}
            </p>
            <div className="space-y-px">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <button
                    key={item.href}
                    onClick={() => { onNavigate(item.href); onClose?.(); }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-left transition-colors duration-150"
                    style={{
                      backgroundColor: active ? T.activeBg : 'transparent',
                      color: active ? T.activeText : T.textBody,
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.backgroundColor = T.hoverBg;
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <item.icon
                      className="h-4 w-4 flex-shrink-0"
                      style={{ color: active ? T.primary : T.textMuted }}
                    />
                    <span className="text-[13px] font-medium flex-1 leading-none truncate">
                      {item.label}
                    </span>
                    {active && (
                      <span
                        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: T.dot }}
                      />
                    )}
                    {item.badge != null && item.badge > 0 && (
                      <span
                        className="flex h-4 min-w-4 items-center justify-center rounded-full text-[10px] font-bold px-1"
                        style={{ backgroundColor: T.activeBg, color: T.primary }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User panel */}
      <div
        className="flex-shrink-0 px-2.5 pt-2 pb-3"
        style={{ borderTop: `1px solid ${T.border}` }}
      >
        <button
          onClick={() => { onHome(); onClose?.(); }}
          className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-left transition-colors duration-150 mb-px"
          style={{ color: T.textBody }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = T.hoverBg; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <Home className="h-4 w-4 flex-shrink-0" style={{ color: T.textMuted }} />
          <span className="text-[13px] font-medium leading-none">Beranda</span>
        </button>

        <button
          onClick={() => setUserMenuOpen((v) => !v)}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg mt-1 transition-colors duration-150"
          style={{ border: `1px solid ${T.border}` }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = T.hoverBg; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-bold flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${T.primary} 0%, #8B80F9 100%)` }}
          >
            {(userName || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[12.5px] font-semibold leading-none truncate" style={{ color: T.textHeading }}>
              {userName || 'Admin'}
            </p>
            <p className="text-[11px] mt-0.5 leading-none" style={{ color: T.textMuted }}>
              {userRole}
            </p>
          </div>
          <ChevronDown
            className="h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200"
            style={{
              color: T.textMuted,
              transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </button>

        {userMenuOpen && (
          <div
            className="mt-1 rounded-xl overflow-hidden"
            style={{ border: `1px solid ${T.border}`, backgroundColor: '#FFF' }}
          >
            <button
              onClick={() => { onLogout(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors duration-150"
              style={{ color: '#EF4444' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <span className="text-[13px] font-medium">Keluar</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface SettingsShellProps {
  children: React.ReactNode;
  activeHref?: string;
}

export default function SettingsShell({ children, activeHref }: SettingsShellProps) {
  const [, navigate] = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarProps: SidebarInnerProps = {
    activeHref,
    onNavigate: (href) => navigate(href),
    onHome: () => navigate('/'),
    onLogout: () => { logout(); navigate('/login'); },
    userName: user?.name ?? user?.email ?? '',
    userRole: (user as any)?.role ?? 'Admin',
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F5F4F9' }}>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-56 flex-shrink-0 h-full"
        style={{ borderRight: `1px solid ${T.border}`, backgroundColor: T.sidebarBg }}
      >
        <SidebarInner {...sidebarProps} />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="relative flex flex-col w-60 h-full z-10"
            style={{ backgroundColor: T.sidebarBg, borderRight: `1px solid ${T.border}` }}
          >
            <SidebarInner {...sidebarProps} onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Topbar */}
        <header
          className="flex items-center justify-between px-4 sm:px-5 h-14 flex-shrink-0"
          style={{
            backgroundColor: '#FFFFFF',
            borderBottom: `1px solid ${T.border}`,
            boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <button
              className="lg:hidden p-1.5 rounded-lg transition-colors"
              style={{ color: T.textMuted }}
              onClick={() => setSidebarOpen(true)}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = T.hoverBg)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors"
              style={{ color: T.textMuted }}
              onMouseEnter={(e) => (e.currentTarget.style.color = T.primary)}
              onMouseLeave={(e) => (e.currentTarget.style.color = T.textMuted)}
            >
              <Home className="h-3.5 w-3.5" />
              Beranda
            </button>
            <span style={{ color: '#D4CDE0' }}>/</span>
            <span className="text-xs font-semibold" style={{ color: T.primary }}>Pengaturan</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              className="p-2 rounded-lg transition-colors"
              style={{ color: T.textMuted }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = T.hoverBg)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Bell className="h-[18px] w-[18px]" />
            </button>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ border: `1px solid ${T.border}` }}
            >
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-bold"
                style={{ background: `linear-gradient(135deg, ${T.primary} 0%, #8B80F9 100%)` }}
              >
                {(user?.name ?? 'A').charAt(0).toUpperCase()}
              </div>
              <span className="text-[13px] hidden sm:block font-medium" style={{ color: T.textHeading }}>
                {user?.name ?? 'Admin'}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
