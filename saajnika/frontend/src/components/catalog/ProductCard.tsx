import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import { Product } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { optimizeImageUrl } from '../../utils/image';
import { cachedGet } from '../../services/api';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView, priority = false }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const currentPrice = Number(product.current_price || product.base_price);
  const basePrice = Number(product.base_price);
  const hasDiscount = product.sale_price && currentPrice < basePrice;

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Instant hover prefetching of PDP into in-memory client cache
    if (product.slug) {
      cachedGet(`/catalog/products/${product.slug}/`).catch(() => {});
    }
  };

  const activeImageUrl = optimizeImageUrl(
    isHovered && product.secondary_image ? product.secondary_image : product.primary_image,
    550,
    75
  );

  return (
    <div
      className="group relative flex flex-col transition-all duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Frame (3:4 Editorial Ratio) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5F1EB] border border-[#E8E2D9]">
        <Link to={`/product/${product.slug}`} className="block w-full h-full relative">
          {/* Shimmer Placeholder while loading */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-[#F2EDE4] animate-pulse" />
          )}
          <img
            src={activeImageUrl}
            alt={product.name}
            className={`w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            onLoad={() => setImageLoaded(true)}
          />
        </Link>

        {/* Badges: New Arrival / Sale */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.is_new_arrival && (
            <span className="bg-[#1A1817] text-[#FAF8F5] text-[9px] font-sans tracking-[0.2em] uppercase px-2 py-1">
              New Edit
            </span>
          )}
          {hasDiscount && (
            <span className="bg-[#966355] text-white text-[9px] font-sans tracking-[0.18em] uppercase px-2 py-1">
              {product.discount_percent}% Privilege
            </span>
          )}
        </div>

        {/* Wishlist Action Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 z-10 ${
            isFavorited
              ? 'bg-[#966355] text-white shadow-sm'
              : 'bg-white/80 backdrop-blur-sm text-[#231F1D] hover:bg-white hover:text-[#966355]'
          }`}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} strokeWidth={1.5} />
        </button>

        {/* Quick View Button on Hover */}
        {onQuickView && (
          <div className="absolute bottom-0 inset-x-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 hidden sm:block">
            <button
              onClick={(e) => {
                e.preventDefault();
                onQuickView(product);
              }}
              className="w-full bg-[#FAF8F5]/90 backdrop-blur-md text-[#1A1817] hover:bg-[#1A1817] hover:text-[#FAF8F5] text-[10px] font-sans tracking-[0.2em] uppercase py-2.5 transition-colors border border-[#E8E2D9] flex items-center justify-center space-x-1.5"
            >
              <Eye size={13} strokeWidth={1.5} />
              <span>Quick Preview</span>
            </button>
          </div>
        )}
      </div>

      {/* Product Details Below Image */}
      <div className="pt-3.5 pb-2 flex flex-col flex-1">
        {/* Subtle Category or Collection Tag */}
        <span className="text-[10px] font-sans tracking-[0.18em] uppercase text-[#766F68]">
          {product.category_name || product.collection_name || 'Atelier Selection'}
        </span>

        {/* Product Title */}
        <h3 className="font-serif text-base sm:text-lg text-[#1A1817] font-normal leading-snug line-clamp-1 mt-0.5 group-hover:text-[#966355] transition-colors">
          <Link to={`/product/${product.slug}`}>{product.name}</Link>
        </h3>

        {/* Pricing */}
        <div className="mt-1 flex items-baseline space-x-2">
          <span className="font-sans text-sm font-medium text-[#231F1D]">
            ₹{currentPrice.toLocaleString('en-IN')}
          </span>
          {hasDiscount && (
            <span className="font-sans text-xs text-[#766F68] line-through">
              ₹{basePrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Color Swatch Dots */}
        {Array.isArray(product.available_colors) && product.available_colors.length > 0 && (
          <div className="flex items-center space-x-1.5 mt-2">
            {product.available_colors.slice(0, 4).map((c, idx) => (
              <span
                key={idx}
                title={c.color_name}
                className="w-2.5 h-2.5 rounded-full border border-[#D9D2C7] transition-transform hover:scale-125"
                style={{ backgroundColor: c.color_hex }}
              />
            ))}
            {product.available_colors.length > 4 && (
              <span className="text-[10px] text-[#766F68] font-sans">
                +{product.available_colors.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
