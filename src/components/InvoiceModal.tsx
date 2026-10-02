import React from 'react';
import { X, Printer, CheckCircle, Clock, Truck, ShieldCheck } from 'lucide-react';
import { Order } from '../types/store';
import { formatRupiah, formatDate } from '../utils/format';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPaid = order.paymentStatus === 'SUDAH_DIBAYAR';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Faktur Tagihan / Invoice Resmi</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-900 bg-white" id="invoice-printable">
          {/* Header Zone */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="text-2xl font-black font-display tracking-tight text-slate-900">
                Warung<span className="text-emerald-600">Pedia</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                PT WarungPedia Niaga Nusantara<br />
                Kawasan Niaga Sudirman Lt. 18, Jakarta 12190<br />
                help@warungpedia.id · 021-5082-9900
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Nomor Invoice</span>
              <div className="text-lg font-mono font-bold text-slate-900">
                {order.id}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Tanggal: {formatDate(order.createdAt)}
              </p>
              {order.paidAt && (
                <p className="text-xs text-emerald-700 font-medium">
                  Dibayar: {formatDate(order.paidAt)}
                </p>
              )}
            </div>
          </div>

          {/* Customer & Shipping info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1">
                Tujuan Pengiriman:
              </span>
              <div className="font-semibold text-slate-900">{order.customerName}</div>
              <div className="text-slate-600">{order.customerPhone} · {order.customerEmail}</div>
              <div className="text-slate-600 mt-1 leading-relaxed">
                {order.shippingAddress.fullAddress}<br />
                {order.shippingAddress.district}, {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1">
                  Info Ekspedisi & Status:
                </span>
                <div className="flex items-center gap-1.5 font-medium text-slate-800">
                  <Truck className="w-3.5 h-3.5 text-slate-500" />
                  <span>{order.courier.courierName} ({order.courier.service})</span>
                </div>
                {order.trackingNumber ? (
                  <div className="mt-1 font-mono text-[11px] text-slate-700">
                    No. Resi: <strong className="text-slate-900">{order.trackingNumber}</strong>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 mt-1 italic">
                    No. Resi akan diinput setelah barang diserahkan ke kurir
                  </div>
                )}
              </div>

              {/* Status Stamp */}
              <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Status Pembayaran:</span>
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${
                  isPaid 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {isPaid ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  <span>{isPaid ? 'LUNAS' : 'MENUNGGU PEMBAYARAN'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-500">
                  <th className="py-2.5 font-semibold">Produk</th>
                  <th className="py-2.5 font-semibold text-center">Jumlah</th>
                  <th className="py-2.5 font-semibold text-right">Harga Satuan</th>
                  <th className="py-2.5 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="py-2.5">
                    <td className="py-2.5 pr-2">
                      <div className="font-semibold text-slate-900">{item.product.name}</div>
                      <div className="text-[10px] text-slate-400">{item.product.categoryName}</div>
                      {item.notes && (
                        <div className="text-[10px] text-slate-500 italic mt-0.5">Catatan: {item.notes}</div>
                      )}
                    </td>
                    <td className="py-2.5 text-center font-mono-numbers">{item.quantity}</td>
                    <td className="py-2.5 text-right font-mono-numbers">{formatRupiah(item.product.price)}</td>
                    <td className="py-2.5 text-right font-bold text-slate-900 font-mono-numbers">
                      {formatRupiah(item.product.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Calculation */}
          <div className="border-t border-slate-200 pt-4 flex flex-col items-end text-xs space-y-1.5">
            <div className="w-full max-w-xs flex justify-between text-slate-600">
              <span>Subtotal Produk:</span>
              <span className="font-mono-numbers">{formatRupiah(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="w-full max-w-xs flex justify-between text-emerald-700">
                <span>Diskon Promosi ({order.voucherCode || 'VOUCHER'}):</span>
                <span className="font-mono-numbers">-{formatRupiah(order.discount)}</span>
              </div>
            )}
            <div className="w-full max-w-xs flex justify-between text-slate-600">
              <span>Ongkos Kirim ({order.courier.courierName}):</span>
              <span className="font-mono-numbers">{formatRupiah(order.shippingCost)}</span>
            </div>
            {order.adminFee > 0 && (
              <div className="w-full max-w-xs flex justify-between text-slate-600">
                <span>Biaya Transaksi / Admin:</span>
                <span className="font-mono-numbers">{formatRupiah(order.adminFee)}</span>
              </div>
            )}
            <div className="w-full max-w-xs flex justify-between text-sm font-extrabold text-slate-950 pt-2 border-t border-slate-300">
              <span>Total Tagihan:</span>
              <span className="font-mono-numbers text-base text-emerald-700">{formatRupiah(order.total)}</span>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Terima kasih telah berbelanja di WarungPedia. Invoice ini sah dan diproses otomatis oleh komputer tanpa tanda tangan basah.
          </div>
        </div>
      </div>
    </div>
  );
};
