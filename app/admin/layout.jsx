'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FolderKanban, 
  Receipt, 
  Inbox, 
  Settings, 
  LogOut, 
  Zap
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard',   path: '/admin',          icon: LayoutDashboard },
  { label: 'Products',    path: '/admin/products',  icon: ShoppingBag },
  { label: 'Portfolios',  path: '/admin/projects',  icon: FolderKanban },
  { label: 'Orders',      path: '/admin/orders',    icon: Receipt },
  { label: 'Leads',       path: '/admin/leads',     icon: Inbox },
  { label: 'Settings',    path: '/admin/settings',  icon: Settings },
];

const pageTitles = {
  '/admin':          'Dashboard Overview',
  '/admin/products': 'Product Management',
  '/admin/projects': 'Portfolio Projects',
  '/admin/orders':   'Customer Orders',
  '/admin/leads':    'Contact Inquiries',
  '/admin/settings': 'System Settings',
};

export default function AdminLayout({ children }) {
  const { user, profile, loading, profileLoading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] ?? 'Admin Portal';

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  // While checking the session, show a minimal branded splash
  // (much faster than before — only blocks for the session check, not the profile fetch)
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#071B3B',
        color: '#ffffff',
        fontFamily: 'var(--font-body)',
      }}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes shimmer {
            0%   { background-position: -400px 0; }
            100% { background-position: 400px 0; }
          }
        `}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '36px', height: '36px',
            border: '3px solid rgba(255,255,255,0.1)',
            borderTop: '3px solid #FDB813',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 0.75rem',
          }} />
          <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>
            Authenticating…
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const email = profile?.email || user?.email || '';
  const fullName = profile?.full_name || 'Admin User';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AD';

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F0F4F8', fontFamily: 'var(--font-body)' }}>

      {/* ─── Sidebar ─── */}
      <aside style={{
        width: '256px',
        minWidth: '256px',
        backgroundColor: '#071B3B',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 20,
        boxShadow: '4px 0 24px rgba(0,0,0,0.15)'
      }}>

        {/* Logo */}
        <div style={{
          padding: '1.75rem 1.5rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
            <div style={{
              width: '34px', height: '34px',
              background: 'linear-gradient(135deg, #FDB813, #f59e0b)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(253,184,19,0.4)'
            }}>
              <Zap size={18} color="#071B3B" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FDB813', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
                JUSTICE SOLAR
              </div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500, letterSpacing: '1px' }}>
                ADMIN PORTAL
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '10px',
                  color: isActive ? '#071B3B' : 'rgba(255,255,255,0.7)',
                  backgroundColor: isActive ? '#FDB813' : 'transparent',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                  transition: 'all 0.18s ease',
                  textDecoration: 'none',
                  letterSpacing: '-0.1px'
                }}
              >
                <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
                {isActive && (
                  <span style={{
                    marginLeft: 'auto',
                    width: '6px', height: '6px',
                    backgroundColor: '#071B3B',
                    borderRadius: '50%'
                  }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div style={{
          padding: '1rem 1rem',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(0,0,0,0.2)'
        }}>
          <style>{`
            @keyframes shimmer {
              0%   { background-position: -400px 0; }
              100% { background-position: 400px 0; }
            }
            .skeleton {
              background: linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.13) 50%, rgba(255,255,255,0.06) 75%);
              background-size: 400px 100%;
              animation: shimmer 1.4s infinite;
              border-radius: 4px;
            }
          `}</style>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            {/* Avatar */}
            {profileLoading ? (
              <div className="skeleton" style={{ width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0 }} />
            ) : (
              <div style={{
                width: '34px', height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FDB813, #f59e0b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.875rem', color: '#071B3B', flexShrink: 0
              }}>
                {initials}
              </div>
            )}
            {/* Name + email */}
            {profileLoading ? (
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <div className="skeleton" style={{ height: '11px', width: '80%' }} />
                <div className="skeleton" style={{ height: '9px',  width: '60%' }} />
              </div>
            ) : (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={fullName}>
                  {fullName}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={email}>
                  {email}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(239,68,68,0.12)',
              color: '#f87171',
              border: 'none', borderRadius: '8px',
              padding: '0.55rem 0.75rem',
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.18s ease'
            }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Topbar */}
        <header style={{
          height: '64px',
          backgroundColor: '#fff',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
        }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.15rem',
            fontWeight: 700,
            color: '#071B3B',
            margin: 0
          }}>
            {pageTitle}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              fontSize: '0.72rem',
              backgroundColor: '#F0FDF4', color: '#22C55E',
              padding: '0.25rem 0.6rem',
              borderRadius: '20px', fontWeight: 600,
              border: '1px solid #bbf7d0'
            }}>
              <span style={{ width: '6px', height: '6px', backgroundColor: '#22C55E', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
              System Online
            </span>
            <div style={{
              width: '34px', height: '34px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FDB813, #f59e0b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.8rem', color: '#071B3B', cursor: 'pointer'
            }} title={fullName}>
              {initials}
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
