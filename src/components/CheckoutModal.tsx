import React, { useState } from 'react';
import { X, MapPin, Truck, CreditCard, ShieldCheck, ArrowRight, Check, QrCode, Smartphone, HandCoins } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PAYMENT_METHODS, SHIPPING_COURIERS } from '../data/mockData';
import { PaymentOption, ShippingCourier, ShippingAddress, Order } from '../types/store';
import { formatRupiah, generateInvoiceNumber, generateVANumber } from '../utils/format';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  appliedVoucherCode?: string;
  initialDiscount?: number;
  onOrderCreated: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  appliedVoucherCode,
  initialDiscount = 0,
  onOrderCreated,
}) => {
  const { cart, cartSubtotal, placeOrder, currentUser, openLoginModal } = useStore();

  // Customer & Shipping Form
  const [address, setAddress] = useState<ShippingAddress>(() => ({
    recipientName: currentUser?.name || '',
    phone: currentUser?.phone || '',
    province: currentUser?.address?.province || 'DKI Jakarta',
    city: currentUser?.address?.city || 'Jakarta Selatan',
    district: currentUser?.address?.district || 'Kebayoran Baru',
    postalCode: currentUser?.address?.postalCode || '12160',
    fullAddress: currentUser?.address?.fullAddress || '',
  }));

  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [selectedCourier, setSelectedCourier] = useState<ShippingCourier>(SHIPPING_COURIERS[0]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentOption>(PAYMENT_METHODS[0]); // default QRIS
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Sync if user logs in while modal is open or changes
  React.useEffect(() => {
    if (currentUser) {
      setAddress((prev) => ({
        ...prev,
        recipientName: prev.recipientName || currentUser.name,
        phone: prev.phone || currentUser.phone,
        province: prev.province || currentUser.address?.province || 'DKI Jakarta',
        city: prev.city || currentUser.address?.city || 'Jakarta Selatan',
        district: prev.district || currentUser.address?.district || 'Kebayoran Baru',
        postalCode: prev.postalCode || currentUser.address?.postalCode || '12160',
        fullAddress: prev.fullAddress || currentUser.address?.fullAddress || '',
      }));
      setCustomerEmail((prev) => prev || currentUser.email);
    }
  }, [currentUser]);

  if (!isOpen || cart.length === 0) return null;

  const quickFillAddress = () => {
    setAddress({
      recipientName: 'Taufik Rozhikin',
      phone: '081234567890',
      province: 'DKI Jakarta',
      city: 'Jakarta Selatan',
      district: 'Tebet',
      postalCode: '12810',
      fullAddress: 'Jl. Saharjo No. 120B, RT 04 / RW 06',
    });
    setCustomerEmail('taufikrozhikin@gmail.com');
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!address.recipientName.trim()) errors.recipientName = 'Nama penerima wajib diisi';
    if (!address.phone.trim()) errors.phone = 'Nomor WhatsApp / HP wajib diisi';
    if (!address.fullAddress.trim()) errors.fullAddress = 'Alamat lengkap wajib diisi';
    if (!customerEmail.trim()) errors.email = 'Email wajib diisi';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const discount = initialDiscount;
  const shippingFee = selectedCourier.cost;
  const adminFee = selectedPayment.adminFee;
  const grandTotal = Math.max(0, cartSubtotal - discount + shippingFee + adminFee);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const invoiceId = generateInvoiceNumber();
    const isVA = selectedPayment.category === 'va';
    const vaNumber = isVA ? generateVANumber(selectedPayment.id) : undefined;

    const newOrder: Order = {
      id: invoiceId,
      createdAt: new Date().toISOString(),
      customerName: address.recipientName,
      customerEmail: customerEmail,
      customerPhone: address.phone,
      shippingAddress: address,
      items: [...cart],
      subtotal: cartSubtotal,
      shippingCost: shippingFee,
      courier: selectedCourier,
      discount: discount,
      voucherCode: appliedVoucherCode,
      adminFee: adminFee,
      total: grandTotal,
      paymentMethod: selectedPayment,
      paymentStatus: 'MENUNGGU_PEMBAYARAN',
      orderStatus: 'MENUNGGU_PEMBAYARAN',
      vaNumber: vaNumber,
      paymentExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 mins expiry
    };

    placeOrder(newOrder);
    onClose();
    onOrderCreated(newOrder);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Checkout & Pengiriman
            </h2>
            <p className="text-xs text-slate-500">
              Lengkapi data penerima dan pilih metode pembayaran favorit Anda
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} className="max-h-[80vh] overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* User Account / Quick Demo Pre-fill */}
          {currentUser ? (
            <div className="flex items-center justify-between bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2 text-xs text-emerald-900">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Masuk sebagai: <strong>{currentUser.name}</strong> ({currentUser.email})
                </span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                Akun Terverifikasi
              </span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-600">
                Sudah punya akun WarungPedia?
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openLoginModal()}
                  className="text-xs font-semibold text-slate-900 hover:underline"
                >
                  Masuk Akun
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={quickFillAddress}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-white border border-emerald-300 px-2.5 py-1 rounded-md transition-colors shadow-2xs cursor-pointer"
                >
                  Isi Otomatis (Demo)
                </button>
              </div>
            </div>
          )}

          {/* Section 1: Customer & Shipping Details */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-900">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Alamat Pengiriman Penerima</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Nama Penerima *
                </label>
                <input
                  type="text"
                  value={address.recipientName}
                  onChange={(e) => setAddress({ ...address, recipientName: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:outline-none focus:bg-white text-slate-900 ${
                    formErrors.recipientName ? 'border-rose-500' : 'border-slate-200'
                  }`}
                />
                {formErrors.recipientName && (
                  <span className="text-[10px] text-rose-600 mt-0.5 block">{formErrors.recipientName}</span>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Nomor Telepon / WhatsApp *
                </label>
                <input
                  type="tel"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  placeholder="08123456789"
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:outline-none focus:bg-white text-slate-900 ${
                    formErrors.phone ? 'border-rose-500' : 'border-slate-200'
                  }`}
                />
                {formErrors.phone && (
                  <span className="text-[10px] text-rose-600 mt-0.5 block">{formErrors.phone}</span>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Email Notifikasi & Invoice *
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="email@anda.com"
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:outline-none focus:bg-white text-slate-900 ${
                    formErrors.email ? 'border-rose-500' : 'border-slate-200'
                  }`}
                />
                {formErrors.email && (
                  <span className="text-[10px] text-rose-600 mt-0.5 block">{formErrors.email}</span>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Kota / Kabupaten
                </label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-medium mb-1">
                  Alamat Lengkap (Nama Jalan, No. Rumah, RT/RW, Patokan) *
                </label>
                <textarea
                  rows={2}
                  value={address.fullAddress}
                  onChange={(e) => setAddress({ ...address, fullAddress: e.target.value })}
                  placeholder="Jl. Merdeka No. 10 RT 02/05 (Rumah pagar hitam sebelah minimarket)"
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:outline-none focus:bg-white text-slate-900 ${
                    formErrors.fullAddress ? 'border-rose-500' : 'border-slate-200'
                  }`}
                />
                {formErrors.fullAddress && (
                  <span className="text-[10px] text-rose-600 mt-0.5 block">{formErrors.fullAddress}</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Courier Selection */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-900">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Pilih Kurir Ekspedisi Pengiriman</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SHIPPING_COURIERS.map((courier) => {
                const isSelected = selectedCourier.id === courier.id;
                return (
                  <div
                    key={courier.id}
                    onClick={() => setSelectedCourier(courier)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        <span>{courier.courierName}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                          isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {courier.etd}
                        </span>
                      </div>
                      <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {courier.service}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono-numbers font-bold text-xs">
                        {formatRupiah(courier.cost)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Payment Method Selection */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-900">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Metode Pembayaran Resmi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = selectedPayment.id === method.id;
                return (
                  <div
                    key={method.id}
                    onClick={() => setSelectedPayment(method)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600 text-slate-900'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                    }`}
                  >
                    <div className="mt-0.5 text-emerald-700">
                      {method.category === 'qris' && <QrCode className="w-4 h-4" />}
                      {method.category === 'va' && <CreditCard className="w-4 h-4" />}
                      {method.category === 'ewallet' && <Smartphone className="w-4 h-4" />}
                      {method.category === 'cod' && <HandCoins className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-900 truncate">
                          {method.name}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {method.description}
                      </p>
                      {method.adminFee > 0 ? (
                        <p className="text-[10px] text-slate-400 mt-1">
                          Biaya admin: {formatRupiah(method.adminFee)}
                        </p>
                      ) : (
                        <p className="text-[10px] text-emerald-700 font-medium mt-1">
                          Bebas biaya admin
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Order Summary and Grand Total */}
          <div className="pt-2 border-t border-slate-200 bg-slate-50 p-4 rounded-xl space-y-2 text-xs">
            <div className="font-semibold text-slate-900 mb-1">Ringkasan Pembayaran</div>
            <div className="flex justify-between text-slate-600">
              <span>Subtotal ({cart.reduce((t, i) => t + i.quantity, 0)} barang)</span>
              <span className="font-mono-numbers font-medium">{formatRupiah(cartSubtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Potongan Promo ({appliedVoucherCode || 'VOUCHER'})</span>
                <span className="font-mono-numbers font-medium">-{formatRupiah(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Ongkos Kirim ({selectedCourier.courierName})</span>
              <span className="font-mono-numbers font-medium">{formatRupiah(shippingFee)}</span>
            </div>
            {adminFee > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Biaya Transaksi / Admin</span>
                <span className="font-mono-numbers font-medium">{formatRupiah(adminFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-950 pt-2 border-t border-slate-200">
              <span>Total Tagihan Pembayaran</span>
              <span className="font-mono-numbers text-base text-emerald-700">
                {formatRupiah(grandTotal)}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Konfirmasi & Buat Tagihan Pembayaran</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              Sistem pembayaran terenkripsi aman. Nomor invoice akan langsung diterbitkan.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
