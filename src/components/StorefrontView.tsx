import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { HeroBanner } from './HeroBanner';
import { ProductCard } from './ProductCard';
import { ProductCategory } from '../types/store';
import { ArrowUpDown, Filter, ShieldCheck, Truck, Headphones, RotateCcw } from 'lucide-react';

const CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: 'semua', label: 'Semua Kategori' },
  { id: 'elektronik', label: 'Elektronik & Gadget' },
  { id: 'fashion', label: 'Fashion & Pakaian' },
  { id: 'kuliner', label: 'Makanan & Kopi' },
  { id: 'rumah-tangga', label: 'Rumah Tangga' },
  { id: 'kecantikan', label: 'Perawatan Kulit' },
];

export const StorefrontView: React.FC = () => {
  const { products, activeCategory, setActiveCategory, searchQuery } = useStore();
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'best-seller'>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory = activeCategory === 'semua' || p.category === activeCategory;
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStock = !onlyInStock || p.stock > 0;
        return matchesCategory && matchesSearch && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'best-seller') return (b.soldCount || 0) - (a.soldCount || 0);
        return 0;
      });
  }, [products, activeCategory, searchQuery, onlyInStock, sortBy]);

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner Section */}
      <HeroBanner onExploreClick={scrollToCatalog} />

      {/* Catalog & Filter Section */}
      <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Category Filter Pills (Functional Filter Controls) & Sort Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-b border-slate-200 pb-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Sort & Stock Filter */}
          <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
            <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span>Hanya yang ready stok</span>
            </label>

            <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer"
              >
                <option value="featured">Pilihan Terkurasi</option>
                <option value="best-seller">Paling Laris</option>
                <option value="rating">Rating Tertinggi</option>
                <option value="price-low">Harga: Rendah ke Tinggi</option>
                <option value="price-high">Harga: Tinggi ke Rendah</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Count Notice */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan <strong className="text-slate-800 font-mono-numbers">{filteredProducts.length}</strong> produk</span>
          {searchQuery && (
            <span>Hasil pencarian untuk "<strong className="text-slate-900">{searchQuery}</strong>"</span>
          )}
        </div>

        {/* Product Grid (Responsive: 1-col on tiny mobile, 2-col on sm, 3-col on md, 4-col on lg/xl) */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
            <p className="text-base font-semibold text-slate-700">Produk tidak ditemukan</p>
            <p className="text-xs text-slate-500 mt-1">
              Coba kata kunci pencarian lain atau pilih kategori produk yang berbeda.
            </p>
            <button
              onClick={() => {
                setActiveCategory('semua');
              }}
              className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
            >
              Tampilkan Semua Produk
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Trust & Guarantee Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-slate-100/70 rounded-2xl border border-slate-200 text-xs">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900">Pengiriman Nusantara</h4>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Jangkauan ke seluruh Indonesia via JNE, J&T, SiCepat, dan GoSend Instant.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900">Garansi 100% Asli</h4>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Barang resmi tersegel, lulus uji mutu, dan bersumber langsung dari produsen.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <RotateCcw className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900">Garansi Tukar 7 Hari</h4>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Klaim pengembalian atau penggantian mudah bila produk cacat bawaan pabrik.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Headphones className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900">Layanan CS Siap Bantu</h4>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Bantuan pemesanan, konfirmasi transfer, dan pelacakan paket setiap hari kerja.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-bold text-slate-900 font-display">WarungPedia</span> · Platform Toko Serba Ada & Integrasi Pembayaran
        </div>
        <div>
          Hak Cipta © 2026 PT WarungPedia Digital Niaga. Seluruh hak cipta dilindungi.
        </div>
      </footer>
    </div>
  );
};
