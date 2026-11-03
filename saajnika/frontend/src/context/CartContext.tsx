import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { CartItem } from '../types';

interface CouponInfo {
  code: string;
  description?: string;
  discount_type: 'PERCENTAGE' | 'FIXED';
  discount_value: string;
  discount_amount: number;
}

interface CartContextType {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (variantId: string, quantity?: number) => Promise<{ success: boolean; error?: string }>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  coupon: CouponInfo | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; error?: string }>;
  removeCoupon: () => void;
  discountAmount: number;
  shippingFee: number;
  finalTotal: number;
  freeShippingProgress: number; // 0 to 100% towards ₹3,999
}

const FREE_SHIPPING_THRESHOLD = 3999;
const STANDARD_SHIPPING_FEE = 250;

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [coupon, setCoupon] = useState<CouponInfo | null>(null);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart/');
      if (res.data?.items) {
        setItems(res.data.items);
      }
    } catch (err) {
      // In standalone mode, read from localStorage fallback
      const local = localStorage.getItem('saajnika_cart_items');
      if (local) {
        try { setItems(JSON.parse(local)); } catch {}
      }
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    localStorage.setItem('saajnika_cart_items', JSON.stringify(items));
  }, [items]);

  const subtotal = items.reduce((acc, item) => acc + Number(item.unit_price) * item.quantity, 0);

  const discountAmount = coupon ? coupon.discount_amount : 0;
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING_FEE;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addItem = async (variantId: string, quantity = 1) => {
    try {
      const res = await api.post('/cart/add_item/', { variant_id: variantId, quantity });
      setItems(res.data.items);
      setIsCartOpen(true);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.error || 'Could not add item to bag.',
      };
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const res = await api.post('/cart/update_quantity/', { item_id: itemId, quantity });
      setItems(res.data.items);
    } catch {
      setItems((prev) =>
        prev
          .map((item) => (item.id === itemId ? { ...item, quantity } : item))
          .filter((item) => item.quantity > 0)
      );
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const res = await api.post('/cart/remove_item/', { item_id: itemId });
      setItems(res.data.items);
    } catch {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    }
  };

  const clearCart = async () => {
    try {
      await api.post('/cart/clear/');
      setItems([]);
    } catch {
      setItems([]);
    }
    setCoupon(null);
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await api.post('/coupons/validate/', {
        code,
        subtotal,
      });
      if (res.data.valid) {
        setCoupon({
          code: res.data.code,
          description: res.data.description,
          discount_type: res.data.discount_type,
          discount_value: res.data.discount_value,
          discount_amount: Number(res.data.discount_amount),
        });
        return { success: true };
      }
      return { success: false, error: res.data.error || 'Invalid coupon' };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.error || 'Coupon validation failed',
      };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        totalItems,
        isCartOpen,
        openCart,
        closeCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        coupon,
        applyCoupon,
        removeCoupon,
        discountAmount,
        shippingFee,
        finalTotal,
        freeShippingProgress,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
