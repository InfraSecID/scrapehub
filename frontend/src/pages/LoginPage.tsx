import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login, getMe } from '../services/api';
import { Database, Lock, Mail, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect directly to /admin
  useEffect(() => {
    let isMounted = true;
    async function checkExistingSession() {
      try {
        const user = await getMe();
        if (isMounted && user && user.id) {
          navigate('/admin', { replace: true });
          return;
        }
      } catch (err) {
        // No active session found, proceed to show login form
        console.debug('No active session found:', err);
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    }

    checkExistingSession();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Silakan masukkan email dan password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await login(email, password);
      if (result.success) {
        // Redirect to /admin (or the redirect target if specified)
        const from = (location.state as any)?.from?.pathname || '/admin';
        navigate(from, { replace: true });
      } else {
        setErrorMessage(result.error || 'Login gagal. Periksa kembali email dan password.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errText =
        err.response?.data?.error ||
        err.response?.data?.details ||
        err.message ||
        'Terjadi kesalahan saat login.';
      setErrorMessage(errText);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
        <p className="text-sm text-slate-400">Memeriksa status login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-12 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Background Decorative Blur */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
            <Database className="w-6 h-6 text-slate-950" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Scrape<span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Hub</span> Admin
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Masuk untuk mengakses dashboard manajemen sistem
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60 backdrop-blur-sm">
          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@scrapehub.dev"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>Masuk ke Admin</span>
              )}
            </button>
          </form>
        </div>

        {/* Back to Public Site Link */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Publik</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
