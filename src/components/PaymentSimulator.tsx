import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Copy, Check, Clock, QrCode, CreditCard, ArrowRight, ShieldCheck, Printer, AlertTriangle } from 'lucide-react';
import { Order } from '../types/store';
import { formatRupiah, formatDate } from '../utils/format';
import { useStore } from '../context/StoreContext';

interface PaymentSimulatorProps {
  order: Order | null;
  onClose: () => void;
  onViewInvoice: (order: Order) => void;
}

export const PaymentSimulator: React.FC<PaymentSimulatorProps> = ({
  order,
  onClose,
  onViewInvoice,
}) => {
  const { simulatePayOrder, orders } = useStore();
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(899); // 14 mins 59 secs
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync with current order in context in case status changed
  const currentOrder = orders.find((o) => o.id === order?.id) || order;

  useEffect(() => {
    if (!currentOrder || currentOrder.paymentStatus === 'SUDAH_DIBAYAR') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentOrder]);

  if (!currentOrder) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isPaid = currentOrder.paymentStatus === 'SUDAH_DIBAYAR';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      simulatePayOrder(currentOrder.id);
      setIsProcessing(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            {isPaid ? (
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            ) : (
              <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
            )}
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                {isPaid ? 'Pembayaran Berhasil Dikonfirmasi' : 'Menunggu Pembayaran'}
              </h2>
              <p className="text-[11px] text-slate-500 font-mono-numbers">
                Invoice: {currentOrder.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* PAID STATE */}
          {isPaid ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-bold font-display text-slate-900">
                  Terima Kasih, Pesanan Anda Diproses!
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  Pembayaran sebesar <span className="font-bold text-slate-900 font-mono-numbers">{formatRupiah(currentOrder.total)}</span> telah berhasil diterima via {currentOrder.paymentMethod.name}.
                </p>
              </div>

              {/* Order Info Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nomor Invoice</span>
                  <span className="font-mono font-semibold text-slate-900">{currentOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Penerima</span>
                  <span className="font-medium text-slate-900">{currentOrder.shippingAddress.recipientName} ({currentOrder.shippingAddress.phone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Metode Pengiriman</span>
                  <span className="font-medium text-slate-900">{currentOrder.courier.courierName} - {currentOrder.courier.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status Pesanan</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Sedang Dipersiapkan Penjual
                  </span>
                </div>
              </div>

              {/* Success Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => onViewInvoice(currentOrder)}
                  className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Lihat & Cetak Invoice Resmi</span>
                </button>
                <button
                  onClick={onClose}
                  className="py-3 px-5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Kembali ke Toko
                </button>
              </div>
            </div>
          ) : (
            /* UNPAID / WAITING PAYMENT STATE */
            <>
              {/* Expiry countdown banner */}
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Selesaikan pembayaran dalam:</span>
                </div>
                <span className="font-mono font-bold text-sm text-amber-800 tabular-nums">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>

              {/* Total Amount Card */}
              <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500">Total yang Harus Dibayar</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono-numbers mt-1">
                  {formatRupiah(currentOrder.total)}
                </div>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Metode: <strong className="text-slate-800">{currentOrder.paymentMethod.name}</strong>
                </span>
              </div>

              {/* CHANNEL SPECIFIC INSTRUCTIONS */}
              {currentOrder.paymentMethod.category === 'qris' && (
                <div className="text-center space-y-3">
                  <p className="text-xs text-slate-600">
                    Scan QRIS menggunakan aplikasi Mobile Banking atau E-Wallet apa saja:
                  </p>

                  {/* QRIS SVG Dynamic Code Display */}
                  <div className="inline-block p-4 bg-white rounded-2xl border-2 border-slate-900 shadow-md">
                    <svg className="w-44 h-44 mx-auto" viewBox="0 0 100 100">
                      {/* Realistic styled QR Code graphic */}
                      <rect width="100" height="100" fill="#FFFFFF" />
                      {/* Top Left Marker */}
                      <rect x="10" y="10" width="24" height="24" fill="#0F172A" rx="2" />
                      <rect x="14" y="14" width="16" height="16" fill="#FFFFFF" />
                      <rect x="18" y="18" width="8" height="8" fill="#0F172A" />
                      {/* Top Right Marker */}
                      <rect x="66" y="10" width="24" height="24" fill="#0F172A" rx="2" />
                      <rect x="70" y="14" width="16" height="16" fill="#FFFFFF" />
                      <rect x="74" y="18" width="8" height="8" fill="#0F172A" />
                      {/* Bottom Left Marker */}
                      <rect x="10" y="66" width="24" height="24" fill="#0F172A" rx="2" />
                      <rect x="14" y="70" width="16" height="16" fill="#FFFFFF" />
                      <rect x="18" y="74" width="8" height="8" fill="#0F172A" />
                      {/* Random Data Pattern Dots */}
                      <rect x="38" y="12" width="4" height="8" fill="#0F172A" />
                      <rect x="46" y="12" width="6" height="4" fill="#0F172A" />
                      <rect x="56" y="14" width="4" height="6" fill="#0F172A" />
                      <rect x="38" y="24" width="8" height="4" fill="#0F172A" />
                      <rect x="50" y="22" width="8" height="6" fill="#0F172A" />
                      <rect x="12" y="38" width="8" height="4" fill="#0F172A" />
                      <rect x="24" y="42" width="6" height="6" fill="#0F172A" />
                      <rect x="36" y="38" width="6" height="6" fill="#10B981" />
                      <rect x="44" y="44" width="12" height="12" fill="#0F172A" rx="2" />
                      <rect x="60" y="38" width="8" height="4" fill="#0F172A" />
                      <rect x="72" y="40" width="6" height="8" fill="#0F172A" />
                      <rect x="82" y="42" width="6" height="6" fill="#0F172A" />
                      <rect x="38" y="66" width="4" height="12" fill="#0F172A" />
                      <rect x="46" y="62" width="8" height="6" fill="#0F172A" />
                      <rect x="58" y="68" width="6" height="10" fill="#0F172A" />
                      <rect x="68" y="66" width="12" height="4" fill="#0F172A" />
                      <rect x="84" y="70" width="4" height="8" fill="#0F172A" />
                      <rect x="40" y="82" width="8" height="6" fill="#0F172A" />
                      <rect x="52" y="80" width="12" height="6" fill="#0F172A" />
                      <rect x="68" y="84" width="8" height="6" fill="#0F172A" />
                      <rect x="80" y="82" width="8" height="6" fill="#0F172A" />
                    </svg>
                    <div className="mt-1 flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-800 tracking-wider">
                      <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                      <span>QRIS STANDAR NASIONAL</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    NMID: ID1029384729104 · PT WarungPedia Digital
                  </p>
                </div>
              )}

              {currentOrder.paymentMethod.category === 'va' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 block mb-1">
                      Nomor Virtual Account {currentOrder.paymentMethod.name}
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-lg sm:text-xl font-mono font-bold text-slate-900 tracking-wider">
                        {currentOrder.vaNumber || '8801283910294821'}
                      </span>
                      <button
                        onClick={() => handleCopy(currentOrder.vaNumber || '8801283910294821')}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Salin No. VA</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Transfer steps */}
                  <div className="text-xs text-slate-600 space-y-1.5 bg-white p-3 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-900 block mb-1">
                      Cara Pembayaran via Mobile Banking:
                    </span>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>Buka aplikasi m-Banking Anda, pilih menu <strong>Transfer &gt; Virtual Account</strong>.</li>
                      <li>Masukkan Nomor Virtual Account di atas.</li>
                      <li>Periksa nama penerima: <strong>WarungPedia - {currentOrder.customerName}</strong>.</li>
                      <li>Pastikan nominal sesuai: <strong>{formatRupiah(currentOrder.total)}</strong>.</li>
                      <li>Masukkan PIN m-Banking Anda. Transaksi akan terverifikasi seketika.</li>
                    </ol>
                  </div>
                </div>
              )}

              {currentOrder.paymentMethod.category === 'ewallet' && (
                <div className="text-center p-4 space-y-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-xs border border-slate-200 text-emerald-600">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Konfirmasi Pembayaran di Aplikasi {currentOrder.paymentMethod.name}
                  </h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Notifikasi tagihan telah dikirimkan ke nomor terdaftar Anda <strong>{currentOrder.customerPhone}</strong>. Tekan tombol simulasi di bawah untuk verifikasi pembayaran.
                  </p>
                </div>
              )}

              {currentOrder.paymentMethod.category === 'cod' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Pesanan Cash on Delivery (COD)</span>
                  </div>
                  <p>
                    Siapkan uang pas sebesar <strong>{formatRupiah(currentOrder.total)}</strong> untuk diserahkan kepada kurir pengantar saat paket tiba di alamat Anda.
                  </p>
                </div>
              )}

              {/* SIMULATION TRIGGER FOR PROTOTYPE/TESTING */}
              <div className="pt-2 border-t border-slate-200">
                <button
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-75"
                >
                  {isProcessing ? (
                    <span>Memverifikasi Pembayaran Otomatis...</span>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Simulasikan Pembayaran Berhasil (Uji Coba)</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  Fitur simulasi langsung mengubah status pembayaran menjadi LUNAS dan mencatatnya ke Laporan Penjualan Admin.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
