import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/catalog/ProductCard';

export const WishlistPage: React.FC = () => {
  const { wishlistProducts } = useWishlist();

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#231F1D] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10 pb-6 border-b border-[#E8E2D9]">
          <span className="text-[10px] font-sans tracking-[0.25em] uppercase text-[#966355] block font-medium">
            Curated Selections
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1817] font-normal mt-1">
            My Saved Silhouettes
          </h1>
          <p className="text-xs font-sans text-[#766F68] mt-1">
            {wishlistProducts.length} curated {wishlistProducts.length === 1 ? 'silhouette' : 'silhouettes'} saved to your private atelier wish list.
          </p>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="bg-white border border-[#E8E2D9] p-16 text-center space-y-4 max-w-lg mx-auto">
            <Heart size={36} className="mx-auto text-[#766F68]" strokeWidth={1.5} />
            <h3 className="font-serif text-2xl text-[#1A1817]">Your Wishlist is Empty</h3>
            <p className="text-xs font-sans text-[#766F68] leading-relaxed">
              Explore our current collection and click the heart icon on any silhouette to curate your private favorites.
            </p>
            <Link
              to="/shop"
              className="inline-block bg-[#1A1817] text-white text-xs font-sans tracking-widest uppercase px-6 py-3 hover:bg-[#966355] transition-colors"
            >
              Discover Silhouettes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {wishlistProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
