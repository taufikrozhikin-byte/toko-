import React, { useState } from 'react';
import { Star, Plus, Check, ShoppingBag, Eye } from 'lucide-react';
import { Product } from '../types/store';
import { formatRupiah } from '../utils/format';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, setSelectedProduct } = useStore();
  const [imageError, setImageError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <article
      onClick={() => setSelectedProduct(product)}
      className="group bg-white rounded-xl border border-slate-200/90 overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* 4:3 Image Showcase Container with fallback */}
      <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
        {!imageError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-100 text-slate-400">
            <ShoppingBag className="w-8 h-8 mb-1 text-slate-300" />
            <span className="text-xs">{product.categoryName}</span>
          </div>
        )}

        {/* Quiet top corner badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          {product.badge && (
            <span className="bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded uppercase">
              {product.badge}
            </span>
          )}
          {discountPercent && discountPercent > 0 && (
            <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded font-mono-numbers">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Quick view button on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedProduct(product);
          }}
          className="absolute bottom-2.5 right-2.5 p-2 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          title="Lihat Spesifikasi Lengkap"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata without pills: quiet inline text with dot separator */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            <span className="font-medium text-slate-600">{product.categoryName}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-0.5 text-amber-600 font-medium">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{product.rating.toFixed(1)}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>{product.soldCount} terjual</span>
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-base font-bold text-slate-900 font-mono-numbers tracking-tight">
              {formatRupiah(product.price)}
            </div>
            {product.originalPrice && (
              <div className="text-xs text-slate-400 line-through font-mono-numbers">
                {formatRupiah(product.originalPrice)}
              </div>
            )}
          </div>

          {/* Add to cart action button */}
          <button
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              product.stock <= 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </>
            ) : product.stock <= 0 ? (
              <span>Habis</span>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Beli</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
