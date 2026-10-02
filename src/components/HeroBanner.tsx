import React from 'react';
import { ArrowRight, ShieldCheck, Truck, QrCode, Sparkles } from 'lucide-react';
import { HERO_IMAGE } from '../data/mockData';

interface HeroBannerProps {
  onExploreClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreClick }) => {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white rounded-2xl mx-4 sm:mx-6 lg:mx-8 my-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px] lg:min-h-[440px]">
        {/* Left Column: Headline and Action */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between z-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-400 uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Katalog Lengkap · Kualitas Terkurasi</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-white max-w-xl text-balance leading-tight">
              Belanja Segala Kebutuhan dengan Nyaman & Aman.
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-lg leading-relaxed">
              Dari gadget audio mutakhir, kopi single origin nusantara, busana kasual ramah lingkungan hingga perlengkapan esensial rumah tangga. Didukung sistem checkout dan pembayaran instan.
            </p>
          </div>

          <div className="mt-8 pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onExploreClick}
                className="px-5 py-3 text-xs sm:text-sm font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-md flex items-center gap-2 group cursor-pointer"
              >
                <span>Jelajahi Produk Pilihan</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="text-xs text-slate-400 flex items-center gap-2 px-3 py-2">
                <span>Voucher aktif:</span>
                <span className="font-mono text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                  HEMAT20
                </span>
              </div>
            </div>

            {/* Proof Points */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">Kirim Seluruh RI</span>
              </div>
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">QRIS & VA Bank</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">100% Original</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Image */}
        <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full">
          <img
            src={HERO_IMAGE}
            alt="Koleksi Produk WarungPedia"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
};
