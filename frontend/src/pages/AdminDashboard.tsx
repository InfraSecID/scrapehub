import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  getAdminProducts,
  deleteProduct,
  getAdminLogs,
  getAdminConfigStatus,
  logout,
  getMe,
} from '../services/api';
import { Product, ScrapeLog, ConfigStatus, User } from '../types';
import {
  Database,
  LogOut,
  Trash2,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  Key,
  Package,
  FileText,
  CheckCircle2,
  Eye,
} from 'lucide-react';

type AdminTab = 'products' | 'logs' | 'config';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState<AdminTab>('products');

  // User State
  const [user, setUser] = useState<User | null>(null);

  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<ScrapeLog[]>([]);
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);

  // Loading States
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(true);
  const [isLoadingConfig, setIsLoadingConfig] = useState<boolean>(true);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  // Notification / Alert Message
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch Current User
  useEffect(() => {
    let isMounted = true;
    getMe()
      .then((data) => {
        if (isMounted) setUser(data);
      })
      .catch((err) => {
        if (isMounted) console.warn('Could not fetch user details:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Products
  const loadProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const data = await getAdminProducts({ limit: 100 });
      setProducts(data);
    } catch (err: any) {
      console.error('Failed to load admin products:', err);
      setFeedback({
        type: 'error',
        message: `Gagal memuat produk: ${err.response?.data?.error || err.message}`,
      });
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  // Fetch Logs
  const loadLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const data = await getAdminLogs();
      setLogs(data);
    } catch (err: any) {
      console.error('Failed to load scrape logs:', err);
      setFeedback({
        type: 'error',
        message: `Gagal memuat log: ${err.response?.data?.error || err.message}`,
      });
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  // Fetch Config Status
  const loadConfigStatus = useCallback(async () => {
    setIsLoadingConfig(true);
    try {
      const data = await getAdminConfigStatus();
      setConfigStatus(data);
    } catch (err: any) {
      console.error('Failed to load config status:', err);
      setFeedback({
        type: 'error',
        message: `Gagal memuat status konfigurasi: ${err.response?.data?.error || err.message}`,
      });
    } finally {
      setIsLoadingConfig(false);
    }
  }, []);

  // Initial Load for all sections
  useEffect(() => {
    loadProducts();
    loadLogs();
    loadConfigStatus();
  }, [loadProducts, loadLogs, loadConfigStatus]);

  // Handle Logout
  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err: any) {
      console.error('Logout error:', err);
      // Still navigate to login if logout call completes or fails
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus produk "${product.title}"?`
    );
    if (!confirmed) return;

    setIsDeletingId(product.id);
    try {
      await deleteProduct(product.id);
      // Update local state immediately
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      setFeedback({
        type: 'success',
        message: `Produk "${product.title}" berhasil dihapus.`,
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      console.error('Error deleting product:', err);
      const errText =
        err.response?.data?.error ||
        err.response?.data?.details ||
        err.message ||
        'Gagal menghapus produk.';
      setFeedback({
        type: 'error',
        message: errText,
      });
    } finally {
      setIsDeletingId(null);
    }
  };

  // Helper formatting currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Helper formatting date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      return d.toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* 1. Admin Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand and Admin Badge */}
            <div className="flex items-center space-x-3">
              <Link to="/admin" className="flex items-center space-x-3 group">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Database className="w-5 h-5 text-slate-950" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    ScrapeHub
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Admin
                  </span>
                </div>
              </Link>
            </div>

            {/* Right: User Email + Public Link + Logout */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {user?.email && (
                <span className="hidden md:inline-block text-xs text-slate-400 font-mono bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                  {user.email}
                </span>
              )}

              <Link
                to="/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-emerald-400 px-3 py-1.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
                title="Buka Website Publik"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lihat Publik</span>
              </Link>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 border border-rose-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                <LogOut className={`w-3.5 h-3.5 ${isLoggingOut ? 'animate-spin' : ''}`} />
                <span>{isLoggingOut ? 'Keluar...' : 'Logout'}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
              <span>Dashboard Admin</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manajemen data produk scraped, log eksekusi worker, dan status kredensial API.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                loadProducts();
                loadLogs();
                loadConfigStatus();
              }}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all active:scale-95"
              title="Refresh Semua Data"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mb-6 p-4 rounded-xl border text-sm flex items-center justify-between ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs hover:underline opacity-80"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Section c: Status API Key (Summary Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Card Groq */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm transition-all hover:border-slate-700/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center">
                  <Key className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Groq AI API</h3>
                  <p className="text-xs text-slate-400">Model Llama 3.3 untuk Analisis Trend</p>
                </div>
              </div>

              <div>
                {isLoadingConfig ? (
                  <span className="text-xs text-slate-400 animate-pulse">Mengecek...</span>
                ) : configStatus?.groq ? (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <span>Groq: ✅ Terisi</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    <span>Groq: ❌ Kosong</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Card Bright Data */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm transition-all hover:border-slate-700/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center">
                  <Key className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Bright Data API</h3>
                  <p className="text-xs text-slate-400">Web Unlocker Scraper Kredensial</p>
                </div>
              </div>

              <div>
                {isLoadingConfig ? (
                  <span className="text-xs text-slate-400 animate-pulse">Mengecek...</span>
                ) : configStatus?.brightdata ? (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <span>Bright Data: ✅ Terisi</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    <span>Bright Data: ❌ Kosong</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-3 mb-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'products'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Tabel Produk</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'logs'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Log Scraping</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
              {logs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'config'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Status API Key</span>
          </button>
        </div>

        {/* Tab 1: Section a. Tabel Produk */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Daftar Produk Scraped</h2>
                <p className="text-xs text-slate-400">
                  Total {products.length} produk tersimpan di database. Anda dapat menghapus produk per baris.
                </p>
              </div>

              <button
                onClick={loadProducts}
                disabled={isLoadingProducts}
                className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingProducts ? 'animate-spin' : ''}`} />
                <span>Muat Ulang</span>
              </button>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th scope="col" className="px-4 py-3.5 font-semibold">Title</th>
                    <th scope="col" className="px-4 py-3.5 font-semibold">Price</th>
                    <th scope="col" className="px-4 py-3.5 font-semibold">Rating</th>
                    <th scope="col" className="px-4 py-3.5 font-semibold">Platform</th>
                    <th scope="col" className="px-4 py-3.5 font-semibold">Scraped At</th>
                    <th scope="col" className="px-4 py-3.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {isLoadingProducts ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
                        <span>Memuat data produk...</span>
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                        <Package className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                        <p className="text-sm">Belum ada produk yang tersimpan.</p>
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => {
                      const isDeleting = isDeletingId === product.id;
                      return (
                        <tr
                          key={product.id}
                          className="hover:bg-slate-800/50 transition-colors"
                        >
                          {/* Title */}
                          <td className="px-4 py-3.5 max-w-xs sm:max-w-md">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-white line-clamp-1" title={product.title}>
                                {product.title}
                              </span>
                              {product.url && (
                                <a
                                  href={product.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-500 hover:text-emerald-400 flex-shrink-0 transition-colors"
                                  title="Buka URL Produk"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </td>

                          {/* Price */}
                          <td className="px-4 py-3.5 font-mono text-emerald-400 whitespace-nowrap">
                            {formatPrice(product.price)}
                          </td>

                          {/* Rating */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {product.rating !== null && product.rating !== undefined ? (
                              <span className="inline-flex items-center text-xs font-semibold text-amber-300">
                                ★ {product.rating.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-500">-</span>
                            )}
                          </td>

                          {/* Platform */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                                product.platform === 'TOKOPEDIA'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              {product.platform}
                            </span>
                          </td>

                          {/* Scraped At */}
                          <td className="px-4 py-3.5 text-xs text-slate-400 whitespace-nowrap font-mono">
                            {formatDate(product.scrapedAt || product.createdAt)}
                          </td>

                          {/* Action (Delete) */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteProduct(product)}
                              disabled={isDeleting}
                              className="text-rose-400 hover:text-rose-300 font-medium text-xs inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all active:scale-95 disabled:opacity-50"
                              title="Hapus Produk"
                            >
                              <Trash2 className={`w-3.5 h-3.5 ${isDeleting ? 'animate-spin' : ''}`} />
                              <span>{isDeleting ? 'Menghapus...' : 'Delete'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Section b. Log Scraping */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Log Aktivitas Scraping</h2>
                <p className="text-xs text-slate-400">
                  Histori scraping background & manual yang dijalankan sistem (50 entri terakhir).
                </p>
              </div>

              <button
                onClick={loadLogs}
                disabled={isLoadingLogs}
                className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                <span>Muat Ulang</span>
              </button>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th scope="col" className="px-4 py-3.5 font-semibold">Time</th>
                    <th scope="col" className="px-4 py-3.5 font-semibold">Platform</th>
                    <th scope="col" className="px-4 py-3.5 font-semibold">Count</th>
                    <th scope="col" className="px-4 py-3.5 font-semibold">Status</th>
                    <th scope="col" className="px-4 py-3.5 font-semibold">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {isLoadingLogs ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
                        <span>Memuat log scraping...</span>
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                        <FileText className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                        <p className="text-sm">Belum ada catatan log scraping.</p>
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const isSuccess = log.status?.toUpperCase() === 'SUCCESS';
                      return (
                        <tr
                          key={log.id}
                          className="hover:bg-slate-800/50 transition-colors"
                        >
                          {/* Time */}
                          <td className="px-4 py-3.5 text-xs text-slate-400 whitespace-nowrap font-mono">
                            {formatDate(log.createdAt)}
                          </td>

                          {/* Platform */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700/60">
                              {log.platform}
                            </span>
                          </td>

                          {/* Count */}
                          <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs">
                            <span className="font-semibold text-white">{log.count}</span> items
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                isSuccess
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {isSuccess ? 'SUCCESS' : 'FAILED'}
                            </span>
                          </td>

                          {/* Message */}
                          <td className="px-4 py-3.5 text-xs text-slate-400 max-w-sm sm:max-w-md">
                            <span className="line-clamp-2" title={log.message || '-'}>
                              {log.message || '-'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Section c. Status API Key */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Status Konfigurasi API Key</h2>
              <p className="text-xs text-slate-400">
                Pemeriksaan ketersediaan API key pada lingkungan server backend.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Groq Detailed Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Key className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">Groq AI Cloud</h3>
                      <p className="text-xs text-slate-400">GROQ_API_KEY</p>
                    </div>
                  </div>
                  <div>
                    {isLoadingConfig ? (
                      <span className="text-xs text-slate-400 animate-pulse">Memeriksa...</span>
                    ) : configStatus?.groq ? (
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <span>Groq: ✅ Terisi</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        <span>Groq: ❌ Kosong</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 leading-relaxed">
                  Digunakan untuk melakukan analisis tren e-commerce berbasis AI (Llama 3.3 70B Versatile) dari data scraping Tokopedia & Amazon.
                </div>
              </div>

              {/* Bright Data Detailed Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                      <Key className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">Bright Data Unlocker</h3>
                      <p className="text-xs text-slate-400">BRIGHTDATA_API_KEY</p>
                    </div>
                  </div>
                  <div>
                    {isLoadingConfig ? (
                      <span className="text-xs text-slate-400 animate-pulse">Memeriksa...</span>
                    ) : configStatus?.brightdata ? (
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <span>Bright Data: ✅ Terisi</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        <span>Bright Data: ❌ Kosong</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 leading-relaxed">
                  Digunakan untuk bypass proteksi anti-bot dan scraping katalog produk Amazon secara andal melalui residential proxy network.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} ScrapeHub — Panel Administrasi Sistem.</span>
          <span className="text-slate-600">Autentikasi Aman httpOnly JWT Session.</span>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;
