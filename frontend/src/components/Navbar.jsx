import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, Trash2, ChevronDown, Phone, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';

const Navbar = () => {
  const { cartItems, cartCount, cartTotal, removeFromCart, updateQuantity } = useCart();
  const { settings, categories, collections, announcements } = useSettings();
  const { customerUser } = useCustomerAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAnnounceIdx, setActiveAnnounceIdx] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  // Rotate announcements every 5 seconds if multiple exist
  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setActiveAnnounceIdx(prev => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [announcements]);

  // Close menus on page change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCartOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname, location.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const shopName = settings?.shopName || 'Bani Thani Textiles';
  const logoUrl = settings?.logoUrl;
  const activeAnnouncements = announcements.filter(a => a.isActive);
  const activeCats = categories.filter(c => c.isActive);
  const activeColls = collections.filter(c => c.isActive);

  return (
    <header className="sticky top-0 z-50 shadow-sm w-full bg-white">
      {/* Announcement Bar */}
      {activeAnnouncements.length > 0 && (
        <div className="bg-primary text-white text-xs font-medium py-2 px-4 select-none relative overflow-hidden text-center tracking-wider border-b border-gold/20 flex items-center justify-center min-h-[32px]">
          <div className="animate-fade-in text-center px-4 w-full">
            {activeAnnouncements[activeAnnounceIdx]?.content}
          </div>
        </div>
      )}

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between border-b border-cream-dark/15">
        
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden p-2 text-charcoal hover:text-primary"
          aria-label="Open mobile menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 select-none">
          {logoUrl ? (
            <img src={logoUrl} alt={shopName} className="h-12 object-contain" />
          ) : (
            <div className="flex flex-col text-center">
              <span className="font-serif text-2xl font-bold tracking-widest text-primary uppercase">
                Bani Thani
              </span>
              <span className="text-[10px] text-gold font-bold tracking-[0.25em] uppercase border-t border-gold/30 mt-0.5 pt-0.5">
                Textiles
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Main Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-charcoal-light">
          <Link to="/" className={`hover:text-primary transition-colors py-2 border-b-2 ${location.pathname === '/' ? 'border-primary text-primary' : 'border-transparent'}`}>
            Home
          </Link>
          
          <Link to="/shop?isNewArrival=true" className="hover:text-primary transition-colors py-2">
            New Arrivals
          </Link>

          <Link to="/shop?isBestSeller=true" className="hover:text-primary transition-colors py-2">
            Best Sellers
          </Link>

          {/* Categories Dropdown */}
          <div className="relative group/menu py-2 cursor-pointer">
            <span className="hover:text-primary transition-colors flex items-center gap-1">
              Sarees <ChevronDown className="w-4 h-4" />
            </span>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-56 bg-white border border-cream-dark/25 rounded-md shadow-xl py-2 invisible opacity-0 group-hover/menu:visible group-hover/menu:opacity-100 transition-all duration-200 z-50">
              {activeCats.map(cat => (
                <Link
                  key={cat._id}
                  to={`/shop?category=${encodeURIComponent(cat.title)}`}
                  className="block px-4 py-2 text-xs hover:bg-cream-dark/20 hover:text-primary text-charcoal transition-colors font-medium"
                >
                  {cat.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Collections Dropdown */}
          <div className="relative group/menu py-2 cursor-pointer">
            <span className="hover:text-primary transition-colors flex items-center gap-1">
              Collections <ChevronDown className="w-4 h-4" />
            </span>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-64 bg-white border border-cream-dark/25 rounded-md shadow-xl py-2 invisible opacity-0 group-hover/menu:visible group-hover/menu:opacity-100 transition-all duration-200 z-50">
              {activeColls.map(coll => (
                <Link
                  key={coll._id}
                  to={`/shop?collection=${encodeURIComponent(coll.title)}`}
                  className="block px-4 py-2 text-xs hover:bg-cream-dark/20 hover:text-primary text-charcoal transition-colors font-medium"
                >
                  {coll.title}
                </Link>
              ))}
            </div>
          </div>

          <Link to="/shop?discount=true" className="hover:text-primary text-rose-600 transition-colors py-2">
            Sale
          </Link>
          
          <Link to="/about" className={`hover:text-primary transition-colors py-2 border-b-2 ${location.pathname === '/about' ? 'border-primary text-primary' : 'border-transparent'}`}>
            About Us
          </Link>
          
          <Link to="/contact" className={`hover:text-primary transition-colors py-2 border-b-2 ${location.pathname === '/contact' ? 'border-primary text-primary' : 'border-transparent'}`}>
            Contact Us
          </Link>
        </nav>

        {/* Action Icons Section */}
        <div className="flex items-center gap-4 text-charcoal">
          
          {/* Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 hover:text-primary hover:scale-105 transition-all"
            aria-label="Search items"
            id="navbar-search-btn"
          >
            <Search className="w-5.5 h-5.5" />
          </button>

          {/* Customer Login / Profile Link */}
          <Link
            to={customerUser ? "/profile" : "/login"}
            className="p-2 hover:text-primary hover:scale-105 transition-all hidden sm:inline-block"
            aria-label="Customer profile"
            id="navbar-customer-btn"
          >
            <User className="w-5.5 h-5.5" />
          </Link>

          {/* Shopping Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2 hover:text-primary hover:scale-105 transition-all relative flex items-center"
            aria-label="Open cart drawer"
            id="navbar-cart-btn"
          >
            <ShoppingBag className="w-5.5 h-5.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary border border-gold/45 text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow">
                {cartCount}
              </span>
            )}
          </button>

        </div>

      </div>

      {/* ==========================================
          A. CART SLIDEOUT DRAWER
          ========================================== */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" id="cart-drawer-overlay">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-charcoal/40 backdrop-blur-[2px] transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-cream-dark/30">
              
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-cream-dark/20 flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" /> Your Shopping Bag ({cartCount})
                </h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 hover:text-primary hover:bg-cream rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer List */}
              <div className="flex-grow overflow-y-auto px-6 py-4 divide-y divide-cream-dark/15">
                {cartItems.length > 0 ? (
                  cartItems.map((item) => (
                    <div key={item._id} className="py-4 flex gap-4">
                      {/* Thumbnail */}
                      <div className="w-20 aspect-[3/4] bg-cream-dark/10 shrink-0 rounded overflow-hidden border border-cream-dark/20 flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-primary/40 font-serif font-bold uppercase text-center leading-none">BTT</span>
                        )}
                      </div>
                      
                      {/* Item Details */}
                      <div className="flex-grow flex flex-col">
                        <Link 
                          to={`/saree/${item._id}`} 
                          className="font-serif text-sm font-semibold text-charcoal hover:text-primary line-clamp-1 mb-1"
                        >
                          {item.name}
                        </Link>
                        <span className="text-[10px] text-charcoal-light font-mono uppercase mb-2">SKU: {item.sku}</span>
                        
                        {/* Qty and Price line */}
                        <div className="flex items-center justify-between mt-auto">
                          {/* Qty Selector */}
                          <div className="flex items-center border border-cream-dark/40 rounded bg-cream-light">
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="px-2 py-0.5 hover:bg-cream-dark/25 text-xs text-charcoal font-semibold"
                            >
                              -
                            </button>
                            <span className="px-3 text-xs text-charcoal font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="px-2 py-0.5 hover:bg-cream-dark/25 text-xs text-charcoal font-semibold"
                            >
                              +
                            </button>
                          </div>
                          
                          {/* Price */}
                          <span className="text-primary font-bold text-sm">
                            {formatPrice(item.discountPrice ? item.discountPrice * item.quantity : item.price * item.quantity)}
                          </span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-gray-400 hover:text-primary self-center p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-72 text-center py-10">
                    <ShoppingBag className="w-12 h-12 text-cream-dark/50 mb-3" />
                    <p className="font-serif text-base text-charcoal-light font-medium mb-1">Your bag is empty</p>
                    <p className="text-xs text-gray-400">Add beautiful sarees from the catalog to start an inquiry.</p>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              {cartItems.length > 0 && (
                <div className="border-t border-cream-dark/25 px-6 py-6 bg-cream-light">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-charcoal-light uppercase tracking-wider">Estimated Subtotal</span>
                    <span className="text-primary font-bold text-xl">{formatPrice(cartTotal)}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mb-5 leading-normal">
                    * Submit inquiry request to receive direct booking assistance on WhatsApp. No active payment required.
                  </p>
                  <Link
                    to="/cart"
                    className="w-full bg-primary text-white border border-gold/25 py-3 rounded text-center block text-sm font-semibold tracking-wider hover:bg-primary-dark shadow-md hover:shadow-lg transition-luxury"
                  >
                    View Cart & Submit Inquiry
                  </Link>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          B. SEARCH OVERLAY
          ========================================== */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-charcoal/65 backdrop-blur-[4px] flex items-start justify-center pt-24" id="search-overlay">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden border border-cream-dark/30 mx-4">
            <form onSubmit={handleSearchSubmit} className="flex items-center p-5 border-b border-cream-dark/25">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Saree type, color, fabric, SKU code, or occasion..."
                className="w-full focus:outline-none text-base text-charcoal bg-transparent placeholder-gray-400"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1 hover:bg-cream rounded-full text-gray-400 hover:text-primary transition-colors ml-3"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
            <div className="px-6 py-4 bg-cream-light text-xs text-charcoal-light flex items-center justify-between gap-4 flex-wrap">
              <span>Popular searches:</span>
              <div className="flex gap-2 flex-wrap">
                <Link to="/shop?search=Silk" className="bg-white border border-cream-dark/45 px-2 py-0.5 rounded hover:border-gold hover:text-primary">Silk</Link>
                <Link to="/shop?search=Banarasi" className="bg-white border border-cream-dark/45 px-2 py-0.5 rounded hover:border-gold hover:text-primary">Banarasi</Link>
                <Link to="/shop?search=Bridal" className="bg-white border border-cream-dark/45 px-2 py-0.5 rounded hover:border-gold hover:text-primary">Bridal</Link>
                <Link to="/shop?search=Cotton" className="bg-white border border-cream-dark/45 px-2 py-0.5 rounded hover:border-gold hover:text-primary">Cotton</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          C. MOBILE MENU DRAWER
          ========================================== */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" id="mobile-menu-drawer">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-charcoal/45 backdrop-blur-[2px]" 
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative flex-grow max-w-[280px] bg-white h-full shadow-2xl flex flex-col justify-between border-r border-cream-dark/30">
            {/* Header */}
            <div>
              <div className="p-4 border-b border-cream-dark/20 flex items-center justify-between">
                <span className="font-serif text-lg font-bold text-primary tracking-widest uppercase">Navigation</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-cream rounded text-charcoal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="py-4 px-4 overflow-y-auto space-y-3 font-medium text-sm text-charcoal-light flex flex-col">
                <Link to="/" className="py-2 border-b border-cream/35 hover:text-primary">Home</Link>
                <Link to="/shop?isNewArrival=true" className="py-2 border-b border-cream/35 hover:text-primary">New Arrivals</Link>
                <Link to="/shop?isBestSeller=true" className="py-2 border-b border-cream/35 hover:text-primary">Best Sellers</Link>
                
                {/* Saree Categories */}
                <div className="py-2 border-b border-cream/35">
                  <span className="text-xs uppercase text-gold font-bold tracking-widest block mb-2">Saree Types</span>
                  <div className="pl-3 flex flex-col gap-2 max-h-40 overflow-y-auto">
                    {activeCats.map(cat => (
                      <Link key={cat._id} to={`/shop?category=${encodeURIComponent(cat.title)}`} className="text-xs hover:text-primary py-0.5">{cat.title}</Link>
                    ))}
                  </div>
                </div>

                {/* Collections */}
                <div className="py-2 border-b border-cream/35">
                  <span className="text-xs uppercase text-gold font-bold tracking-widest block mb-2">Collections</span>
                  <div className="pl-3 flex flex-col gap-2 max-h-40 overflow-y-auto">
                    {activeColls.map(coll => (
                      <Link key={coll._id} to={`/shop?collection=${encodeURIComponent(coll.title)}`} className="text-xs hover:text-primary py-0.5">{coll.title}</Link>
                    ))}
                  </div>
                </div>

                <Link to="/shop?discount=true" className="py-2 border-b border-cream/35 text-rose-600">Sale Offers</Link>
                <Link to="/about" className="py-2 border-b border-cream/35 hover:text-primary">About Us</Link>
                <Link to="/contact" className="py-2 border-b border-cream/35 hover:text-primary">Contact Us</Link>
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="p-4 bg-cream-light border-t border-cream-dark/25 flex flex-col gap-2 select-none">
              <Link 
                to={customerUser ? "/profile" : "/login"} 
                className="w-full bg-primary text-white border border-gold/30 py-2.5 rounded text-center text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <User className="w-4 h-4" /> {customerUser ? 'My Account' : 'Login / Register'}
              </Link>
              <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 px-1">
                <span>Bani Thani Textiles • Jaipur</span>
                <Link to="/admin" className="text-primary hover:underline font-bold">Admin Portal</Link>
              </div>
            </div>

          </div>
        </div>
      )}

    </header>
  );
};

export default Navbar;
