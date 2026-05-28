

import { useState } from 'react';
import { useLocation } from 'wouter';

import { useAuthStore } from '@/store/useAuthStore';
import { Home, LogOut, ChevronLeft, Menu, X, Bell } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  children?: { label: string; href: string }[];
}

interface AppShellProps {
  appName: string;
  appColor: string;
  appGradient: string;
  appIcon: React.ElementType;
  navItems: NavItem[];
  children: React.ReactNode;
  activeHref?: string;
}

interface SidebarProps {
  appName: string;
  appColor: string;
  appIcon: React.ElementType;
  navItems: NavItem[];
  activeHref?: string;
  expandedItem: string | null;
  setExpandedItem: (v: string | null) => void;
  onNavigate: (href: string) => void;
  onClose?: () => void;
  onHome: () => void;
  onLogout: () => void;
  userName: string;
  userEmail: string;
}

function SidebarContent({
  appName,
  appIcon: AppIcon,
  navItems,
  activeHref,
  expandedItem,
  setExpandedItem,
  onNavigate,
  onClose,
  onHome,
  onLogout,
  userName,
  userEmail,
}: SidebarProps) {
  return (
    <div className="flex flex-col h-full">
      {/* App brand */}
      <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,.12)' }}>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0"
          style={{ backgroundColor: 'rgba(255,255,255,.2)' }}
        >
          <AppIcon className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white leading-tight truncate">{appName}</p>
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,.6)' }}>Gentong Mas ERP</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = activeHref === item.href || activeHref?.startsWith(item.href + '/');
          const isExpanded = expandedItem === item.href;
          const hasChildren = item.children && item.children.length > 0;

          return (
            <div key={item.href}>
              <button
                onClick={() => {
                  if (hasChildren) {
                    setExpandedItem(isExpanded ? null : item.href);
                  } else {
                    onNavigate(item.href);
                    onClose?.();
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
                style={{
                  backgroundColor: isActive ? 'rgba(255,255,255,.2)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'rgba(255,255,255,.75)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,.1)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span
                    className="flex h-5 min-w-5 items-center justify-center rounded-full text-[10px] font-bold px-1"
                    style={{ backgroundColor: 'rgba(255,255,255,.25)', color: '#fff' }}
                  >
                    {item.badge}
                  </span>
                )}
                {hasChildren && (
                  <ChevronLeft
                    className="h-3.5 w-3.5 transition-transform flex-shrink-0"
                    style={{ transform: isExpanded ? 'rotate(-90deg)' : 'rotate(0deg)' }}
                  />
                )}
              </button>
              {hasChildren && isExpanded && (
                <div className="ml-4 mt-0.5 pl-3 space-y-0.5" style={{ borderLeft: '1px solid rgba(255,255,255,.15)' }}>
                  {item.children!.map((child) => (
                    <button
                      key={child.href}
                      onClick={() => { onNavigate(child.href); onClose?.(); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all"
                      style={{ color: 'rgba(255,255,255,.65)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.65)'; }}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom: home + user */}
      <div className="p-3 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,.1)' }}>
        <button
          onClick={onHome}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
          style={{ color: 'rgba(255,255,255,.7)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.7)'; }}
        >
          <Home className="h-4 w-4" />
          <span className="text-sm font-medium">Beranda</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
          style={{ color: 'rgba(255,255,255,.55)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(234,84,85,.18)'; e.currentTarget.style.color = '#fca5a5'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.55)'; }}
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Keluar</span>
        </button>

        {/* User info */}
        <div className="flex items-center gap-2 px-3 py-2 mt-1">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,.25)' }}
          >
            {(userName || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{userName || 'Admin'}</p>
            <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,.5)' }}>{userEmail}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppShell({
  appName,
  appColor,
  appGradient,
  appIcon,
  navItems,
  children,
  activeHref,
}: AppShellProps) {
  const [, navigate] = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const sidebarProps: SidebarProps = {
    appName,
    appColor,
    appIcon,
    navItems,
    activeHref,
    expandedItem,
    setExpandedItem,
    onNavigate: (href) => navigate(href),
    onHome: () => navigate('/'),
    onLogout: () => { logout(); navigate('/login'); },
    userName: user?.name ?? user?.email ?? '',
    userEmail: user?.email ?? '',
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F5F4F9' }}>
      {/* ── Sidebar desktop ── */}
      <aside
        className="hidden lg:flex flex-col w-56 flex-shrink-0 h-full"
        style={{ background: `linear-gradient(180deg, ${appColor} 0%, ${appColor}dd 100%)` }}
      >
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* ── Sidebar mobile overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside
            className="relative flex flex-col w-64 h-full z-10"
            style={{ background: `linear-gradient(180deg, ${appColor} 0%, ${appColor}dd 100%)` }}
          >
            <button
              className="absolute top-3 right-3 p-1.5 rounded-lg"
              style={{ backgroundColor: 'rgba(255,255,255,.15)', color: '#fff' }}
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent {...sidebarProps} onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-4 sm:px-6 h-14 flex-shrink-0"
          style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #EDE8F5', boxShadow: '0 1px 0 rgba(47,43,61,.05)' }}
        >
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg"
              style={{ color: '#9CA3AF' }}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors"
              style={{ color: '#9CA3AF' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = appColor; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; }}
            >
              <Home className="h-3.5 w-3.5" />
              Beranda
            </button>
            <span style={{ color: '#D4CDE0' }}>/</span>
            <span className="text-xs font-semibold" style={{ color: appColor }}>{appName}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg" style={{ color: '#9CA3AF' }}>
              <Bell className="h-5 w-5" />
            </button>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ border: '1px solid #EDE8F5' }}
            >
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-bold"
                style={{ backgroundColor: appColor }}
              >
                {(user?.name ?? 'A').charAt(0).toUpperCase()}
              </div>
              <span className="text-sm hidden sm:block font-medium" style={{ color: '#1E1B4B' }}>
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
