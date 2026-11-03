import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { Product } from '../types';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlistIds: string[];
  wishlistProducts: Product[];
  totalWishlist: number;
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/wishlist/')
        .then((res) => {
          setWishlistIds(res.data.product_ids || []);
          setWishlistProducts(res.data.items?.map((i: any) => i.product) || []);
        })
        .catch(() => {});
    } else {
      const local = localStorage.getItem('saajnika_wishlist');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          setWishlistIds(parsed.map((p: Product) => p.id));
          setWishlistProducts(parsed);
        } catch {}
      }
    }
  }, [isAuthenticated]);

  const toggleWishlist = async (product: Product) => {
    const isPresent = wishlistIds.includes(product.id);

    if (isAuthenticated) {
      try {
        const res = await api.post('/wishlist/toggle/', { product_id: product.id });
        if (res.data.added) {
          setWishlistIds((prev) => [...prev, product.id]);
          setWishlistProducts((prev) => [product, ...prev]);
        } else {
          setWishlistIds((prev) => prev.filter((id) => id !== product.id));
          setWishlistProducts((prev) => prev.filter((p) => p.id !== product.id));
        }
      } catch (err) {
        console.error('Wishlist toggle error', err);
      }
    } else {
      let updated;
      if (isPresent) {
        updated = wishlistProducts.filter((p) => p.id !== product.id);
        setWishlistIds((prev) => prev.filter((id) => id !== product.id));
      } else {
        updated = [product, ...wishlistProducts];
        setWishlistIds((prev) => [...prev, product.id]);
      }
      setWishlistProducts(updated);
      localStorage.setItem('saajnika_wishlist', JSON.stringify(updated));
    }
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistProducts,
        totalWishlist: wishlistIds.length,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
