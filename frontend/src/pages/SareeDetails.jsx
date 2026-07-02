import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, MessageSquare, Share2, Award, ArrowLeft, Loader2, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import ProductCard from '../components/ProductCard';

const SareeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { settings } = useSettings();

  const [saree, setSaree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedSarees, setRelatedSarees] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [copied, setCopied] = useState(false);
  const [addedNotify, setAddedNotify] = useState(false);

  // Load details
  useEffect(() => {
    const fetchSareeDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/sarees/${id}`);
        if (!response.ok) {
          throw new Error('Saree not found');
        }
        const data = await response.json();
        setSaree(data);
        setActiveImage(0);

        // Fetch related sarees
        if (data.category) {
          const resRelated = await fetch(`/api/sarees?category=${encodeURIComponent(data.category)}`);
          if (resRelated.ok) {
            const list = await resRelated.json();
            setRelatedSarees(list.filter(item => item._id !== id).slice(0, 4));
          }
        }

        // Handle recently viewed storage
        trackRecentlyViewed(id);

      } catch (error) {
        console.error('Error fetching details:', error);
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };

    fetchSareeDetails();
  }, [id, navigate]);

  // Track recently viewed in LocalStorage
  const trackRecentlyViewed = (currentId) => {
    const saved = localStorage.getItem('recently_viewed');
    let list = [];
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch (_e) {
        list = [];
      }
    }
    
    // Filter out current, prepend, limit to 4
    list = [currentId, ...list.filter(item => item !== currentId)].slice(0, 5);
    localStorage.setItem('recently_viewed', JSON.stringify(list));

    // Load full details of recently viewed items
    loadRecentlyViewedItems(list.filter(item => item !== currentId));
  };

  // Load full details for recently viewed section
  const loadRecentlyViewedItems = async (ids) => {
    if (ids.length === 0) return;
    try {
      const items = await Promise.all(
        ids.map(async (itemId) => {
          const res = await fetch(`/api/sarees/${itemId}`);
          if (res.ok) return res.json();
          return null;
        })
      );
      setRecentlyViewed(items.filter(Boolean).slice(0, 4));
    } catch (e) {
      console.error('Error loading recently viewed:', e);
    }
  };

  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToCart = () => {
    if (!saree) return;
    addToCart(saree, 1);
    setAddedNotify(true);
    setTimeout(() => setAddedNotify(false), 2500);
  };

  // Create WhatsApp message
  const getWhatsAppLink = () => {
    if (!saree) return '#';
    const whatsappNum = settings?.contactDetails?.whatsapp?.replace(/[^0-9]/g, '') || '919876543210';
    const activePrice = saree.discountPrice ? saree.discountPrice : saree.price;
    
    const message = `Hello Bani Thani Textiles, I am interested in purchasing this saree:\n\n*Saree Name*: ${saree.name}\n*SKU*: ${saree.sku}\n*Fabric*: ${saree.fabric}\n*Color*: ${saree.color}\n*Price*: ₹${activePrice}\n\n*Product Link*: ${window.location.href}\n\nPlease confirm availability.`;
    
    return `https://wa.me/${whatsappNum}?text=${encodeURIComponent(message)}`;
  };

  // Format currency
  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-36 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="font-serif text-charcoal-light text-sm italic">Draping the details...</p>
      </div>
    );
  }

  if (!saree) return null;

  const hasDiscount = saree.discountPrice && saree.discountPrice < saree.price;
  const isOutOfStock = saree.stockStatus === 'out_of_stock' || Number(saree.stockQty) <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-light hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Go Back
      </button>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
        
        {/* Left Column: Image Slideshow */}
        <div className="space-y-4">
          <div className="aspect-[3/4] bg-cream-dark/20 border border-cream-dark/30 rounded-lg overflow-hidden flex items-center justify-center relative">
            {saree.images && saree.images.length > 0 ? (
              <img
                src={saree.images[activeImage]}
                alt={saree.name}
                className="w-full h-full object-cover"
              />
            ) : (
              /* Premium Traditional Placeholder */
              <div className="w-full h-full bg-primary-dark p-6 flex flex-col items-center justify-center text-center relative border-8 border-double border-gold/45 select-none m-0">
                <div className="w-full h-full border border-gold/20 flex flex-col items-center justify-center p-4">
                  <span className="font-serif text-gold text-2xl tracking-[0.2em] font-semibold uppercase mb-1">
                    Bani Thani
                  </span>
                  <span className="text-xs text-cream/70 uppercase tracking-widest border-t border-b border-gold/30 py-0.5 px-4 mb-8">
                    Textiles
                  </span>
                  <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center mb-6">
                    <span className="text-gold font-serif text-lg">₹</span>
                  </div>
                  <span className="text-sm text-gold/80 font-serif italic max-w-[180px]">
                    {saree.fabric || 'Royal Indian'} {saree.category || 'Saree'}
                  </span>
                  <span className="text-xs text-cream-dark/50 mt-4 uppercase tracking-wider">
                    Preview Image Pending Upload
                  </span>
                </div>
              </div>
            )}
            
            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
              {saree.isNewArrival && (
                <span className="bg-primary text-white text-xs tracking-widest uppercase font-semibold px-2.5 py-1 rounded shadow-md">
                  New Arrival
                </span>
              )}
              {saree.isBestSeller && (
                <span className="bg-gold text-charcoal-dark text-xs tracking-widest uppercase font-semibold px-2.5 py-1 rounded shadow-md">
                  Best Seller
                </span>
              )}
              {hasDiscount && (
                <span className="bg-emerald-600 text-white text-xs tracking-widest uppercase font-bold px-2.5 py-1 rounded shadow-md">
                  {saree.discountPercentage}% Off
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails Row */}
          {saree.images && saree.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {saree.images.map((image, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 aspect-[3/4] rounded overflow-hidden border-2 shrink-0 bg-cream-light ${
                    idx === activeImage ? 'border-primary shadow-md' : 'border-cream-dark/25 hover:border-gold'
                  }`}
                >
                  <img src={image} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Saree Specs & Details */}
        <div className="flex flex-col h-full">
          <span className="text-xs text-gold-dark font-semibold uppercase tracking-wider mb-2 block">
            {saree.fabric} • {saree.category}
          </span>
          <h1 className="font-serif text-3xl font-bold text-charcoal tracking-wide mb-2">
            {saree.name}
          </h1>
          <span className="text-xs text-charcoal-light font-mono uppercase tracking-widest mb-6 block">
            Product Code: {saree.sku}
          </span>

          {/* Price Block */}
          <div className="flex items-baseline gap-4 mb-6 border-b border-cream-dark/15 pb-6">
            {hasDiscount ? (
              <>
                <span className="text-primary font-bold text-2xl sm:text-3xl">
                  {formatPrice(saree.discountPrice)}
                </span>
                <span className="text-charcoal-light line-through text-sm">
                  {formatPrice(saree.price)}
                </span>
                <span className="text-emerald-600 text-xs uppercase tracking-wider font-bold">
                  ({saree.discountPercentage}% Discounted)
                </span>
              </>
            ) : (
              <span className="text-primary font-bold text-2xl sm:text-3xl">
                {formatPrice(saree.price)}
              </span>
            )}
          </div>

          {/* Description */}
          {saree.description && (
            <div className="mb-6">
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-charcoal mb-2">Description</h3>
              <p className="text-charcoal-light text-sm leading-relaxed font-light">
                {saree.description}
              </p>
            </div>
          )}

          {/* Quick Info Grid */}
          <div className="bg-white border border-cream-dark/20 rounded-lg p-5 mb-8 shadow-sm">
            <h3 className="font-serif text-xs font-bold uppercase tracking-widest text-primary border-b border-cream-dark/15 pb-2 mb-4">
              Specifications
            </h3>
            <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 text-xs">
              <div className="flex flex-col">
                <span className="text-gray-400 font-medium">Fabric Type</span>
                <span className="text-charcoal font-semibold">{saree.fabric || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 font-medium">Primary Color</span>
                <span className="text-charcoal font-semibold">{saree.color || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 font-medium">Saree Length</span>
                <span className="text-charcoal font-semibold">{saree.length || '5.5 Meters'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 font-medium">Blouse Included</span>
                <span className="text-charcoal font-semibold">{saree.blousePiece ? 'Yes, Unstitched' : 'No'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 font-medium">Work / Pattern</span>
                <span className="text-charcoal font-semibold">{saree.workType || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 font-medium">Occasion Suitability</span>
                <span className="text-charcoal font-semibold">{saree.occasion || 'N/A'}</span>
              </div>
              <div className="col-span-2 flex flex-col pt-2 border-t border-cream-dark/10">
                <span className="text-gray-400 font-medium">Wash & Care</span>
                <span className="text-charcoal font-medium italic">{saree.washCare || 'Dry Clean Only'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mt-auto">
            {isOutOfStock ? (
              <div className="w-full bg-cream text-charcoal-light border border-cream-dark/45 py-3.5 rounded text-center text-sm font-bold tracking-widest uppercase cursor-not-allowed">
                Out of Stock
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-white text-primary border border-primary hover:bg-cream py-3.5 rounded text-center text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" /> Add to Bag
                </button>
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-500 border border-emerald-700 py-3.5 rounded text-center text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 fill-current" /> WhatsApp Inquiry
                </a>
              </div>
            )}

            {/* Added to Bag notification toast */}
            {addedNotify && (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-4 py-3 rounded flex items-center gap-2 select-none animate-fade-in shadow-sm">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Saree successfully added to your shopping bag! Open the cart to proceed.</span>
              </div>
            )}

            {/* Share and wishlist auxiliary options */}
            <div className="flex items-center gap-4 pt-4 text-xs font-medium text-charcoal-light justify-center sm:justify-start">
              <button
                onClick={handleShareClick}
                className="inline-flex items-center gap-1.5 hover:text-primary"
              >
                <Share2 className="w-4 h-4 text-gold" /> {copied ? 'Link Copied!' : 'Share Saree link'}
              </button>
              <span className="text-gray-300">|</span>
              <div className="inline-flex items-center gap-1.5">
                <Award className="w-4 h-4 text-gold" /> Traditional Weaver Certified Weaves
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ==========================================
          7. RELATED PRODUCTS SECTION
          ========================================== */}
      {relatedSarees.length > 0 && (
        <section className="mt-20 border-t border-cream-dark/20 pt-16">
          <div className="text-center sm:text-left mb-8">
            <span className="text-gold font-serif text-sm italic block">Handpicked Suggestions</span>
            <h2 className="font-serif text-charcoal text-2xl font-semibold tracking-wide uppercase">
              Related Sarees
            </h2>
            <div className="w-16 h-0.5 bg-gold mt-2 sm:mx-0 mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedSarees.map(item => (
              <ProductCard key={item._id} saree={item} />
            ))}
          </div>
        </section>
      )}

      {/* ==========================================
          8. RECENTLY VIEWED SECTION
          ========================================== */}
      {recentlyViewed.length > 0 && (
        <section className="mt-16 border-t border-cream-dark/20 pt-16">
          <div className="text-center sm:text-left mb-8">
            <span className="text-gold font-serif text-sm italic block">Your Browsing History</span>
            <h2 className="font-serif text-charcoal text-2xl font-semibold tracking-wide uppercase">
              Recently Viewed
            </h2>
            <div className="w-16 h-0.5 bg-gold mt-2 sm:mx-0 mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {recentlyViewed.map(item => (
              <ProductCard key={item._id} saree={item} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default SareeDetails;
