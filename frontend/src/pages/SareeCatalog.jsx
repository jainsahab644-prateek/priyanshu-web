import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, X, Check, Loader2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import ProductCard from '../components/ProductCard';

const SareeCatalog = () => {
  const { categories, collections } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sarees, setSarees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedCollection, setSelectedCollection] = useState(searchParams.get('collection') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || '');
  const [selectedFabric, setSelectedFabric] = useState(searchParams.get('fabric') || '');
  const [selectedOccasion, setSelectedOccasion] = useState(searchParams.get('occasion') || '');
  const [onlyDiscount, setOnlyDiscount] = useState(searchParams.get('discount') === 'true');
  const [onlyNew, setOnlyNew] = useState(searchParams.get('isNewArrival') === 'true');
  const [onlyBest, setOnlyBest] = useState(searchParams.get('isBestSeller') === 'true');
  const [stockStatus, setStockStatus] = useState(searchParams.get('stockStatus') || '');
  const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'latest');

  const searchQuery = searchParams.get('search') || '';

  // Synchronize state with URL parameters
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedCollection(searchParams.get('collection') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSelectedColor(searchParams.get('color') || '');
    setSelectedFabric(searchParams.get('fabric') || '');
    setSelectedOccasion(searchParams.get('occasion') || '');
    setOnlyDiscount(searchParams.get('discount') === 'true');
    setOnlyNew(searchParams.get('isNewArrival') === 'true');
    setOnlyBest(searchParams.get('isBestSeller') === 'true');
    setStockStatus(searchParams.get('stockStatus') || '');
    setSortOption(searchParams.get('sort') || 'latest');
  }, [searchParams]);

  // Fetch sarees from backend based on parameters
  useEffect(() => {
    const fetchSarees = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedCategory) queryParams.set('category', selectedCategory);
        if (selectedCollection) queryParams.set('collection', selectedCollection);
        if (minPrice) queryParams.set('minPrice', minPrice);
        if (maxPrice) queryParams.set('maxPrice', maxPrice);
        if (selectedColor) queryParams.set('color', selectedColor);
        if (selectedFabric) queryParams.set('fabric', selectedFabric);
        if (selectedOccasion) queryParams.set('occasion', selectedOccasion);
        if (onlyDiscount) queryParams.set('discount', 'true');
        if (onlyNew) queryParams.set('isNewArrival', 'true');
        if (onlyBest) queryParams.set('isBestSeller', 'true');
        if (stockStatus) queryParams.set('stockStatus', stockStatus);
        if (searchQuery) queryParams.set('search', searchQuery);
        if (sortOption) queryParams.set('sort', sortOption);

        const response = await fetch(`/api/sarees?${queryParams.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setSarees(data);
        }
      } catch (error) {
        console.error('Error fetching sarees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSarees();
  }, [
    selectedCategory,
    selectedCollection,
    minPrice,
    maxPrice,
    selectedColor,
    selectedFabric,
    selectedOccasion,
    onlyDiscount,
    onlyNew,
    onlyBest,
    stockStatus,
    searchQuery,
    sortOption
  ]);

  const updateUrlParams = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
    setIsMobileFiltersOpen(false);
  };

  // Get unique attributes from loaded dataset for dynamic filters
  const [availableColors, setAvailableColors] = useState([]);
  const [availableFabrics, setAvailableFabrics] = useState([]);
  const [availableOccasions, setAvailableOccasions] = useState([]);

  useEffect(() => {
    // We can fetch a list of all sarees once to compile unique values
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch('/api/sarees');
        if (response.ok) {
          const allSarees = await response.json();
          
          const colors = [...new Set(allSarees.map(s => s.color).filter(Boolean))];
          const fabrics = [...new Set(allSarees.map(s => s.fabric).filter(Boolean))];
          const occasions = [...new Set(allSarees.map(s => s.occasion).filter(Boolean))];
          
          setAvailableColors(colors);
          setAvailableFabrics(fabrics);
          setAvailableOccasions(occasions);
        }
      } catch (err) {
        console.error('Error loading filter specs:', err);
      }
    };
    fetchFilterOptions();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Page Header Title */}
      <div className="border-b border-cream-dark/20 pb-6 mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary tracking-wide">
            {selectedCategory || selectedCollection || (searchQuery ? 'Search Results' : 'Saree Collection')}
          </h1>
          <p className="text-xs text-charcoal-light uppercase tracking-wider mt-1">
            {searchQuery ? `Showing results for "${searchQuery}"` : 'Browse our premium handcrafted sarees'}
          </p>
        </div>
        <div className="text-xs text-gray-400 font-medium">
          {sarees.length} Products Found
        </div>
      </div>

      {/* Mobile control panel */}
      <div className="flex items-center justify-between gap-4 py-3 bg-white border border-cream-dark/20 rounded-md px-4 mb-6 lg:hidden">
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex items-center gap-2 text-xs font-semibold text-charcoal active:text-primary"
        >
          <SlidersHorizontal className="w-4 h-4 text-gold" /> Filter Sarees
        </button>
        
        <div className="flex items-center gap-2 border-l border-cream-dark/20 pl-4">
          <ArrowUpDown className="w-3.5 h-3.5 text-gold" />
          <select
            value={sortOption}
            onChange={(e) => updateUrlParams('sort', e.target.value)}
            className="text-xs font-medium text-charcoal bg-transparent border-none focus:outline-none"
          >
            <option value="latest">Latest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popular">Popularity</option>
            <option value="discount">Highest Discount</option>
          </select>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* ==========================================
            1. DESKTOP FILTER SIDEBAR (Visible on lg)
            ========================================== */}
        <aside className="hidden lg:block space-y-6">
          <div className="bg-white border border-cream-dark/30 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-cream-dark/20 pb-3 mb-4">
              <span className="font-serif text-sm font-bold uppercase tracking-wider text-charcoal">Filters</span>
              <button 
                onClick={handleClearFilters}
                className="text-[10px] text-primary hover:text-gold uppercase tracking-wider font-bold"
              >
                Clear All
              </button>
            </div>

            {/* Category Filter */}
            <div className="py-4 border-b border-cream-dark/15">
              <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-primary mb-3">Saree Type</h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => updateUrlParams('category', '')}
                  className={`w-full text-left text-xs py-1 px-2 rounded transition-colors ${!selectedCategory ? 'bg-primary text-white font-semibold' : 'hover:bg-cream text-charcoal'}`}
                >
                  All Sarees
                </button>
                {categories.filter(c => c.isActive).map(cat => (
                  <button
                    key={cat._id}
                    onClick={() => updateUrlParams('category', cat.title)}
                    className={`w-full text-left text-xs py-1 px-2 rounded transition-colors flex items-center justify-between ${selectedCategory === cat.title ? 'bg-primary text-white font-semibold' : 'hover:bg-cream text-charcoal'}`}
                  >
                    <span>{cat.title}</span>
                    {selectedCategory === cat.title && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Collection Filter */}
            <div className="py-4 border-b border-cream-dark/15">
              <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-primary mb-3">Collections</h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => updateUrlParams('collection', '')}
                  className={`w-full text-left text-xs py-1 px-2 rounded transition-colors ${!selectedCollection ? 'bg-primary text-white font-semibold' : 'hover:bg-cream text-charcoal'}`}
                >
                  All Collections
                </button>
                {collections.filter(c => c.isActive).map(coll => (
                  <button
                    key={coll._id}
                    onClick={() => updateUrlParams('collection', coll.title)}
                    className={`w-full text-left text-xs py-1 px-2 rounded transition-colors flex items-center justify-between ${selectedCollection === coll.title ? 'bg-primary text-white font-semibold' : 'hover:bg-cream text-charcoal'}`}
                  >
                    <span>{coll.title}</span>
                    {selectedCollection === coll.title && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Fabric Filter */}
            {availableFabrics.length > 0 && (
              <div className="py-4 border-b border-cream-dark/15">
                <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-primary mb-3">Fabric</h4>
                <div className="space-y-1 flex flex-col">
                  {availableFabrics.map(fab => (
                    <label key={fab} className="inline-flex items-center text-xs text-charcoal py-1 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="fabric_filter"
                        checked={selectedFabric === fab}
                        onChange={() => updateUrlParams('fabric', fab)}
                        className="mr-2 text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                      <span>{fab}</span>
                    </label>
                  ))}
                  {selectedFabric && (
                    <button
                      onClick={() => updateUrlParams('fabric', '')}
                      className="text-[10px] text-primary hover:underline text-left mt-2"
                    >
                      Clear fabric filter
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Color Filter */}
            {availableColors.length > 0 && (
              <div className="py-4 border-b border-cream-dark/15">
                <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-primary mb-3">Color</h4>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map(color => (
                    <button
                      key={color}
                      onClick={() => updateUrlParams('color', selectedColor === color ? '' : color)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        selectedColor === color
                          ? 'bg-primary border-primary text-white font-semibold'
                          : 'border-cream-dark/45 bg-cream-light text-charcoal hover:border-gold'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Filter Inputs */}
            <div className="py-4 border-b border-cream-dark/15">
              <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-primary mb-3">Price Range</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateUrlParams('minPrice', e.target.value)}
                  className="w-full text-xs border border-cream-dark/40 rounded px-2.5 py-1.5 focus:outline-none focus:border-gold bg-cream-light text-charcoal"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateUrlParams('maxPrice', e.target.value)}
                  className="w-full text-xs border border-cream-dark/40 rounded px-2.5 py-1.5 focus:outline-none focus:border-gold bg-cream-light text-charcoal"
                />
              </div>
            </div>

            {/* Special Badges Checkboxes */}
            <div className="py-4 space-y-2">
              <label className="inline-flex items-center text-xs text-charcoal cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyDiscount}
                  onChange={(e) => updateUrlParams('discount', e.target.checked ? 'true' : '')}
                  className="mr-2 text-primary focus:ring-primary rounded border-cream-dark/40"
                />
                <span>Sale / Discount Items</span>
              </label>

              <label className="inline-flex items-center text-xs text-charcoal cursor-pointer select-none block">
                <input
                  type="checkbox"
                  checked={onlyNew}
                  onChange={(e) => updateUrlParams('isNewArrival', e.target.checked ? 'true' : '')}
                  className="mr-2 text-primary focus:ring-primary rounded border-cream-dark/40"
                />
                <span>New Arrival Badges</span>
              </label>

              <label className="inline-flex items-center text-xs text-charcoal cursor-pointer select-none block">
                <input
                  type="checkbox"
                  checked={onlyBest}
                  onChange={(e) => updateUrlParams('isBestSeller', e.target.checked ? 'true' : '')}
                  className="mr-2 text-primary focus:ring-primary rounded border-cream-dark/40"
                />
                <span>Best Seller Badges</span>
              </label>

              <label className="inline-flex items-center text-xs text-charcoal cursor-pointer select-none block">
                <input
                  type="checkbox"
                  checked={stockStatus === 'in_stock'}
                  onChange={(e) => updateUrlParams('stockStatus', e.target.checked ? 'in_stock' : '')}
                  className="mr-2 text-primary focus:ring-primary rounded border-cream-dark/40"
                />
                <span>Exclude Out of Stock</span>
              </label>
            </div>

          </div>
        </aside>

        {/* ==========================================
            2. PRODUCT LISTING AREA
            ========================================== */}
        <main className="lg:col-span-3">
          
          {/* Desktop Sort Bar (Hidden on Mobile) */}
          <div className="hidden lg:flex items-center justify-between border border-cream-dark/20 rounded-lg p-4 bg-white mb-6">
            <span className="text-xs text-charcoal-light font-medium">
              Showing {sarees.length} sarees
            </span>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-charcoal uppercase tracking-wider">Sort By:</span>
              <select
                value={sortOption}
                onChange={(e) => updateUrlParams('sort', e.target.value)}
                className="text-xs border border-cream-dark/40 bg-cream-light text-charcoal rounded px-3 py-1.5 focus:outline-none focus:border-gold font-medium"
              >
                <option value="latest">Latest Weaves</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Popularity</option>
                <option value="discount">Highest Discount</option>
              </select>
            </div>
          </div>

          {/* Loader */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
              <p className="font-serif text-charcoal-light text-sm italic">Sieving through royal threads...</p>
            </div>
          ) : sarees.length > 0 ? (
            /* Product Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {sarees.map((saree) => (
                <ProductCard key={saree._id} saree={saree} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white border border-cream-dark/35 rounded-lg p-16 text-center shadow-sm">
              <SlidersHorizontal className="w-12 h-12 text-cream-dark/60 mx-auto mb-4" />
              <h3 className="font-serif text-lg font-bold text-charcoal mb-2">No matching sarees found</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">
                We couldn't find any sarees matching your active filters. Try broadening your criteria or resetting filters.
              </p>
              <button
                onClick={handleClearFilters}
                className="bg-primary text-white border border-gold/30 px-6 py-2.5 rounded text-xs font-semibold tracking-widest uppercase hover:bg-primary-dark transition-all"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>

      </div>

      {/* ==========================================
          3. MOBILE FILTERS DRAWER (Visible on Mobile)
          ========================================== */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-charcoal/50 backdrop-blur-[2px]"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          
          <div className="relative w-screen max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between z-10 border-r border-cream-dark/30">
            {/* Header */}
            <div className="p-4 border-b border-cream-dark/20 flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-primary uppercase">Filter Sarees</h3>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-1.5 hover:bg-cream rounded text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filters */}
            <div className="flex-grow overflow-y-auto p-4 space-y-6">
              
              {/* Category */}
              <div>
                <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-primary mb-2.5">Saree Type</h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  <button
                    onClick={() => { updateUrlParams('category', ''); }}
                    className={`w-full text-left text-xs py-1 px-2 rounded transition-colors ${!selectedCategory ? 'bg-primary text-white font-semibold' : 'hover:bg-cream text-charcoal'}`}
                  >
                    All Types
                  </button>
                  {categories.filter(c => c.isActive).map(cat => (
                    <button
                      key={cat._id}
                      onClick={() => { updateUrlParams('category', cat.title); }}
                      className={`w-full text-left text-xs py-1 px-2 rounded transition-colors ${selectedCategory === cat.title ? 'bg-primary text-white font-semibold' : 'hover:bg-cream text-charcoal'}`}
                    >
                      {cat.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Collections */}
              <div>
                <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-primary mb-2.5">Collections</h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  <button
                    onClick={() => { updateUrlParams('collection', ''); }}
                    className={`w-full text-left text-xs py-1 px-2 rounded transition-colors ${!selectedCollection ? 'bg-primary text-white font-semibold' : 'hover:bg-cream text-charcoal'}`}
                  >
                    All Collections
                  </button>
                  {collections.filter(c => c.isActive).map(coll => (
                    <button
                      key={coll._id}
                      onClick={() => { updateUrlParams('collection', coll.title); }}
                      className={`w-full text-left text-xs py-1 px-2 rounded transition-colors ${selectedCollection === coll.title ? 'bg-primary text-white font-semibold' : 'hover:bg-cream text-charcoal'}`}
                    >
                      {coll.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fabric */}
              {availableFabrics.length > 0 && (
                <div>
                  <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-primary mb-2.5">Fabric</h4>
                  <div className="space-y-1 flex flex-col">
                    {availableFabrics.map(fab => (
                      <label key={fab} className="inline-flex items-center text-xs text-charcoal py-1">
                        <input
                          type="radio"
                          name="mobile_fabric_filter"
                          checked={selectedFabric === fab}
                          onChange={() => updateUrlParams('fabric', fab)}
                          className="mr-2 text-primary focus:ring-primary h-3.5 w-3.5"
                        />
                        <span>{fab}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div>
                <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-primary mb-2.5">Price Range</h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => updateUrlParams('minPrice', e.target.value)}
                    className="w-full text-xs border border-cream-dark/45 rounded p-2 focus:outline-none bg-cream-light"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => updateUrlParams('maxPrice', e.target.value)}
                    className="w-full text-xs border border-cream-dark/45 rounded p-2 focus:outline-none bg-cream-light"
                  />
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-cream-dark/20 bg-cream-light grid grid-cols-2 gap-3.5">
              <button
                onClick={handleClearFilters}
                className="py-2 border border-cream-dark/45 text-charcoal text-xs font-semibold rounded text-center"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="py-2 bg-primary text-white text-xs font-semibold rounded text-center"
              >
                Apply
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default SareeCatalog;
