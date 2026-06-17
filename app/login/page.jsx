'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginContent() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/admin';

  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isSignUp) {
        const data = await signUp(email, password, fullName);
        // If email confirmation is disabled, Supabase returns a session instantly
        if (data?.session) {
          router.push(redirectTo);
        } else {
          setSuccessMessage('Registration successful! Please check your email for a confirmation link.');
          // Clear inputs on success
          setFullName('');
          setEmail('');
          setPassword('');
        }
      } else {
        await signIn(email, password);
        router.push(redirectTo);
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '2rem',
      backgroundColor: '#071B3B',
      backgroundImage: 'radial-gradient(circle at top right, #102B5C, #071B3B 70%)',
      fontFamily: 'var(--font-body)'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '420px',
        backgroundColor: '#ffffff',
        padding: '2.5rem',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontFamily: 'var(--font-heading)',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#071B3B',
            marginBottom: '0.35rem'
          }}>
            JUSTICE SOLAR
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', fontWeight: 500 }}>
            {isSignUp ? 'Create your administrative account' : 'Sign in to your administrative account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {isSignUp && (
            <div>
              <label htmlFor="fullName" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Justice Georgenes"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="admin@justicesolar.com"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <p role="alert" style={{ 
              color: '#EF4444', 
              fontSize: '0.85rem', 
              padding: '0.75rem', 
              backgroundColor: '#FEF2F2', 
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              fontWeight: 500,
              margin: 0
            }}>
              {error}
            </p>
          )}

          {successMessage && (
            <p role="status" style={{ 
              color: '#15803D', 
              fontSize: '0.85rem', 
              padding: '0.75rem', 
              backgroundColor: '#F0FDF4', 
              borderRadius: '8px',
              border: '1px solid rgba(22, 163, 74, 0.2)',
              fontWeight: 500,
              margin: 0
            }}>
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              padding: '0.75rem',
              fontSize: '0.95rem',
              width: '100%',
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              backgroundColor: '#FDB813',
              color: '#071B3B',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 10px rgba(253, 184, 19, 0.2)',
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Processing…' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem' }}>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setSuccessMessage('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#3B82F6',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isSignUp ? 'Already have an admin account? Sign In' : "Don't have an admin account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#071B3B',
        color: '#ffffff',
        fontFamily: 'var(--font-body)'
      }}>
        Loading login panel...
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
