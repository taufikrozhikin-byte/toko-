import React, { useState } from 'react';
import { Search, PackageCheck, Truck, CheckCircle2, Clock, Eye, AlertCircle, ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types/store';
import { formatRupiah, formatDate } from '../utils/format';

interface OrderTrackingViewProps {
  onViewInvoice: (order: Order) => void;
  onOpenPayment: (order: Order) => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  onViewInvoice,
  onOpenPayment,
}) => {
  const { orders, setCurrentView, currentUser, openLoginModal } = useStore();
  const [searchInput, setSearchInput] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // User's own orders if logged in
  const myOrders = currentUser
    ? orders.filter(
        (o) =>
          o.customerEmail.toLowerCase() === currentUser.email.toLowerCase() ||
          o.customerPhone === currentUser.phone
      )
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const query = searchInput.trim().toUpperCase();
    if (!query) return;

    const found = orders.find(
      (o) =>
        o.id.toUpperCase() === query ||
        o.customerPhone.includes(query) ||
        o.customerEmail.toLowerCase() === searchInput.trim().toLowerCase()
    );

    if (found) {
      setSearchedOrder(found);
    } else {
      setSearchedOrder(null);
      setErrorMsg(`Tidak ditemukan pesanan dengan nomor invoice "${searchInput}". Pastikan format sesuai (Contoh: INV-20261001-9124)`);
    }
  };

  // Recent 4 orders for quick selection
  const recentOrders = orders.slice(0, 4);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => setCurrentView('store')}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Berbelanja</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
            Lacak Status Pesanan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau status verifikasi pembayaran dan nomor resi pengiriman paket Anda secara langsung.
          </p>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Masukkan Nomor Invoice (Contoh: INV-20261001-9124) atau Nomor HP..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          >
            Lacak Pesanan
          </button>
        </form>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quick select recent order chips or User's own orders */}
        <div className="pt-2 border-t border-slate-100">
          {currentUser ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700">
                  Pesanan Terdaftar untuk Akun Anda ({currentUser.email}):
                </span>
                <span className="text-[10px] text-slate-400">
                  {myOrders.length} transaksi ditemukan
                </span>
              </div>
              {myOrders.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {myOrders.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => {
                        setSearchInput(o.id);
                        setSearchedOrder(o);
                        setErrorMsg(null);
                      }}
                      className={`text-xs font-mono px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                        searchedOrder?.id === o.id
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <span className="font-bold">{o.id}</span>
                      <span className="text-[10px] opacity-75">· {formatRupiah(o.total)}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Belum ada pesanan dengan email ini. Silakan belanja atau cek dengan nomor invoice.
                </p>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-slate-500">Pilih cepat pesanan demo:</span>
                <button
                  type="button"
                  onClick={() => openLoginModal()}
                  className="text-[11px] font-semibold text-slate-900 hover:underline"
                >
                  Masuk Akun untuk Melihat Pesanan Saya &rarr;
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentOrders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => {
                      setSearchInput(o.id);
                      setSearchedOrder(o);
                      setErrorMsg(null);
                    }}
                    className="text-xs font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {o.id} · {o.customerName}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Searched Order Result Card */}
      {searchedOrder && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs text-slate-400 block font-mono">Invoice #{searchedOrder.id}</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                Pesanan untuk {searchedOrder.customerName}
              </h3>
              <p className="text-xs text-slate-500">
                Tanggal: {formatDate(searchedOrder.createdAt)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewInvoice(searchedOrder)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Lihat Faktur</span>
              </button>

              {searchedOrder.paymentStatus === 'MENUNGGU_PEMBAYARAN' && (
                <button
                  onClick={() => onOpenPayment(searchedOrder)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Selesaikan Pembayaran</span>
                </button>
              )}
            </div>
          </div>

          {/* Progress Timeline Stepper */}
          <div className="py-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-4">
              Status Perjalanan Pesanan
            </span>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {/* Step 1 */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  searchedOrder.paymentStatus === 'SUDAH_DIBAYAR'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  1
                </div>
                <span className="font-semibold text-slate-900">Pembayaran</span>
                <span className="text-[10px] text-slate-500">
                  {searchedOrder.paymentStatus === 'SUDAH_DIBAYAR' ? 'Terverifikasi' : 'Menunggu Bayar'}
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  searchedOrder.orderStatus === 'DIPROSES' || searchedOrder.orderStatus === 'DIKIRIM' || searchedOrder.orderStatus === 'SELESAI'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  2
                </div>
                <span className="font-semibold text-slate-900">Diproses</span>
                <span className="text-[10px] text-slate-500">Pengepakan Toko</span>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  searchedOrder.orderStatus === 'DIKIRIM' || searchedOrder.orderStatus === 'SELESAI'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  3
                </div>
                <span className="font-semibold text-slate-900">Dalam Pengiriman</span>
                <span className="text-[10px] text-slate-500">
                  {searchedOrder.trackingNumber ? searchedOrder.trackingNumber : 'Kurir'}
                </span>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  searchedOrder.orderStatus === 'SELESAI'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  4
                </div>
                <span className="font-semibold text-slate-900">Selesai</span>
                <span className="text-[10px] text-slate-500">Paket Diterima</span>
              </div>
            </div>
          </div>

          {/* Details breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="font-semibold text-slate-800 block mb-1">Kurir & No. Resi:</span>
              <p className="text-slate-600">{searchedOrder.courier.courierName} ({searchedOrder.courier.service})</p>
              {searchedOrder.trackingNumber ? (
                <p className="text-slate-900 font-mono font-bold mt-1">
                  Resi: {searchedOrder.trackingNumber}
                </p>
              ) : (
                <p className="text-slate-400 italic mt-1">Nomor resi sedang dalam proses input pihak ekspedisi.</p>
              )}
            </div>

            <div>
              <span className="font-semibold text-slate-800 block mb-1">Metode & Nilai Bayar:</span>
              <p className="text-slate-600">{searchedOrder.paymentMethod.name}</p>
              <p className="text-slate-900 font-bold font-mono-numbers text-sm mt-1">
                {formatRupiah(searchedOrder.total)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
