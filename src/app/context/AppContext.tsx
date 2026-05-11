import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Review {
  id: number;
  userId: number;
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
  id: number;
  email: string;
  name: string;
  token: string;
  orders?: Order[];
}

interface AppContextType {
  cart: CartItem[];
  user: User | null;
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [wishlist, setWishlist] = useState<number[]>(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Local reviews keyed by productId — persisted so they survive page refresh
  const [localReviews, setLocalReviews] = useState<Record<number, Review[]>>(() => {
    const saved = localStorage.getItem('localReviews');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

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

  const clearCart = () => {
    setCart([]);
  };

  const addToWishlist = (productId: number) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) return prev;
      return [...prev, productId];
    });
  };

  const removeFromWishlist = (productId: number) => {
    setWishlist((prev) => prev.filter((id) => id !== productId));
  };

  const isInWishlist = (productId: number) => {
    return wishlist.includes(productId);
  };

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
      const existing = prev[productId] || [];
      const updated = { ...prev, [productId]: [...existing, newReview] };
      localStorage.setItem('localReviews', JSON.stringify(updated));
      return updated;
    });
  };

  const login = async (email: string, password: string) => {
    // Mock authentication - in production, this would call a real API
    // Security note: Always use HTTPS, secure tokens (JWT), and httpOnly cookies
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Input validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Mock user data
    const mockUser: User = {
      id: 1,
      email: email,
      name: email.split('@')[0],
      token: 'mock_jwt_token_' + Math.random().toString(36),
      orders: [
        {
          id: 'ORD-001',
          date: '2024-01-15',
          status: 'delivered',
          items: [
            {
              id: 1,
              name: "Women's Sculpt Leggings",
              price: 64.99,
              image: '',
              category: 'Women',
              description: '',
              features: [],
              colors: [],
              inStock: true,
              quantity: 1,
              color: 'Black',
              size: 'M'
            }
          ],
          total: 64.99,
          shippingAddress: {
            name: 'John Doe',
            address: '123 Main St',
            city: 'New York',
            zipCode: '10001',
            country: 'USA'
          }
        },
        {
          id: 'ORD-002',
          date: '2024-01-20',
          status: 'shipped',
          items: [
            {
              id: 2,
              name: "Men's Performance Tee",
              price: 39.99,
              image: '',
              category: 'Men',
              description: '',
              features: [],
              colors: [],
              inStock: true,
              quantity: 2,
              color: 'Black',
              size: 'L'
            }
          ],
          total: 79.98,
          shippingAddress: {
            name: 'John Doe',
            address: '123 Main St',
            city: 'New York',
            zipCode: '10001',
            country: 'USA'
          }
        }
      ]
    };

    setUser(mockUser);
  };

  const register = async (email: string, password: string, name: string) => {
    // Mock registration - in production, validate inputs server-side
    // Security: Hash passwords with bcrypt, validate email format, check password strength
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Basic client-side validation
    if (!email || !password || !name) {
      throw new Error('All fields are required');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    const mockUser: User = {
      id: Date.now(),
      email,
      name,
      token: 'mock_jwt_token_' + Math.random().toString(36),
    };

    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
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
