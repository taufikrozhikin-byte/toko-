import React, { useState } from 'react';
import { X, Star, ShoppingBag, Check, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Product } from '../types/store';
import { formatRupiah } from '../utils/format';
import { useStore } from '../context/StoreContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<string>('Standard');
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant, notes);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 900);
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Tutup Detail Produk"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[90vh] overflow-y-auto">
          {/* Left Column: Image Gallery View */}
          <div className="md:col-span-6 bg-slate-50 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white border border-slate-200/80 shadow-xs">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Product Guarantees */}
            <div className="mt-6 pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-2 text-center text-xs text-slate-500">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-slate-700">100% Asli</span>
                <span className="text-[10px] text-slate-400">Garansi Toko</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-slate-700">Kirim Aman</span>
                <span className="text-[10px] text-slate-400">Bubble Wrap Tebal</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-slate-700">Retur 7 Hari</span>
                <span className="text-[10px] text-slate-400">Bila Cacat Pabrik</span>
              </div>
            </div>
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Unboxed Metadata */}
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <span className="font-medium text-emerald-700">{product.categoryName}</span>
                <span>·</span>
                <div className="flex items-center gap-1 text-amber-600 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{product.rating.toFixed(1)}</span>
                </div>
                <span>·</span>
                <span>{product.reviewCount} ulasan pembeli</span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 leading-snug">
                {product.name}
              </h2>

              {/* Pricing Section */}
              <div className="mt-4 flex items-baseline gap-3 pb-4 border-b border-slate-100">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono-numbers">
                  {formatRupiah(product.price)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-sm text-slate-400 line-through font-mono-numbers">
                      {formatRupiah(product.originalPrice)}
                    </span>
                    <span className="text-xs font-bold text-rose-600 font-mono-numbers bg-rose-50 px-1.5 py-0.5 rounded">
                      Hemat {discountPercent}%
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <div className="mt-4">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Key Features */}
              {product.features && product.features.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                    Keunggulan Produk
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc marker:text-emerald-600">
                    {product.features.map((feat, idx) => (
                      <li key={idx}>{feat}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specifications */}
              {product.specifications && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                    Spesifikasi Teknis
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-slate-400">{key}</span>
                        <span className="font-medium text-slate-800">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes Input */}
              <div className="mt-4">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Catatan untuk Penjual (Opsional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Tolong bungkus bubble wrap tebal, warna hitam..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="text-slate-500 font-medium">Ketersediaan Stok:</span>
                <span className={`font-semibold ${product.stock < 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {product.stock > 0 ? `Sedia ${product.stock} unit` : 'Stok Habis'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-xs font-bold text-slate-900 font-mono-numbers">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Primary Buy CTA */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : product.stock <= 0
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-98 shadow-md'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Berhasil Ditambahkan!</span>
                    </>
                  ) : product.stock <= 0 ? (
                    <span>Stok Habis</span>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Tambah ke Keranjang · {formatRupiah(product.price * quantity)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
