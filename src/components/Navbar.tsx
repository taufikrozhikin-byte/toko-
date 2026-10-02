import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Search, LayoutDashboard, Store, PackageCheck, User as UserIcon, LogOut, ShieldCheck, ChevronDown, UserPlus } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCategory } from '../types/store';

const CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: 'semua', label: 'Semua Produk' },
  { id: 'elektronik', label: 'Elektronik' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'kuliner', label: 'Makanan & Kopi' },
  { id: 'rumah-tangga', label: 'Rumah Tangga' },
  { id: 'kecantikan', label: 'Perawatan' },
];

export const Navbar: React.FC = () => {
  const {
    cartCount,
    setIsCartOpen,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    currentView,
    setCurrentView,
    currentUser,
    openLoginModal,
    openRegisterModal,
    logout,
  } = useStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Notice Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-medium text-white">WarungPedia Official Store</span>
            <span className="hidden sm:inline text-slate-500">·</span>
            <span className="hidden sm:inline text-slate-300">Pengiriman Cepat Seluruh Indonesia & Garansi 100% Original</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => setCurrentView('order-tracking')}
              className={`hover:text-white transition-colors flex items-center gap-1.5 ${
                currentView === 'order-tracking' ? 'text-white underline' : 'text-slate-300'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cek Status Pesanan</span>
            </button>
            {currentUser && (
              <span className="hidden md:inline text-slate-400">
                Halo, <strong className="text-white">{currentUser.name.split(' ')[0]}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Nav Container (3-Zone Contract) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              setCurrentView('store');
              setActiveCategory('semua');
            }}
            className="text-left group cursor-pointer"
          >
            <span className="text-2xl font-bold tracking-tight font-display text-slate-900 group-hover:text-emerald-700 transition-colors">
              Warung<span className="text-emerald-600">Pedia</span>
            </span>
          </button>

          {/* Quick Category Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600">
            {CATEGORIES.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setCurrentView('store');
                  setActiveCategory(cat.id);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  currentView === 'store' && activeCategory === cat.id
                    ? 'text-slate-900 font-semibold bg-slate-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Zone 2: Search input for quick catalog query */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (currentView !== 'store') setCurrentView('store');
              }}
              placeholder="Cari headphone, kopi arabika, kemeja linen..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Zone 3: Primary Actions (Auth + Mode Switcher + Cart trigger) */}
        <div className="flex items-center gap-2.5">
          {/* USER AUTHENTICATION STATE */}
          {currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-xs font-medium text-slate-800 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline font-semibold max-w-[100px] truncate">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {currentUser.role === 'admin' ? (
                        <>
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Admin Toko</span>
                        </>
                      ) : (
                        <>
                          <UserIcon className="w-3 h-3 text-slate-500" />
                          <span>Pelanggan</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="py-1 text-xs">
                    <button
                      onClick={() => {
                        setCurrentView('order-tracking');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <PackageCheck className="w-4 h-4 text-slate-400" />
                      <span>Pesanan Saya</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentView(currentView === 'admin' ? 'store' : 'admin');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      <span>{currentView === 'admin' ? 'Lihat Katalog Toko' : 'Laporan Penjualan Admin'}</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 text-xs font-medium cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={openLoginModal}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Masuk
              </button>
              <button
                onClick={openRegisterModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Daftar</span>
              </button>
            </div>
          )}

          {/* Mode Switcher: Store vs Admin Dashboard */}
          {currentView === 'admin' ? (
            <button
              onClick={() => setCurrentView('store')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 cursor-pointer"
            >
              <Store className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Toko</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentView('admin')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-600" />
              <span>Admin</span>
            </button>
          )}

          {/* Cart Drawer Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Keranjang Belanja"
            className="relative p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-emerald-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center font-mono-numbers shadow-sm animate-in fade-in zoom-in duration-150">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="px-4 pb-3 md:hidden">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (currentView !== 'store') setCurrentView('store');
            }}
            placeholder="Cari produk toko..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white"
          />
        </div>
      </div>
    </header>
  );
};
