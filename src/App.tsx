import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { StorefrontView } from './components/StorefrontView';
import { AdminDashboard } from './components/AdminDashboard';
import { OrderTrackingView } from './components/OrderTrackingView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { PaymentSimulator } from './components/PaymentSimulator';
import { InvoiceModal } from './components/InvoiceModal';
import { AuthModal } from './components/AuthModal';
import { Order } from './types/store';

const MainAppContent: React.FC = () => {
  const {
    currentView,
    selectedProduct,
    setSelectedProduct,
    isCheckoutOpen,
    setIsCheckoutOpen,
  } = useStore();

  const [checkoutVoucher, setCheckoutVoucher] = useState<{
    code?: string;
    discount?: number;
  }>({});

  const [activePaymentOrder, setActivePaymentOrder] = useState<Order | null>(null);
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<Order | null>(null);

  const handleStartCheckout = (code?: string, discount?: number) => {
    setCheckoutVoucher({ code, discount });
    setIsCheckoutOpen(true);
  };

  const handleOrderCreated = (order: Order) => {
    setActivePaymentOrder(order);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] flex flex-col text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'store' && <StorefrontView />}
        {currentView === 'admin' && (
          <AdminDashboard
            onViewInvoice={(order) => setActiveInvoiceOrder(order)}
          />
        )}
        {currentView === 'order-tracking' && (
          <OrderTrackingView
            onViewInvoice={(order) => setActiveInvoiceOrder(order)}
            onOpenPayment={(order) => setActivePaymentOrder(order)}
          />
        )}
      </main>

      {/* Modals and Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <CartDrawer onCheckout={handleStartCheckout} />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        appliedVoucherCode={checkoutVoucher.code}
        initialDiscount={checkoutVoucher.discount}
        onOrderCreated={handleOrderCreated}
      />

      {activePaymentOrder && (
        <PaymentSimulator
          order={activePaymentOrder}
          onClose={() => setActivePaymentOrder(null)}
          onViewInvoice={(order) => {
            setActivePaymentOrder(null);
            setActiveInvoiceOrder(order);
          }}
        />
      )}

      {activeInvoiceOrder && (
        <InvoiceModal
          order={activeInvoiceOrder}
          onClose={() => setActiveInvoiceOrder(null)}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainAppContent />
    </StoreProvider>
  );
}
