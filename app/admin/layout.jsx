'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FolderKanban, 
  Receipt, 
  Inbox, 
  Settings, 
  LogOut, 
  Globe,
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
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] ?? 'Admin Portal';

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: '34px', height: '34px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FDB813, #f59e0b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.875rem', color: '#071B3B', flexShrink: 0
            }}>
              JG
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Justice Georgenes
              </div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                admin@justicesolar.com
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link
              href="/"
              target="_blank"
              style={{
                flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.3rem',
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.8)',
                border: 'none', borderRadius: '7px',
                padding: '0.45rem 0.5rem',
                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.18s ease', textDecoration: 'none'
              }}
            >
              <Globe size={13} /> Live Site
            </Link>
            <button
              style={{
                flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.3rem',
                backgroundColor: 'rgba(239,68,68,0.12)',
                color: '#f87171',
                border: 'none', borderRadius: '7px',
                padding: '0.45rem 0.5rem',
                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.18s ease'
              }}
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
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
            }}>
              JG
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
