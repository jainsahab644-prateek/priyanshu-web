import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowRight, Star, Award, ShieldCheck } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const { settings, categories, collections } = useSettings();
  const [banners, setBanners] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);

  // Fetch banners and sarees
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('/api/banners');
        if (res.ok) {
          const data = await res.json();
          setBanners(data);
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
      }
    };

    const fetchSarees = async () => {
      try {
        // Fetch new arrivals
        const resNew = await fetch('/api/sarees?isNewArrival=true');
        if (resNew.ok) {
          const data = await resNew.json();
          setNewArrivals(data.slice(0, 4));
        }
        
        // Fetch best sellers
        const resBest = await fetch('/api/sarees?isBestSeller=true');
        if (resBest.ok) {
          const data = await resBest.json();
          setBestSellers(data.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching catalog items:', err);
      }
    };

    fetchBanners();
    fetchSarees();
  }, []);

  // Slide duration timer
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners]);

  // Default banners if none uploaded by admin
  const defaultBanners = [
    {
      _id: 'default-1',
      title: 'The Royal Heritage Weaves',
      subtitle: 'Experience sheer elegance with our hand-woven Silk & Kanjivaram masterpieces.',
      buttonText: 'Explore Collection',
      buttonLink: '/shop?category=Silk%20Sarees',
      isDefault: true
    },
    {
      _id: 'default-2',
      title: 'Timeless Banarasi Artistry',
      subtitle: 'Pure gold zari work hand-crafted by master weavers of Varanasi.',
      buttonText: 'Shop Best Sellers',
      buttonLink: '/shop?category=Banarasi%20Sarees',
      isDefault: true
    }
  ];

  const activeBanners = banners.length > 0 ? banners : defaultBanners;
  const activeCats = categories.filter(c => c.isActive).slice(0, 6);
  const homeCollections = collections.filter(c => c.isActive && c.showOnHome).slice(0, 3);

  return (
    <div className="pb-10">
      
      {/* ==========================================
          1. HERO BANNER SLIDER
          ========================================== */}
      <section className="relative h-[65vh] sm:h-[75vh] bg-primary-dark overflow-hidden w-full">
        {activeBanners.map((banner, index) => (
          <div
            key={banner._id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background image or default gradient */}
            {banner.desktopImage && !banner.isDefault ? (
              <>
                <img
                  src={banner.desktopImage}
                  alt={banner.title}
                  className="hidden md:block w-full h-full object-cover opacity-60"
                />
                <img
                  src={banner.mobileImage || banner.desktopImage}
                  alt={banner.title}
                  className="block md:hidden w-full h-full object-cover opacity-60"
                />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary to-primary-dark flex items-center justify-center border-b-2 border-gold/30">
                {/* Traditional Background Motif lines */}
                <div className="absolute inset-0 opacity-5 border border-gold/20 m-6 rounded-md double-border" />
              </div>
            )}

            {/* Content overlay */}
            <div className="absolute inset-0 flex items-center justify-center text-center px-4 z-20">
              <div className="max-w-3xl border border-gold/20 bg-primary-dark/40 backdrop-blur-[3px] p-8 sm:p-12 rounded-lg m-4 gold-border-glow select-none">
                <span className="text-gold uppercase tracking-[0.25em] text-xs font-bold block mb-3 font-serif">
                  Bani Thani Textiles
                </span>
                <h1 className="font-serif text-white text-3xl sm:text-5xl font-semibold tracking-wide leading-tight mb-4">
                  {banner.title}
                </h1>
                <p className="text-cream/90 text-sm sm:text-base mb-8 max-w-xl mx-auto leading-relaxed font-light">
                  {banner.subtitle}
                </p>
                <RouterLink
                  to={banner.buttonLink}
                  className="inline-block bg-primary text-white border border-gold hover:bg-gold hover:text-charcoal px-8 py-3 rounded text-sm font-semibold tracking-widest uppercase transition-all duration-300 shadow-lg hover:scale-105"
                >
                  {banner.buttonText}
                </RouterLink>
              </div>
            </div>
          </div>
        ))}

        {/* Slide navigation dots */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2.5 z-30">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === activeSlide ? 'bg-gold w-6' : 'bg-white/40'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ==========================================
          2. SHOP BY TYPE / CATEGORIES
          ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <span className="text-gold font-serif text-base italic block mb-1">Weaves of India</span>
          <h2 className="font-serif text-charcoal text-3xl font-semibold tracking-wide uppercase">
            Shop By Saree Type
          </h2>
          <div className="w-24 h-0.5 bg-gold mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {activeCats.map((cat) => (
            <RouterLink
              key={cat._id}
              to={`/shop?category=${encodeURIComponent(cat.title)}`}
              className="group flex flex-col items-center p-6 bg-white rounded-lg border border-cream-dark/20 text-center shadow-sm hover:shadow-md transition-all duration-300 gold-border-glow-hover"
            >
              {/* Category Circle Emblem */}
              <div className="w-16 h-16 rounded-full bg-cream border border-gold/40 flex items-center justify-center text-primary font-serif font-semibold text-lg mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300 select-none">
                {cat.title.slice(0, 2)}
              </div>
              <h3 className="font-serif text-charcoal group-hover:text-primary transition-colors text-sm font-semibold mb-1">
                {cat.title}
              </h3>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                {cat.subcategories?.length || 0} Subtypes
              </span>
            </RouterLink>
          ))}
        </div>
      </section>

      {/* ==========================================
          3. FEATURED COLLECTIONS
          ========================================== */}
      {homeCollections.length > 0 && (
        <section className="bg-cream-light py-16 sm:py-20 border-t border-b border-cream-dark/25">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-gold font-serif text-base italic block mb-1">Curated Closets</span>
              <h2 className="font-serif text-charcoal text-3xl font-semibold tracking-wide uppercase">
                Featured Collections
              </h2>
              <div className="w-24 h-0.5 bg-gold mx-auto mt-3" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {homeCollections.map((coll) => (
                <RouterLink
                  key={coll._id}
                  to={`/shop?collection=${encodeURIComponent(coll.title)}`}
                  className="group bg-white border border-cream-dark/30 rounded-lg overflow-hidden flex flex-col h-full hover:shadow-lg transition-all duration-300"
                >
                  <div className="aspect-[16/9] w-full bg-primary-dark relative overflow-hidden flex items-center justify-center">
                    {coll.bannerImage ? (
                      <img
                        src={coll.bannerImage}
                        alt={coll.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-primary/75 p-6 flex flex-col items-center justify-center text-center border-b border-gold/20 select-none">
                        <span className="font-serif text-gold text-lg tracking-widest font-semibold uppercase">{coll.title}</span>
                        <span className="text-[10px] text-cream/70 uppercase tracking-widest mt-1 block">Bani Thani Textiles</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-serif text-charcoal text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {coll.title}
                    </h3>
                    <p className="text-charcoal-light text-xs leading-relaxed line-clamp-2 mb-4">
                      {coll.description}
                    </p>
                    <span className="text-primary font-bold text-xs uppercase tracking-widest mt-auto inline-flex items-center gap-1.5 group-hover:text-gold transition-colors">
                      View Collection <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </RouterLink>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
          4. NEW ARRIVALS SECTION
          ========================================== */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 border-b border-cream-dark/15 pb-4">
            <div>
              <span className="text-gold font-serif text-base italic block">Loom Fresh Creations</span>
              <h2 className="font-serif text-charcoal text-2xl sm:text-3xl font-semibold tracking-wide uppercase">
                New Arrivals
              </h2>
            </div>
            <RouterLink
              to="/shop?isNewArrival=true"
              className="text-primary hover:text-gold text-sm font-semibold tracking-wider uppercase inline-flex items-center gap-1.5 group border-b border-transparent hover:border-gold pb-0.5"
            >
              See All New Arrivals <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </RouterLink>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {newArrivals.map(saree => (
              <ProductCard key={saree._id} saree={saree} />
            ))}
          </div>
        </section>
      )}

      {/* ==========================================
          5. BEST SELLERS SECTION
          ========================================== */}
      {bestSellers.length > 0 && (
        <section className="bg-cream-light border-t border-b border-cream-dark/25 py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 border-b border-cream-dark/15 pb-4">
              <div>
                <span className="text-gold font-serif text-base italic block">Artisan Masterpieces</span>
                <h2 className="font-serif text-charcoal text-2xl sm:text-3xl font-semibold tracking-wide uppercase">
                  Best Seller Sarees
                </h2>
              </div>
              <RouterLink
                to="/shop?isBestSeller=true"
                className="text-primary hover:text-gold text-sm font-semibold tracking-wider uppercase inline-flex items-center gap-1.5 group border-b border-transparent hover:border-gold pb-0.5"
              >
                Explore Best Sellers <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </RouterLink>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {bestSellers.map(saree => (
                <ProductCard key={saree._id} saree={saree} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
          6. SHORT BRAND STORY / VALUE PROP
          ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
        <div className="max-w-3xl mx-auto bg-white border border-cream-dark/30 rounded-lg p-8 sm:p-12 shadow-sm gold-border-glow relative">
          {/* Motif elements */}
          <div className="absolute top-4 left-4 border-l border-t border-gold/30 w-8 h-8" />
          <div className="absolute bottom-4 right-4 border-r border-b border-gold/30 w-8 h-8" />

          <span className="text-gold uppercase tracking-[0.25em] text-xs font-bold block mb-3 font-serif">
            Bani Thani Textiles
          </span>
          <h2 className="font-serif text-charcoal text-2xl sm:text-3xl font-semibold mb-6">
            {settings?.aboutPageContent?.title || 'Crafting Indian Elegance'}
          </h2>
          <p className="text-charcoal-light text-sm sm:text-base leading-relaxed mb-8 font-light">
            {settings?.aboutPageContent?.story || 'Bani Thani Textiles is born from a desire to celebrate the rich tradition of Indian handloom. Inspired by classic Rajasthani Bani Thani miniature arts representing sheer poise and traditional beauty, we bring you custom weaves and heritage designs.'}
          </p>

          {/* Core Values grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center border-t border-cream-dark/20 pt-8 mt-6">
            <div className="flex flex-col items-center">
              <Star className="w-6 h-6 text-gold mb-2" />
              <h4 className="font-serif text-charcoal font-semibold text-sm mb-1">Fine Quality</h4>
              <p className="text-[11px] text-gray-400">Pure silk and gold zari threads</p>
            </div>
            <div className="flex flex-col items-center">
              <Award className="w-6 h-6 text-gold mb-2" />
              <h4 className="font-serif text-charcoal font-semibold text-sm mb-1">Authentic Weaves</h4>
              <p className="text-[11px] text-gray-400">Supporting artisan weavers</p>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-6 h-6 text-gold mb-2" />
              <h4 className="font-serif text-charcoal font-semibold text-sm mb-1">Secure Inquiry</h4>
              <p className="text-[11px] text-gray-400">Personalized booking support</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
