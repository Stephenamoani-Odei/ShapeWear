import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface Review {
  id: number;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  features: string[];
  colors: string[];
  inStock: boolean;
  reviews?: Review[];
  averageRating?: number;
  reviewCount?: number;
}

export interface CartItem extends Product {
  quantity: number;
  size?: string;
  color?: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: CartItem[];
  total: number;
  shippingAddress?: {
    name: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  orders?: Order[];
}

interface AppContextType {
  cart: CartItem[];
  user: User | null;
  authLoading: boolean;
  orders: Order[];
  refreshOrders: () => Promise<void>;
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (productId: number, size?: string, color?: string) => void;
  updateQuantity: (productId: number, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  cartTotal: number;
  cartCount: number;
  addReview: (productId: number, rating: number, comment: string) => void;
  getProductReviews: (productId: number, baseReviews?: Review[]) => Review[];
  wishlist: number[];
  addToWishlist: (productId: number) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper: map a Supabase auth user → our User shape
function mapSupabaseUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    name:
      supabaseUser.user_metadata?.name ??
      supabaseUser.email?.split('@')[0] ??
      'User',
    role: supabaseUser.user_metadata?.role ?? 'customer',
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  const [wishlist, setWishlist] = useState<number[]>(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [localReviews, setLocalReviews] = useState<Record<number, Review[]>>(() => {
    const saved = localStorage.getItem('localReviews');
    return saved ? JSON.parse(saved) : {};
  });

  // ─── Supabase Auth Listener ─────────────────────────────────────────────────
  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? mapSupabaseUser(session.user) : null);
      setAuthLoading(false);
    });

    // Listen for login / logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? mapSupabaseUser(session.user) : null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ─── Persist cart & wishlist ─────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // ─── Auth Actions ────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };

  const register = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }, // stored in user_metadata
      },
    });
    
    if (error) throw new Error(error.message);
    // Note: Supabase sends a confirmation email by default.
    // You can disable this in: Supabase Dashboard → Auth → Settings → "Enable email confirmations"
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOrders([]);
    localStorage.removeItem('user');
  };

  const refreshOrders = async () => {
    if (!user?.email) {
      setOrders([]);
      return;
    }

    const { data, error } = await supabase
      .from('orders')
      .select('id, created_at, order_status, amount_ghs, items, shipping_address')
      .eq('user_email', user.email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load user orders:', error.message);
      return;
    }

    if (!data) {
      setOrders([]);
      return;
    }

    setOrders(
      data.map((row: any) => ({
        id: String(row.id),
        date: row.created_at ?? new Date().toISOString(),
        status: (row.order_status ?? 'pending') as Order['status'],
        total: row.amount_ghs ?? 0,
        items: row.items ?? [],
        shippingAddress:
          row.shipping_address && typeof row.shipping_address === 'string'
            ? JSON.parse(row.shipping_address)
            : row.shipping_address,
      }))
    );
  };

  useEffect(() => {
    if (authLoading) return;
    refreshOrders();
  }, [user?.email, authLoading]);


  // ─── Cart Actions ─────────────────────────────────────────────────────────────
  const addToCart = (product: Product, quantity = 1, size?: string, color?: string) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.id === product.id && item.size === size && item.color === color
      );
      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity, size, color }];
    });
  };

  const removeFromCart = (productId: number, size?: string, color?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.id === productId && item.size === size && item.color === color)
      )
    );
  };

  const updateQuantity = (productId: number, quantity: number, size?: string, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId && item.size === size && item.color === color
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  // ─── Wishlist Actions ─────────────────────────────────────────────────────────
  const addToWishlist = (productId: number) => {
    setWishlist((prev) => (prev.includes(productId) ? prev : [...prev, productId]));
  };

  const removeFromWishlist = (productId: number) => {
    setWishlist((prev) => prev.filter((id) => id !== productId));
  };

  const isInWishlist = (productId: number) => wishlist.includes(productId);

  // ─── Review Actions ───────────────────────────────────────────────────────────
  const addReview = (productId: number, rating: number, comment: string) => {
    if (!user) throw new Error('Must be logged in to add a review');

    const newReview: Review = {
      id: Date.now(),
      userId: user.id,
      userName: user.name,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
    };

    setLocalReviews((prev) => {
      const updated = { ...prev, [productId]: [...(prev[productId] || []), newReview] };
      localStorage.setItem('localReviews', JSON.stringify(updated));
      return updated;
    });
  };

  const getProductReviews = (productId: number, baseReviews: Review[] = []) => {
    const extra = localReviews[productId] || [];
    return [...baseReviews, ...extra];
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        cart,
        user,
        authLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        login,
        register,
        logout,
        cartTotal,
        cartCount,
        addReview,
        getProductReviews,
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        orders,
        refreshOrders,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
