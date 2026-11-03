import React, { useState } from 'react';
import { X, Heart, Check, ShoppingBag } from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { optimizeImageUrl } from '../../utils/image';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [adding, setAdding] = useState(false);
  const [addedMessage, setAddedMessage] = useState(false);

  React.useEffect(() => {
    if (product) {
      setSelectedImage(product.primary_image || (product.images && product.images[0]?.image_url) || '');
      if (product.variants && product.variants.length > 0) {
        setSelectedSize(product.variants[0].size);
        setSelectedColor(product.variants[0].color_name);
      }
    }
  }, [product]);

  if (!product) return null;

  const activeVariant: ProductVariant | undefined = product.variants?.find(
    (v) => v.size === selectedSize && v.color_name === selectedColor
  ) || product.variants?.[0];

  const handleAddToBag = async () => {
    if (!activeVariant) return;
    setAdding(true);
    await addItem(activeVariant.id, 1);
    setAdding(false);
    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
      onClose();
    }, 1200);
  };

  const isFavorited = isInWishlist(product.id);
  const currentPrice = Number(product.current_price || product.base_price);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-[#1A1817]/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="relative inline-block align-bottom bg-[#FAF8F5] text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-[#E8E2D9]">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 text-[#231F1D] hover:text-[#966355] bg-white/70 backdrop-blur-sm transition-colors"
          >
            <X size={20} strokeWidth={1.5} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Image Gallery */}
            <div className="p-6 bg-[#F5F1EB] flex flex-col justify-between">
              <div className="aspect-[3/4] w-full overflow-hidden border border-[#E8E2D9] bg-white">
                <img
                  src={optimizeImageUrl(selectedImage || product.primary_image || (product.images && product.images[0]?.image_url), 700, 75)}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                  decoding="async"
                />
              </div>

              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto">
                  {product.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(img.image_url)}
                      className={`w-16 h-20 border overflow-hidden transition-all ${
                        selectedImage === img.image_url ? 'border-[#1A1817] ring-1 ring-[#1A1817]' : 'border-[#E8E2D9] opacity-70'
                      }`}
                    >
                      <img
                        src={optimizeImageUrl(img.image_url, 140, 70)}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Meta & Actions */}
            <div className="p-6 md:p-8 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-sans tracking-[0.2em] uppercase text-[#766F68]">
                  {product.category_name || product.collection_name}
                </span>

                <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1817] mt-1 font-normal">
                  {product.name}
                </h2>

                <div className="mt-2 text-lg font-sans font-medium text-[#231F1D]">
                  ₹{currentPrice.toLocaleString()}
                </div>

                <p className="text-xs font-sans text-[#766F68] mt-3 leading-relaxed">
                  {product.short_description}
                </p>

                {/* Sizing Selector */}
                {product.available_sizes && product.available_sizes.length > 0 && (
                  <div className="mt-6">
                    <label className="text-[11px] font-sans tracking-[0.16em] uppercase text-[#231F1D] block mb-2 font-medium">
                      Select Size
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.available_sizes.map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`w-11 h-10 text-xs font-sans border transition-all ${
                            selectedSize === sz
                              ? 'border-[#1A1817] bg-[#1A1817] text-white font-medium'
                              : 'border-[#E8E2D9] bg-white text-[#231F1D] hover:border-[#966355]'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selector */}
                {product.available_colors && product.available_colors.length > 0 && (
                  <div className="mt-5">
                    <label className="text-[11px] font-sans tracking-[0.16em] uppercase text-[#231F1D] block mb-2 font-medium">
                      Color: <span className="font-normal text-[#766F68]">{selectedColor}</span>
                    </label>
                    <div className="flex items-center space-x-3">
                      {product.available_colors.map((c, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedColor(c.color_name)}
                          className={`w-6 h-6 rounded-full border-2 transition-all p-0.5 ${
                            selectedColor === c.color_name ? 'border-[#1A1817] scale-110' : 'border-transparent'
                          }`}
                        >
                          <span
                            className="w-full h-full rounded-full block border border-[#D9D2C7]"
                            style={{ backgroundColor: c.color_hex }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-[#E8E2D9] space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToBag}
                    disabled={adding || !activeVariant?.is_in_stock}
                    className="flex-1 bg-[#1A1817] text-[#FAF8F5] text-xs font-sans tracking-[0.2em] uppercase py-3.5 hover:bg-[#966355] transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {addedMessage ? (
                      <>
                        <Check size={16} />
                        <span>Added to Bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={15} strokeWidth={1.5} />
                        <span>{activeVariant?.is_in_stock ? 'Add to Shopping Bag' : 'Out of Stock'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`px-4 border border-[#E8E2D9] transition-colors ${
                      isFavorited ? 'bg-[#966355] text-white border-[#966355]' : 'bg-white text-[#231F1D] hover:bg-[#F5F1EB]'
                    }`}
                    title="Wishlist"
                  >
                    <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} strokeWidth={1.5} />
                  </button>
                </div>

                <a
                  href={`/product/${product.slug}`}
                  className="block text-center text-[11px] font-sans tracking-[0.16em] uppercase text-[#766F68] hover:text-[#1A1817] underline pt-1"
                >
                  View Full Silhouette & Fabric Details →
                </a>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
