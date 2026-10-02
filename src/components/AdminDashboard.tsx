import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  PackageCheck,
  ShoppingBag,
  Download,
  Printer,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  Sparkles,
  AlertCircle,
  FileSpreadsheet,
  BarChart3,
  ListOrdered,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus, Product, ProductCategory } from '../types/store';
import { formatRupiah, formatDate, formatDateShort, generateTrackingNumber } from '../utils/format';

interface AdminDashboardProps {
  onViewInvoice: (order: Order) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onViewInvoice }) => {
  const {
    orders,
    products,
    updateOrderStatus,
    simulatePayOrder,
    addProduct,
    updateProduct,
    deleteProduct,
    resetToDefaultData,
    setCurrentView,
    currentUser,
    login,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'laporan' | 'pesanan' | 'produk'>('laporan');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<'7' | '30' | 'ALL'>('30');

  // Tracking number prompt modal state
  const [resizingOrder, setResizingOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  // New Product Modal state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<ProductCategory>('elektronik');
  const [newProdPrice, setNewProdPrice] = useState<number>(150000);
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState<number>(200000);
  const [newProdStock, setNewProdStock] = useState<number>(20);
  const [newProdImage, setNewProdImage] = useState<string>('/src/assets/images/hero_marketplace_lifestyle_1790924877771.jpg');
  const [newProdDesc, setNewProdDesc] = useState('');

  // Quick edit stock state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingStockVal, setEditingStockVal] = useState<number>(0);
  const [editingPriceVal, setEditingPriceVal] = useState<number>(0);

  // Filter orders by date range
  const filteredOrdersByDate = useMemo(() => {
    if (dateRangeFilter === 'ALL') return orders;
    const now = new Date().getTime();
    const days = parseInt(dateRangeFilter, 10);
    const msLimit = days * 24 * 60 * 60 * 1000;
    return orders.filter((o) => now - new Date(o.createdAt).getTime() <= msLimit);
  }, [orders, dateRangeFilter]);

  // Financial Metrics
  const paidOrders = filteredOrdersByDate.filter((o) => o.paymentStatus === 'SUDAH_DIBAYAR');
  const totalOmzet = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const totalSubtotal = paidOrders.reduce((sum, o) => sum + o.subtotal, 0);
  // Estimated gross profit ~30%
  const estimatedProfit = Math.round(totalSubtotal * 0.32);
  const totalCompletedOrders = paidOrders.length;
  const aov = totalCompletedOrders > 0 ? Math.round(totalOmzet / totalCompletedOrders) : 0;
  const lowStockCount = products.filter((p) => p.stock <= 5).length;

  // Filtered orders for table
  const displayedOrders = useMemo(() => {
    return filteredOrdersByDate.filter((order) => {
      const matchSearch =
        order.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(orderSearch.toLowerCase());
      const matchStatus =
        orderStatusFilter === 'ALL' ||
        order.orderStatus === orderStatusFilter ||
        (orderStatusFilter === 'UNPAID' && order.paymentStatus === 'MENUNGGU_PEMBAYARAN');
      return matchSearch && matchStatus;
    });
  }, [filteredOrdersByDate, orderSearch, orderStatusFilter]);

  // Sales by Day for Chart (Last 7 days)
  const salesByDay = useMemo(() => {
    const map = new Map<string, { label: string; amount: number; count: number }>();
    // Pre-populate last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric' }).format(d);
      map.set(key, { label, amount: 0, count: 0 });
    }

    paidOrders.forEach((o) => {
      const dayKey = o.createdAt.split('T')[0];
      if (map.has(dayKey)) {
        const item = map.get(dayKey)!;
        item.amount += o.total;
        item.count += 1;
      }
    });

    return Array.from(map.values());
  }, [paidOrders]);

  const maxDailySales = Math.max(...salesByDay.map((s) => s.amount), 1000000);

  // Sales by Category
  const categorySales = useMemo(() => {
    const cats: Record<string, number> = {};
    paidOrders.forEach((o) => {
      o.items.forEach((item) => {
        const cat = item.product.categoryName || 'Lainnya';
        cats[cat] = (cats[cat] || 0) + item.product.price * item.quantity;
      });
    });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]);
  }, [paidOrders]);

  // Sales by Payment Channel
  const paymentMethodShare = useMemo(() => {
    const methods: Record<string, number> = {};
    paidOrders.forEach((o) => {
      const name = o.paymentMethod.name;
      methods[name] = (methods[name] || 0) + 1;
    });
    return Object.entries(methods).sort((a, b) => b[1] - a[1]);
  }, [paidOrders]);

  // Export to CSV Function
  const handleExportCSV = () => {
    const headers = [
      'No Invoice',
      'Tanggal Dibuat',
      'Nama Pelanggan',
      'Email',
      'No Telepon',
      'Kota Penerima',
      'Metode Pembayaran',
      'Status Pembayaran',
      'Status Pesanan',
      'Ekspedisi',
      'Nomor Resi',
      'Subtotal (Rp)',
      'Diskon (Rp)',
      'Ongkir (Rp)',
      'Total Belanja (Rp)',
    ];

    const rows = filteredOrdersByDate.map((o) => [
      `"${o.id}"`,
      `"${o.createdAt}"`,
      `"${o.customerName}"`,
      `"${o.customerEmail}"`,
      `"${o.customerPhone}"`,
      `"${o.shippingAddress.city}"`,
      `"${o.paymentMethod.name}"`,
      `"${o.paymentStatus}"`,
      `"${o.orderStatus}"`,
      `"${o.courier.courierName}"`,
      `"${o.trackingNumber || '-'}"`,
      o.subtotal,
      o.discount,
      o.shippingCost,
      o.total,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Laporan_Penjualan_WarungPedia_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    if (newStatus === 'DIKIRIM') {
      const target = orders.find((o) => o.id === orderId);
      if (target) {
        setResizingOrder(target);
        setTrackingInput(target.trackingNumber || generateTrackingNumber(target.courier.courierName));
        return;
      }
    }
    updateOrderStatus(orderId, newStatus);
  };

  const handleConfirmTracking = () => {
    if (resizingOrder) {
      updateOrderStatus(resizingOrder.id, 'DIKIRIM', trackingInput.trim());
      setResizingOrder(null);
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const categoryNames: Record<ProductCategory, string> = {
      semua: 'Umum',
      elektronik: 'Elektronik & Gadget',
      fashion: 'Fashion & Pakaian',
      kuliner: 'Makanan & Kopi',
      'rumah-tangga': 'Rumah Tangga & Living',
      kecantikan: 'Perawatan & Kecantikan',
      hobi: 'Hobi & Mainan',
    };

    addProduct({
      name: newProdName,
      category: newProdCategory,
      categoryName: categoryNames[newProdCategory] || 'Produk Umum',
      price: Number(newProdPrice),
      originalPrice: newProdOriginalPrice ? Number(newProdOriginalPrice) : undefined,
      stock: Number(newProdStock),
      image: newProdImage || '/src/assets/images/hero_marketplace_lifestyle_1790924877771.jpg',
      description: newProdDesc || 'Produk berkualitas tinggi jaminan kepuasan pelanggan.',
      features: ['Kualitas terjamin standar nasional', 'Kemasan rapi dan bersegel', 'Garansi tukar baru bila rusak'],
      specifications: {
        'Kondisi': 'Baru 100%',
        'Garansi': 'Resmi',
      },
      weightGram: 350,
      badge: 'Baru',
    });

    setIsAddProductOpen(false);
    setNewProdName('');
    setNewProdDesc('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner & Mode Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pusat Kendali Bisnis & Penjualan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
            Dashboard & Laporan Penjualan
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-500">
              Pengelola Toko:
            </span>
            {currentUser?.role === 'admin' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{currentUser.name} (Admin Terverifikasi)</span>
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <span>{currentUser ? `${currentUser.name} (Pelanggan)` : 'Mode Tamu / Publik'}</span>
                </span>
                <button
                  onClick={() => login('admin@warungpedia.id', 'admin123')}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                >
                  Beralih ke Akun Admin Resmi &rarr;
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Cetak Laporan</span>
          </button>

          <button
            onClick={() => setCurrentView('store')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <span>Toko Pembeli</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 no-print">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('laporan')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'laporan'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Ringkasan & Grafik Penjualan</span>
          </button>

          <button
            onClick={() => setActiveTab('pesanan')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'pesanan'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Daftar Transaksi Pesanan</span>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-mono-numbers px-1.5 py-0.2 rounded-full">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('produk')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'produk'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Katalog & Stok Barang</span>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-mono-numbers px-1.5 py-0.2 rounded-full">
              {products.length}
            </span>
          </button>
        </div>

        {/* Date Filter selector */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs">
          <span className="text-slate-400">Periode:</span>
          <select
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none"
          >
            <option value="7">7 Hari Terakhir</option>
            <option value="30">30 Hari Terakhir</option>
            <option value="ALL">Semua Waktu</option>
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LAPORAN PENJUALAN & METRIK KEUANGAN */}
      {/* ========================================================================= */}
      {activeTab === 'laporan' && (
        <div className="space-y-6">
          {/* KPI Stat Cards (Single level elevation, tabular numbers) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Omzet Penjualan
                </span>
                <div className="text-2xl font-black text-slate-900 font-mono-numbers mt-1.5">
                  {formatRupiah(totalOmzet)}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{paidOrders.length} transaksi lunas</span>
                </span>
                <span>Real-time</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Estimasi Laba Bersih
                </span>
                <div className="text-2xl font-black text-emerald-700 font-mono-numbers mt-1.5">
                  {formatRupiah(estimatedProfit)}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Margin rata-rata ~32%</span>
                <span className="font-semibold text-slate-700">Toko Aktif</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Rata-Rata Order (AOV)
                </span>
                <div className="text-2xl font-black text-slate-900 font-mono-numbers mt-1.5">
                  {formatRupiah(aov)}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Basket Size</span>
                <span>{products.length} SKU terdaftar</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Peringatan Stok Barang
                </span>
                <div className="text-2xl font-black font-mono-numbers mt-1.5 flex items-center gap-2">
                  <span className={lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900'}>
                    {lowStockCount} SKU
                  </span>
                  {lowStockCount > 0 && (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      Perlu Restock
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Stok di bawah 5 unit</span>
                <button
                  onClick={() => setActiveTab('produk')}
                  className="text-slate-900 font-semibold hover:underline"
                >
                  Kelola Stok &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Bar Chart for Daily Revenue (7 Days) */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Tren Omzet Penjualan 7 Hari Terakhir
                </h3>
                <p className="text-xs text-slate-500">
                  Total penerimaan dana dari transaksi yang sudah berhasil dibayar
                </p>
              </div>
              <div className="text-xs font-mono-numbers font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg self-start">
                Omzet Minggu Ini: {formatRupiah(salesByDay.reduce((a, b) => a + b.amount, 0))}
              </div>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="pt-4">
              <div className="grid grid-cols-7 gap-2 sm:gap-4 h-48 sm:h-56 items-end border-b border-slate-200 pb-2">
                {salesByDay.map((day, idx) => {
                  const heightPercent = Math.max(8, Math.round((day.amount / maxDailySales) * 100));
                  return (
                    <div key={idx} className="flex flex-col items-center h-full justify-end group">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-center bg-slate-900 text-white p-1 rounded mb-1 pointer-events-none whitespace-nowrap z-10 font-mono-numbers">
                        {formatRupiah(day.amount)} ({day.count} order)
                      </div>

                      {/* Bar Pillar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[48px] rounded-t-lg transition-all duration-300 ${
                          day.amount > 0
                            ? 'bg-slate-900 group-hover:bg-emerald-600'
                            : 'bg-slate-100 group-hover:bg-slate-200'
                        }`}
                      />

                      {/* Date label */}
                      <span className="text-[11px] font-medium text-slate-600 mt-2 text-center truncate w-full">
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Breakdown Section: Category Revenue vs Payment Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales by Category */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Kontribusi Penjualan per Kategori
                </h3>
                <p className="text-xs text-slate-500">
                  Kategori produk paling dominan menghasilkan omzet
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {categorySales.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Belum ada data penjualan</p>
                ) : (
                  categorySales.map(([catName, amount], i) => {
                    const percent = totalSubtotal > 0 ? Math.round((amount / totalSubtotal) * 100) : 0;
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-800">{catName}</span>
                          <span className="font-mono-numbers text-slate-600 font-medium">
                            {formatRupiah(amount)} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Popular Payment Methods */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Saluran Pembayaran Terpopuler
                </h3>
                <p className="text-xs text-slate-500">
                  Pilihan metode bayar pelanggan (QRIS, VA Bank, E-Wallet)
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                {paymentMethodShare.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Belum ada transaksi</p>
                ) : (
                  paymentMethodShare.map(([methodName, count], idx) => {
                    const pct = Math.round((count / paidOrders.length) * 100);
                    return (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <span className="font-medium text-slate-800 truncate mr-2">{methodName}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono-numbers font-semibold text-slate-900">{count} transaksi</span>
                          <span className="text-[11px] font-mono-numbers bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DAFTAR TRANSAKSI & STATUS PESANAN */}
      {/* ========================================================================= */}
      {activeTab === 'pesanan' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Cari No. Invoice, Nama Pelanggan, atau Email..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto text-xs">
              <button
                onClick={() => setOrderStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  orderStatusFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Pesanan ({orders.length})
              </button>

              <button
                onClick={() => setOrderStatusFilter('MENUNGGU_PEMBAYARAN')}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  orderStatusFilter === 'MENUNGGU_PEMBAYARAN'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Belum Bayar
              </button>

              <button
                onClick={() => setOrderStatusFilter('DIPROSES')}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  orderStatusFilter === 'DIPROSES'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Diproses
              </button>

              <button
                onClick={() => setOrderStatusFilter('DIKIRIM')}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  orderStatusFilter === 'DIKIRIM'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Dikirim
              </button>

              <button
                onClick={() => setOrderStatusFilter('SELESAI')}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  orderStatusFilter === 'SELESAI'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Selesai
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Invoice & Tanggal</th>
                    <th className="py-3 px-4">Pelanggan</th>
                    <th className="py-3 px-4">Metode Bayar</th>
                    <th className="py-3 px-4 text-right">Total Tagihan</th>
                    <th className="py-3 px-4">Status Bayar</th>
                    <th className="py-3 px-4">Status Pesanan & Aksi</th>
                    <th className="py-3 px-4 text-center">Faktur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        Tidak ada transaksi ditemukan yang cocok dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    displayedOrders.map((order) => {
                      const isPaid = order.paymentStatus === 'SUDAH_DIBAYAR';
                      return (
                        <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-slate-900">{order.id}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{formatDate(order.createdAt)}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">{order.customerName}</div>
                            <div className="text-[11px] text-slate-500">{order.customerPhone}</div>
                            <div className="text-[11px] text-slate-400 truncate max-w-xs">{order.shippingAddress.city}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-800">{order.paymentMethod.name}</div>
                            <div className="text-[11px] text-slate-500">
                              {order.courier.courierName} ({order.courier.service})
                            </div>
                            {order.trackingNumber && (
                              <div className="font-mono text-[10px] text-emerald-700 font-semibold mt-0.5">
                                Resi: {order.trackingNumber}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono-numbers font-bold text-slate-900 text-sm">
                            {formatRupiah(order.total)}
                          </td>

                          <td className="py-3.5 px-4">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Lunas</span>
                              </span>
                            ) : (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  <Clock className="w-3 h-3" />
                                  <span>Menunggu</span>
                                </span>
                                <button
                                  onClick={() => simulatePayOrder(order.id)}
                                  className="block text-[10px] text-blue-600 hover:text-blue-800 underline cursor-pointer"
                                >
                                  Tandai Lunas (Manual)
                                </button>
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <select
                              value={order.orderStatus}
                              onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-medium focus:outline-none focus:bg-white cursor-pointer"
                            >
                              <option value="MENUNGGU_PEMBAYARAN">Menunggu Bayar</option>
                              <option value="DIPROSES">Diproses (Siap Kirim)</option>
                              <option value="DIKIRIM">Dikirim (Input Resi)</option>
                              <option value="SELESAI">Selesai</option>
                              <option value="DIBATALKAN">Dibatalkan</option>
                            </select>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => onViewInvoice(order)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Lihat & Cetak Faktur"
                            >
                              <Eye className="w-4 h-4" />
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: KATALOG PRODUK & MANAJEMEN INVENTARIS */}
      {/* ========================================================================= */}
      {activeTab === 'produk' && (
        <div className="space-y-4">
          {/* Product Header Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Daftar Inventaris Produk Toko
              </h3>
              <p className="text-xs text-slate-500">
                Ubah harga, tambah stok barang baru, atau hapus item dari katalog pembeli.
              </p>
            </div>

            <button
              onClick={() => setIsAddProductOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produk Baru</span>
            </button>
          </div>

          {/* Product Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Produk</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4 text-right">Harga Jual</th>
                    <th className="py-3 px-4 text-center">Stok</th>
                    <th className="py-3 px-4 text-center">Terjual</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((prod) => {
                    const isEditing = editingProductId === prod.id;
                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="font-semibold text-slate-900 line-clamp-1">{prod.name}</div>
                              {prod.badge && (
                                <span className="text-[10px] text-slate-500 font-medium">
                                  Tag: {prod.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {prod.categoryName}
                        </td>

                        <td className="py-3 px-4 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editingPriceVal}
                              onChange={(e) => setEditingPriceVal(Number(e.target.value))}
                              className="w-24 px-2 py-1 text-xs border border-slate-300 rounded text-right font-mono-numbers"
                            />
                          ) : (
                            <span className="font-mono-numbers font-bold text-slate-900">
                              {formatRupiah(prod.price)}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editingStockVal}
                              onChange={(e) => setEditingStockVal(Number(e.target.value))}
                              className="w-16 px-2 py-1 text-xs border border-slate-300 rounded text-center font-mono-numbers"
                            />
                          ) : (
                            <span className={`font-mono-numbers font-semibold px-2 py-0.5 rounded text-xs ${
                              prod.stock <= 5
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}>
                              {prod.stock} unit
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center font-mono-numbers font-medium text-slate-600">
                          {prod.soldCount || 0} unit
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {isEditing ? (
                              <button
                                onClick={() => {
                                  updateProduct(prod.id, {
                                    price: editingPriceVal,
                                    stock: editingStockVal,
                                  });
                                  setEditingProductId(null);
                                }}
                                className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold hover:bg-emerald-700"
                              >
                                Simpan
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingProductId(prod.id);
                                  setEditingPriceVal(prod.price);
                                  setEditingStockVal(prod.stock);
                                }}
                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Edit Stok & Harga"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (confirm(`Yakin ingin menghapus produk "${prod.name}"?`)) {
                                  deleteProduct(prod.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Produk"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INPUT NO RESI (SHIPPING TRACKING NUMBER) */}
      {resizingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-display">
              Input Nomor Resi Pengiriman
            </h3>
            <p className="text-xs text-slate-500">
              Pesanan #{resizingOrder.id} akan diubah statusnya menjadi <strong>DIKIRIM</strong> dengan kurir <strong>{resizingOrder.courier.courierName}</strong>.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nomor Resi / AWB Ekspedisi
              </label>
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="Contoh: JNEID99281923"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setResizingOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmTracking}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
              >
                Simpan & Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH PRODUK BARU */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 font-display">
              Tambah Produk Baru ke Katalog
            </h3>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nama Produk *</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="Contoh: Speaker Bluetooth Bass Booster"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Kategori *</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="elektronik">Elektronik & Gadget</option>
                    <option value="fashion">Fashion & Pakaian</option>
                    <option value="kuliner">Makanan & Kopi</option>
                    <option value="rumah-tangga">Rumah Tangga & Living</option>
                    <option value="kecantikan">Perawatan & Kecantikan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Stok Awal *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono-numbers"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Harga Jual (Rp) *</label>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Harga Coret (Opsional)</label>
                  <input
                    type="number"
                    value={newProdOriginalPrice}
                    onChange={(e) => setNewProdOriginalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono-numbers"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">URL Gambar Produk</label>
                <input
                  type="text"
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  placeholder="/src/assets/images/hero_marketplace_lifestyle_1790924877771.jpg"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Keterangan singkat mengenai bahan, garansi, keunggulan..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                >
                  Tambahkan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer Reset Tool */}
      <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 no-print gap-2">
        <span>Sistem Database Inventaris WarungPedia v1.0 · Tersimpan Lokal</span>
        <button
          onClick={() => {
            if (confirm('Kembalikan data produk dan transaksi pesanan ke contoh awal?')) {
              resetToDefaultData();
            }
          }}
          className="text-slate-500 hover:text-rose-600 underline cursor-pointer"
        >
          Reset Data Demo Awal
        </button>
      </div>
    </div>
  );
};
