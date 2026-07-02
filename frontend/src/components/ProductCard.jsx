import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ saree, isWishlisted, onToggleWishlist }) => {
  const { addToCart } = useCart();
  
  const hasDiscount = saree.discountPrice && saree.discountPrice < saree.price;
  const isOutOfStock = saree.stockStatus === 'out_of_stock' || Number(saree.stockQty) <= 0;

  // Format currency
  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div 
      className="group bg-white rounded-lg overflow-hidden border border-cream-dark/30 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full relative gold-border-glow-hover"
      id={`saree-card-${saree._id}`}
    >
      {/* Badges Container */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {saree.isNewArrival && (
          <span className="bg-primary text-white text-[10px] tracking-widest uppercase font-semibold px-2 py-0.5 rounded shadow-sm">
            New
          </span>
        )}
        {saree.isBestSeller && (
          <span className="bg-gold text-charcoal-dark text-[10px] tracking-widest uppercase font-semibold px-2 py-0.5 rounded shadow-sm">
            Best Seller
          </span>
        )}
        {saree.isFeatured && (
          <span className="bg-amber-600 text-white text-[10px] tracking-widest uppercase font-semibold px-2 py-0.5 rounded shadow-sm">
            Exclusive
          </span>
        )}
        {hasDiscount && (
          <span className="bg-emerald-600 text-white text-[10px] tracking-widest uppercase font-bold px-2 py-0.5 rounded shadow-sm">
            {saree.discountPercentage}% Off
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      {onToggleWishlist && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleWishlist(saree._id);
          }}
          className="absolute top-3 right-3 z-10 p-2 bg-white/80 hover:bg-white text-primary rounded-full shadow-md hover:scale-110 transition-luxury"
          aria-label="Add to wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-primary' : ''}`} />
        </button>
      )}

      {/* Saree Image Section */}
      <div className="relative aspect-[3/4] bg-cream-dark/20 overflow-hidden w-full flex items-center justify-center">
        {saree.images && saree.images.length > 0 ? (
          <img
            src={saree.images[0]}
            alt={saree.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          /* Premium Traditional Placeholder */
          <div className="w-full h-full bg-primary-dark p-4 flex flex-col items-center justify-center text-center relative border-4 border-double border-gold/40 m-0 select-none">
            <div className="w-full h-full border border-gold/20 flex flex-col items-center justify-center p-2">
              <span className="font-serif text-gold text-lg tracking-widest font-semibold uppercase mb-1">
                Bani Thani
              </span>
              <span className="text-[9px] text-cream/70 uppercase tracking-widest border-t border-b border-gold/25 py-0.5 px-3 mb-4">
                Textiles
              </span>
              <div className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center mb-4">
                <span className="text-gold font-serif text-sm">₹</span>
              </div>
              <span className="text-[10px] text-gold/80 font-serif italic max-w-[130px]">
                {saree.fabric || 'Royal Indian'} {saree.category || 'Saree'}
              </span>
              <span className="text-[9px] text-cream-dark/50 mt-2 uppercase tracking-wide">
                Image Pending Upload
              </span>
            </div>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-charcoal/70 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-primary border border-gold/30 text-gold text-xs tracking-widest font-bold uppercase py-2 px-4 rounded shadow-lg transform -rotate-3">
              Out of Stock
            </span>
          </div>
        )}

        {/* Hover Quick View Panel */}
        {!isOutOfStock && (
          <div className="absolute inset-0 bg-primary-dark/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-10">
            <Link
              to={`/saree/${saree._id}`}
              className="p-3 bg-white text-primary rounded-full shadow-lg hover:bg-gold hover:text-charcoal transition-all duration-300 transform translate-y-4 group-hover:translate-y-0"
              title="View Details"
            >
              <Eye className="w-5 h-5" />
            </Link>
            <button
              onClick={() => addToCart(saree, 1)}
              className="p-3 bg-white text-primary rounded-full shadow-lg hover:bg-gold hover:text-charcoal transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 delay-75"
              title="Add to Cart"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Saree Details Section */}
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-[11px] text-gold-dark font-medium uppercase tracking-wider mb-1 block">
          {saree.fabric} • {saree.category}
        </span>
        
        <Link 
          to={`/saree/${saree._id}`} 
          className="font-serif text-charcoal hover:text-primary transition-colors text-base font-semibold line-clamp-1 mb-2 block"
        >
          {saree.name}
        </Link>
        
        {saree.sku && (
          <span className="text-[10px] text-charcoal-light uppercase font-mono tracking-wider mb-3 block">
            SKU: {saree.sku}
          </span>
        )}

        <div className="mt-auto pt-3 border-t border-cream-dark/20 flex items-baseline gap-2">
          {hasDiscount ? (
            <>
              <span className="text-primary font-bold text-lg">
                {formatPrice(saree.discountPrice)}
              </span>
              <span className="text-charcoal-light line-through text-xs">
                {formatPrice(saree.price)}
              </span>
            </>
          ) : (
            <span className="text-primary font-bold text-lg">
              {formatPrice(saree.price)}
            </span>
          )}
        </div>
      </div>

      {/* Mobile Card Bottom Action Bar (visible on mobile only instead of overlays) */}
      <div className="grid grid-cols-2 border-t border-cream-dark/20 sm:hidden">
        <Link
          to={`/saree/${saree._id}`}
          className="py-2.5 text-center text-xs text-charcoal bg-cream-light font-medium flex items-center justify-center gap-1.5 active:bg-cream-dark/10"
        >
          <Eye className="w-3.5 h-3.5" /> Details
        </Link>
        <button
          onClick={() => !isOutOfStock && addToCart(saree, 1)}
          disabled={isOutOfStock}
          className={`py-2.5 text-center text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            isOutOfStock 
              ? 'bg-cream text-charcoal-light cursor-not-allowed' 
              : 'bg-primary text-white active:bg-primary-dark'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" /> Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
