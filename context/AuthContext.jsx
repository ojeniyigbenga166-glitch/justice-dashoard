'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, supabaseIsConfigured } from '@/lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Supabase is not configured, stop loading immediately
    if (!supabaseIsConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    if (!supabase) throw new Error('Supabase is not configured. Please set your environment variables.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isConfigured: supabaseIsConfigured,
  };

  // Show setup screen if Supabase is not yet configured
  if (!supabaseIsConfigured) {
    return (
      <AuthContext.Provider value={value}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#071B3B',
          backgroundImage: 'radial-gradient(circle at top right, #102B5C, #071B3B 70%)',
          fontFamily: 'Inter, sans-serif',
          padding: '2rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '2.5rem',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <h1 style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#071B3B',
              marginBottom: '0.5rem'
            }}>
              ⚙️ Setup Required
            </h1>
            <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Your Supabase credentials are not yet configured. Add your real values to{' '}
              <code style={{ backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.875rem' }}>
                .env.local
              </code>{' '}
              and restart the dev server.
            </p>

            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '1rem',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              lineHeight: 2,
              color: '#334155'
            }}>
              <div style={{ color: '#94A3B8' }}># .env.local</div>
              <div>NEXT_PUBLIC_SUPABASE_URL=<span style={{ color: '#22C55E' }}>https://xxxx.supabase.co</span></div>
              <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=<span style={{ color: '#22C55E' }}>eyJ...</span></div>
              <div>SUPABASE_SERVICE_ROLE_KEY=<span style={{ color: '#22C55E' }}>eyJ...</span></div>
            </div>

            <p style={{ color: '#64748B', fontSize: '0.8rem', marginTop: '1.25rem' }}>
              Find these values in your{' '}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#FDB813', fontWeight: 600 }}
              >
                Supabase Dashboard → Project Settings → API
              </a>
            </p>
          </div>
        </div>
      </AuthContext.Provider>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
