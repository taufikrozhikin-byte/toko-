import React, { useState } from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, Tag, Check, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatRupiah } from '../utils/format';
import { VOUCHERS } from '../data/mockData';

interface CartDrawerProps {
  onCheckout: (appliedVoucherCode?: string, discountAmount?: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    clearCart,
  } = useStore();

  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discount: number;
    description: string;
  } | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError(null);
    const code = voucherInput.trim().toUpperCase();
    const found = VOUCHERS.find((v) => v.code === code);

    if (!found) {
      setVoucherError('Kode voucher tidak valid');
      return;
    }

    if (cartSubtotal < found.minSpend) {
      setVoucherError(`Minimal belanja ${formatRupiah(found.minSpend)} untuk voucher ini`);
      return;
    }

    let discount = 0;
    if (found.discountType === 'percentage') {
      discount = (cartSubtotal * found.discountValue) / 100;
      if (found.maxDiscount && discount > found.maxDiscount) {
        discount = found.maxDiscount;
      }
    } else {
      discount = found.discountValue;
    }

    setAppliedVoucher({
      code: found.code,
      discount,
      description: found.description,
    });
    setVoucherInput('');
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherError(null);
  };

  const discountAmount = appliedVoucher ? appliedVoucher.discount : 0;
  const finalTotal = Math.max(0, cartSubtotal - discountAmount);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-slate-800" />
            <h2 className="text-base font-bold text-slate-900 font-display">
              Keranjang Belanja
            </h2>
            <span className="text-xs text-slate-500 font-mono-numbers">
              ({cart.reduce((n, i) => n + i.quantity, 0)} barang)
            </span>
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-slate-500 hover:text-rose-600 transition-colors"
              >
                Kosongkan
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Tutup Keranjang"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Itemized List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-slate-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <ShoppingBag className="w-12 h-12 text-slate-300 mb-3 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-700">Keranjang masih kosong</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Pilih produk favorit Anda dari katalog dan tambahkan ke keranjang untuk memesan.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="py-3.5 first:pt-0 flex gap-3">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded-lg border border-slate-200 bg-slate-50 shrink-0"
                  referrerPolicy="no-referrer"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs font-bold text-slate-900 font-mono-numbers mt-0.5">
                      {formatRupiah(item.product.price)}
                    </p>
                    {item.notes && (
                      <p className="text-[10px] text-slate-500 italic mt-0.5 truncate">
                        Catatan: "{item.notes}"
                      </p>
                    )}
                  </div>

                  {/* Quantity Stepper and Delete */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-slate-200 rounded-md bg-slate-50">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        -
                      </button>
                      <span className="px-2 py-0.5 text-xs font-bold text-slate-900 font-mono-numbers">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Hapus dari keranjang"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Bottom / Checkout Footer */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/70 space-y-3">
            {/* Voucher Code Form */}
            {!appliedVoucher ? (
              <form onSubmit={handleApplyVoucher} className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value)}
                      placeholder="Gunakan Kode Voucher (HEMAT20)"
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 uppercase placeholder:normal-case placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Terapkan
                  </button>
                </div>
                {voucherError && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{voucherError}</span>
                  </p>
                )}
              </form>
            ) : (
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-semibold">{appliedVoucher.code}</span>
                  <span className="text-emerald-700">· Hemat {formatRupiah(appliedVoucher.discount)}</span>
                </div>
                <button
                  onClick={handleRemoveVoucher}
                  className="text-xs font-medium text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                >
                  Batal
                </button>
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs pt-1">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Produk</span>
                <span className="font-mono-numbers font-medium">{formatRupiah(cartSubtotal)}</span>
              </div>
              {appliedVoucher && (
                <div className="flex justify-between text-emerald-700">
                  <span>Diskon Promo ({appliedVoucher.code})</span>
                  <span className="font-mono-numbers font-medium">-{formatRupiah(appliedVoucher.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Belanja</span>
                <span className="font-mono-numbers text-base text-slate-950">
                  {formatRupiah(finalTotal)}
                </span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={() => {
                setIsCartOpen(false);
                onCheckout(appliedVoucher?.code, discountAmount);
              }}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <span>Lanjut ke Pembayaran</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
