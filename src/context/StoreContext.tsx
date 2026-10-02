import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, OrderStatus, ProductCategory, User, UserRole } from '../types/store';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from '../data/mockData';

interface RegisteredAccount extends User {
  password: string;
}

const DEFAULT_ACCOUNTS: RegisteredAccount[] = [
  {
    id: 'usr-admin-1',
    name: 'Administrator WarungPedia',
    email: 'admin@warungpedia.id',
    phone: '081299008877',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00Z',
    password: 'admin123',
    address: {
      recipientName: 'Admin WarungPedia',
      phone: '081299008877',
      province: 'DKI Jakarta',
      city: 'Jakarta Selatan',
      district: 'Kebayoran Baru',
      postalCode: '12160',
      fullAddress: 'Kawasan Niaga Sudirman Lt. 18',
    },
  },
  {
    id: 'usr-cust-1',
    name: 'Budi Santoso',
    email: 'budi.santoso@gmail.com',
    phone: '081289345678',
    role: 'customer',
    createdAt: '2026-05-15T00:00:00Z',
    password: 'budi123',
    address: {
      recipientName: 'Budi Santoso',
      phone: '081289345678',
      province: 'DKI Jakarta',
      city: 'Jakarta Selatan',
      district: 'Kebayoran Baru',
      postalCode: '12160',
      fullAddress: 'Jl. Senopati No. 42B',
    },
  },
];

interface StoreContextType {
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  activeCategory: ProductCategory;
  searchQuery: string;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  selectedProduct: Product | null;
  selectedOrderId: string | null;
  currentView: 'store' | 'admin' | 'order-tracking';
  
  // Auth State & Actions
  currentUser: User | null;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  setIsAuthModalOpen: (open: boolean) => void;
  setAuthModalMode: (mode: 'login' | 'register') => void;
  openLoginModal: () => void;
  openRegisterModal: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, phone: string, password: string, role?: UserRole) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  
  // Cart Actions
  addToCart: (product: Product, quantity?: number, selectedVariant?: string, notes?: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  
  // Navigation & UI
  setActiveCategory: (cat: ProductCategory) => void;
  setSearchQuery: (query: string) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setSelectedProduct: (product: Product | null) => void;
  setSelectedOrderId: (id: string | null) => void;
  setCurrentView: (view: 'store' | 'admin' | 'order-tracking') => void;
  
  // Order & Payment Actions
  placeOrder: (order: Order) => void;
  simulatePayOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string) => void;
  
  // Product Management (Admin)
  addProduct: (product: Omit<Product, 'id' | 'soldCount' | 'rating' | 'reviewCount'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  resetToDefaultData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'warungpedia_products_v1',
  ORDERS: 'warungpedia_orders_v1',
  CART: 'warungpedia_cart_v1',
  CURRENT_USER: 'warungpedia_current_user_v1',
  ACCOUNTS: 'warungpedia_accounts_v1',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User Accounts & Authentication State
  const [accounts, setAccounts] = useState<RegisteredAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      return saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS;
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const [activeCategory, setActiveCategory] = useState<ProductCategory>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'store' | 'admin' | 'order-tracking'>('store');

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Failed saving products to storage', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed saving orders to storage', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed saving cart to storage', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    } catch (e) {
      console.error('Failed saving accounts to storage', e);
    }
  }, [accounts]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch (e) {
      console.error('Failed saving current user to storage', e);
    }
  }, [currentUser]);

  // Auth Operations
  const openLoginModal = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
  };

  const login = async (emailOrPhone: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    const trimmedInput = emailOrPhone.trim().toLowerCase();
    const account = accounts.find(
      (a) => a.email.toLowerCase() === trimmedInput || a.phone === emailOrPhone.trim()
    );

    if (!account) {
      return { success: false, message: 'Akun dengan email atau nomor HP tersebut belum terdaftar.' };
    }

    if (account.password !== pass) {
      return { success: false, message: 'Kata sandi salah. Silakan coba kembali.' };
    }

    // Extract user without password
    const { password: _, ...userSafe } = account;
    setCurrentUser(userSafe);
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    pass: string,
    role: UserRole = 'customer'
  ): Promise<{ success: boolean; message?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const existing = accounts.find(
      (a) => a.email.toLowerCase() === trimmedEmail || a.phone === phone.trim()
    );

    if (existing) {
      return { success: false, message: 'Email atau Nomor HP sudah terdaftar. Silakan login.' };
    }

    const newAccount: RegisteredAccount = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: trimmedEmail,
      phone: phone.trim(),
      role: role,
      createdAt: new Date().toISOString(),
      password: pass,
      address: {
        recipientName: name.trim(),
        phone: phone.trim(),
        province: 'DKI Jakarta',
        city: 'Jakarta Selatan',
        district: 'Kebayoran Baru',
        postalCode: '12160',
        fullAddress: '',
      },
    };

    setAccounts((prev) => [...prev, newAccount]);

    const { password: _, ...userSafe } = newAccount;
    setCurrentUser(userSafe);
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    if (currentView === 'admin') {
      setCurrentView('store');
    }
  };

  // Cart calculations
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  const addToCart = (product: Product, quantity = 1, selectedVariant?: string, notes?: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = Math.min(next[existingIndex].quantity + quantity, product.stock);
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: newQty,
          selectedVariant: selectedVariant || next[existingIndex].selectedVariant,
          notes: notes || next[existingIndex].notes,
        };
        return next;
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stock), selectedVariant, notes }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity: Math.min(quantity, item.product.stock) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const placeOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    // Reduce product stock and increment sold count
    setProducts((prev) =>
      prev.map((prod) => {
        const cartMatch = newOrder.items.find((item) => item.product.id === prod.id);
        if (cartMatch) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - cartMatch.quantity),
            soldCount: (prod.soldCount || 0) + cartMatch.quantity,
          };
        }
        return prod;
      })
    );
    clearCart();
    setSelectedOrderId(newOrder.id);
  };

  const simulatePayOrder = (orderId: string) => {
    const nowIso = new Date().toISOString();
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            paymentStatus: 'SUDAH_DIBAYAR',
            orderStatus: order.orderStatus === 'MENUNGGU_PEMBAYARAN' ? 'DIPROSES' : order.orderStatus,
            paidAt: nowIso,
          };
        }
        return order;
      })
    );
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, trackingNumber?: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            orderStatus: status,
            trackingNumber: trackingNumber !== undefined ? trackingNumber : order.trackingNumber,
          };
        }
        return order;
      })
    );
  };

  const addProduct = (productData: Omit<Product, 'id' | 'soldCount' | 'rating' | 'reviewCount'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      soldCount: 0,
      rating: 5.0,
      reviewCount: 1,
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const resetToDefaultData = () => {
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setAccounts(DEFAULT_ACCOUNTS);
    setCart([]);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        cart,
        cartCount,
        cartSubtotal,
        activeCategory,
        searchQuery,
        isCartOpen,
        isCheckoutOpen,
        selectedProduct,
        selectedOrderId,
        currentView,
        currentUser,
        isAuthModalOpen,
        authModalMode,
        setIsAuthModalOpen,
        setAuthModalMode,
        openLoginModal,
        openRegisterModal,
        login,
        register,
        logout,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        setActiveCategory,
        setSearchQuery,
        setIsCartOpen,
        setIsCheckoutOpen,
        setSelectedProduct,
        setSelectedOrderId,
        setCurrentView,
        placeOrder,
        simulatePayOrder,
        updateOrderStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        resetToDefaultData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
