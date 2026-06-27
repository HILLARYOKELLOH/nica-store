'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, User } from '@/types';

// ─── CART STORE ──────────────────────────────────────────────────────────────
interface CartStore {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getCount: () => number;
  getItem: (productId: string) => CartItem | undefined;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, qty = 1) => {
        set(state => {
          const existing = state.items.find(i => i.productId === product.id);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.productId === product.id
                  ? { ...i, quantity: Math.min(i.quantity + qty, product.stock) }
                  : i
              ),
            };
          }
          return { items: [...state.items, { productId: product.id, quantity: qty, product }] };
        });
      },
      removeItem: (productId) => set(state => ({ items: state.items.filter(i => i.productId !== productId) })),
      updateQty: (productId, qty) => {
        if (qty <= 0) { get().removeItem(productId); return; }
        set(state => ({ items: state.items.map(i => i.productId === productId ? { ...i, quantity: qty } : i) }));
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => get().items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0),
      getCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
      getItem: (productId) => get().items.find(i => i.productId === productId),
    }),
    { name: 'nica-cart' }
  )
);

// ─── AUTH STORE ──────────────────────────────────────────────────────────────
interface AuthStore {
  user: Omit<User, 'password'> | null;
  loading: boolean;
  setUser: (user: Omit<User, 'password'> | null) => void;
  setLoading: (v: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (v) => set({ loading: v }),
  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    set({ user: null });
    window.location.href = '/';
  },
}));

// ─── WISHLIST STORE ───────────────────────────────────────────────────────────
interface WishlistStore {
  items: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (productId) => set(state => ({
        items: state.items.includes(productId)
          ? state.items.filter(id => id !== productId)
          : [...state.items, productId],
      })),
      has: (productId) => get().items.includes(productId),
    }),
    { name: 'nica-wishlist' }
  )
);
