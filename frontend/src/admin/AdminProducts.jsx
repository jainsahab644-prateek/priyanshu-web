import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Trash2, Edit2, Eye, EyeOff, Loader2, X, AlertCircle, ShoppingBag } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const AdminProducts = () => {
  const { categories, collections, refreshAll } = useSettings();
  const [sarees, setSarees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null); // null if adding, saree._id if editing
  const [modalError, setModalError] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [collection, setCollection] = useState('');
  const [description, setDescription] = useState('');
  const [fabric, setFabric] = useState('');
  const [color, setColor] = useState('');
  const [length, setLength] = useState('5.5 Meters');
  const [blousePiece, setBlousePiece] = useState(true);
  const [workType, setWorkType] = useState('');
  const [occasion, setOccasion] = useState('');
  const [washCare, setWashCare] = useState('Dry Clean Only');
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSale, setIsSale] = useState(false);
  const [stockStatus, setStockStatus] = useState('in_stock');
  const [stockQty, setStockQty] = useState(1);
  const [isVisible, setIsVisible] = useState(true);
  
  // Image states in form
  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const fetchSarees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/sarees', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSarees(data);
      }
    } catch (error) {
      console.error('Error fetching admin sarees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSarees();
  }, []);

  const handleOpenAddModal = () => {
    setEditId(null);
    setModalError('');
    // Clear all form fields
    setName('');
    setSku('');
    setPrice('');
    setDiscountPrice('');
    setCategory(categories[0]?.title || '');
    setSubcategory('');
    setCollection('');
    setDescription('');
    setFabric('');
    setColor('');
    setLength('5.5 Meters');
    setBlousePiece(true);
    setWorkType('');
    setOccasion('');
    setWashCare('Dry Clean Only');
    setIsNewArrival(false);
    setIsBestSeller(false);
    setIsFeatured(false);
    setIsSale(false);
    setStockStatus('in_stock');
    setStockQty(5);
    setIsVisible(true);
    setExistingImages([]);
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setIsModalOpen(true);
  };

  const handleOpenEditModal = (saree) => {
    setEditId(saree._id);
    setModalError('');
    
    setName(saree.name);
    setSku(saree.sku || '');
    setPrice(saree.price);
    setDiscountPrice(saree.discountPrice || '');
    setCategory(saree.category || '');
    setSubcategory(saree.subcategory || '');
    setCollection(saree.collection || '');
    setDescription(saree.description || '');
    setFabric(saree.fabric || '');
    setColor(saree.color || '');
    setLength(saree.length || '5.5 Meters');
    setBlousePiece(saree.blousePiece);
    setWorkType(saree.workType || '');
    setOccasion(saree.occasion || '');
    setWashCare(saree.washCare || 'Dry Clean Only');
    setIsNewArrival(saree.isNewArrival);
    setIsBestSeller(saree.isBestSeller);
    setIsFeatured(saree.isFeatured);
    setIsSale(saree.isSale);
    setStockStatus(saree.stockStatus || 'in_stock');
    setStockQty(saree.stockQty || 0);
    setIsVisible(saree.isVisible);
    setExistingImages(saree.images || []);
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this saree from the catalog? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/sarees/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchSarees();
        refreshAll();
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to delete saree');
      }
    } catch (e) {
      console.error(e);
      alert('Network error occurred.');
    }
  };

  const handleToggleVisibility = async (saree) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/sarees/${saree._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...saree,
          isVisible: !saree.isVisible
        })
      });
      if (response.ok) {
        fetchSarees();
        refreshAll();
      }
    } catch (e) {
      console.error('Error toggling visibility:', e);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleRemoveSelectedFile = (idx) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveExistingImage = (imgUrl) => {
    setExistingImages(prev => prev.filter(img => img !== imgUrl));
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!name.trim()) return setModalError('Saree Name is required.');
    if (!price || Number(price) <= 0) return setModalError('Valid Saree Price is required.');
    if (!category) return setModalError('Category is required.');

    setModalSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('sku', sku.trim());
      formData.append('price', price);
      formData.append('discountPrice', discountPrice);
      formData.append('category', category);
      formData.append('subcategory', subcategory.trim());
      formData.append('collection', collection);
      formData.append('description', description.trim());
      formData.append('fabric', fabric.trim());
      formData.append('color', color.trim());
      formData.append('length', length);
      formData.append('blousePiece', blousePiece);
      formData.append('workType', workType.trim());
      formData.append('occasion', occasion.trim());
      formData.append('washCare', washCare);
      formData.append('isNewArrival', isNewArrival);
      formData.append('isBestSeller', isBestSeller);
      formData.append('isFeatured', isFeatured);
      formData.append('isSale', isSale);
      formData.append('stockStatus', stockStatus);
      formData.append('stockQty', stockQty);
      formData.append('isVisible', isVisible);

      // Append files
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      const token = localStorage.getItem('admin_token');

      let response;
      if (editId) {
        // Edit Saree API - append existing images list
        existingImages.forEach(img => {
          formData.append('existingImages', img);
        });
        
        response = await fetch(`/api/admin/sarees/${editId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
      } else {
        // Add Saree API
        response = await fetch('/api/admin/sarees', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save product');
      }

      // Success
      setIsModalOpen(false);
      fetchSarees();
      refreshAll();
    } catch (err) {
      console.error(err);
      setModalError(err.message || 'Server error occurred saving saree details.');
    } finally {
      setModalSubmitting(false);
    }
  };

  // Format currency
  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Filter local sarees list based on search/category/stock params
  let filteredSarees = sarees;
  if (search.trim()) {
    const q = search.toLowerCase();
    filteredSarees = filteredSarees.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      (item.fabric && item.fabric.toLowerCase().includes(q))
    );
  }
  if (catFilter) {
    filteredSarees = filteredSarees.filter(item => item.category === catFilter);
  }
  if (stockFilter) {
    if (stockFilter === 'low') {
      filteredSarees = filteredSarees.filter(item => item.stockQty <= 2);
    } else if (stockFilter === 'out') {
      filteredSarees = filteredSarees.filter(item => item.stockStatus === 'out_of_stock' || item.stockQty === 0);
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-cream-dark/20 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary tracking-wide">
            Manage Saree Catalog
          </h1>
          <p className="text-xs text-charcoal-light uppercase tracking-wider mt-1">
            Create, edit, delete, and control public catalog items
          </p>
        </div>
        
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-1.5 bg-primary text-white border border-gold/30 hover:bg-primary-dark text-xs font-semibold px-5 py-2.5 rounded shadow-md transition-all uppercase tracking-wider"
        >
          <Plus className="w-4.5 h-4.5 shrink-0" /> Add New Saree
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-cream-dark/25 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-center justify-between text-xs">
        {/* Search */}
        <div className="relative w-full md:max-w-xs text-charcoal">
          <Search className="w-4.5 h-4.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by saree name, SKU, or fabric..."
            className="w-full pl-9 pr-3 py-2 border border-cream-dark/40 bg-cream-light rounded focus:outline-none focus:border-gold text-xs"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3 w-full md:w-auto flex-wrap">
          
          {/* Category */}
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="border border-cream-dark/40 bg-cream-light text-charcoal rounded px-3 py-2 focus:outline-none focus:border-gold"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c._id} value={c.title}>{c.title}</option>
            ))}
          </select>

          {/* Stock */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="border border-cream-dark/40 bg-cream-light text-charcoal rounded px-3 py-2 focus:outline-none focus:border-gold"
          >
            <option value="">All Stock Status</option>
            <option value="low">Low Stock (&lt;= 2)</option>
            <option value="out">Out of Stock</option>
          </select>

        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
          <p className="font-serif text-charcoal-light text-sm italic">Loading inventory list...</p>
        </div>
      ) : (
        <div className="bg-white border border-cream-dark/30 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {filteredSarees.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs select-none">
                <thead>
                  <tr className="bg-cream-light border-b border-cream-dark/15 text-charcoal-light font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Saree</th>
                    <th className="p-4">SKU / Code</th>
                    <th className="p-4">Category</th>
                    <th className="p-4 text-right">Price</th>
                    <th className="p-4 text-center">Stock Qty</th>
                    <th className="p-4 text-center">Visibility</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-dark/10 font-medium text-charcoal-light">
                  {filteredSarees.map((saree) => (
                    <tr key={saree._id} className="hover:bg-cream-light/40 transition-colors">
                      
                      {/* Saree Info & Thumbnail */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 aspect-[3/4] bg-cream-dark/15 rounded border overflow-hidden shrink-0 flex items-center justify-center">
                            {saree.images && saree.images.length > 0 ? (
                              <img src={saree.images[0]} alt={saree.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[8px] font-bold text-primary">BTT</span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-serif font-bold text-charcoal text-sm leading-normal">{saree.name}</span>
                            <span className="text-[9px] text-gray-400 font-normal">{saree.fabric || 'Royal Indian'}</span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="p-4 font-mono uppercase font-semibold">{saree.sku}</td>

                      {/* Category */}
                      <td className="p-4">{saree.category}</td>

                      {/* Price */}
                      <td className="p-4 text-right font-semibold text-charcoal">
                        {saree.discountPrice ? (
                          <div className="flex flex-col text-right">
                            <span className="text-primary font-bold">{formatPrice(saree.discountPrice)}</span>
                            <span className="text-[10px] text-gray-400 line-through">{formatPrice(saree.price)}</span>
                          </div>
                        ) : (
                          <span>{formatPrice(saree.price)}</span>
                        )}
                      </td>

                      {/* Stock qty */}
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          saree.stockQty <= 2 
                            ? 'bg-rose-50 text-rose-800 border border-rose-200' 
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {saree.stockQty} Pcs
                        </span>
                      </td>

                      {/* Visibility Toggle */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleVisibility(saree)}
                          className={`p-1.5 rounded-full border transition-all ${
                            saree.isVisible 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                              : 'bg-rose-50 text-rose-500 border-rose-200'
                          }`}
                          title={saree.isVisible ? 'Hide from store catalog' : 'Show on store catalog'}
                        >
                          {saree.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(saree)}
                            className="p-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded transition-colors"
                            title="Edit Saree details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(saree._id)}
                            className="p-1.5 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 rounded transition-colors"
                            title="Delete Saree product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-16 text-center text-gray-400">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-cream-dark/60" />
                <p className="text-sm font-serif font-bold text-charcoal">No products matching filters found</p>
                <p className="text-xs mt-1">Start by adding a new saree to your catalog database.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          M. SAREE EDITOR DIALOG / POPUP MODAL
          ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/65 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto" id="saree-editor-modal">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-cream-dark/30 my-8">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-primary text-white border-b border-gold/30 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold tracking-wide">
                {editId ? `Edit Saree: ${name}` : 'Add New Saree to Catalog'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-cream hover:bg-primary-dark rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Forms */}
            <form onSubmit={handleSubmitModal} className="flex-grow overflow-y-auto p-6 space-y-6 text-xs font-semibold text-charcoal">
              
              {modalError && (
                <div className="bg-rose-50 text-rose-800 border border-rose-200 p-3 rounded flex items-start gap-2 select-none">
                  <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* SECTION A: Primary Identifiers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label htmlFor="saree-name-input">Saree Title / Name *</label>
                  <input
                    id="saree-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Pure Zari Banarasi Georgette Saree"
                    className="border border-cream-dark/45 rounded p-2 focus:outline-none focus:border-gold bg-cream-light font-medium text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="saree-sku-input">Product SKU / Code</label>
                  <input
                    id="saree-sku-input"
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Leave blank for auto-code"
                    className="border border-cream-dark/45 rounded p-2 focus:outline-none focus:border-gold bg-cream-light font-medium text-xs uppercase"
                  />
                </div>
              </div>

              {/* SECTION B: Categories and Collections */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="saree-cat-select">Saree Category *</label>
                  <select
                    id="saree-cat-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="border border-cream-dark/45 rounded p-2 focus:outline-none focus:border-gold bg-cream-light font-medium text-xs"
                  >
                    {categories.map(c => (
                      <option key={c._id} value={c.title}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="saree-subcat-input">Subcategory (Optional)</label>
                  <input
                    id="saree-subcat-input"
                    type="text"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="e.g. Organza / Katan"
                    className="border border-cream-dark/45 rounded p-2 focus:outline-none focus:border-gold bg-cream-light font-medium text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="saree-coll-select">Theme Collection</label>
                  <select
                    id="saree-coll-select"
                    value={collection}
                    onChange={(e) => setCollection(e.target.value)}
                    className="border border-cream-dark/45 rounded p-2 focus:outline-none focus:border-gold bg-cream-light font-medium text-xs"
                  >
                    <option value="">None / Not in Collection</option>
                    {collections.map(c => (
                      <option key={c._id} value={c.title}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SECTION C: Pricing and Inventory */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="saree-price-input">Base Price (INR) *</label>
                  <input
                    id="saree-price-input"
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 15000"
                    className="border border-cream-dark/45 rounded p-2 focus:outline-none focus:border-gold bg-cream-light font-medium text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="saree-disc-input">Discount Price (INR)</label>
                  <input
                    id="saree-disc-input"
                    type="number"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="Leave blank if no discount"
                    className="border border-cream-dark/45 rounded p-2 focus:outline-none focus:border-gold bg-cream-light font-medium text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="saree-stockqty-input">Stock Quantity</label>
                  <input
                    id="saree-stockqty-input"
                    type="number"
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                    className="border border-cream-dark/45 rounded p-2 focus:outline-none focus:border-gold bg-cream-light font-medium text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="saree-stockstatus-select">Stock Status</label>
                  <select
                    id="saree-stockstatus-select"
                    value={stockStatus}
                    onChange={(e) => setStockStatus(e.target.value)}
                    className="border border-cream-dark/45 rounded p-2 focus:outline-none focus:border-gold bg-cream-light font-medium text-xs"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* SECTION D: Details Spec Sheet */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="saree-fabric-input">Fabric Type</label>
                  <input
                    id="saree-fabric-input"
                    type="text"
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    placeholder="e.g. Katan Silk / Chiffon"
                    className="border border-cream-dark/45 rounded p-2 focus:outline-none focus:border-gold bg-cream-light font-medium text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="saree-color-input">Primary Color</label>
                  <input
                    id="saree-color-input"
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. Royal Maroon"
                    className="border border-cream-dark/45 rounded p-2 focus:outline-none focus:border-gold bg-cream-light font-medium text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="saree-length-input">Saree Length</label>
                  <input
                    id="saree-length-input"
                    type="text"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    placeholder="e.g. 5.5 Meters"
                    className="border border-cream-dark/45 rounded p-2 focus:outline-none focus:border-gold bg-cream-light font-medium text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="saree-work-input">Work pattern / Craft</label>
                  <input
                    id="saree-work-input"
                    type="text"
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value)}
                    placeholder="e.g. Gold Zari woven borders"
                    className="border border-cream-dark/45 rounded p-2 focus:outline-none focus:border-gold bg-cream-light font-medium text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="saree-occ-input">Occasion suitability</label>
                  <input
                    id="saree-occ-input"
                    type="text"
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    placeholder="e.g. Wedding / Festival / Party"
                    className="border border-cream-dark/45 rounded p-2 focus:outline-none focus:border-gold bg-cream-light font-medium text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="saree-wash-input">Wash Care Instructions</label>
                  <input
                    id="saree-wash-input"
                    type="text"
                    value={washCare}
                    onChange={(e) => setWashCare(e.target.value)}
                    placeholder="Dry Clean Only"
                    className="border border-cream-dark/45 rounded p-2 focus:outline-none focus:border-gold bg-cream-light font-medium text-xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label htmlFor="saree-desc-input">Detailed Description</label>
                <textarea
                  id="saree-desc-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the weave, history, artisan clusters details..."
                  rows={3}
                  className="border border-cream-dark/45 rounded p-2.5 focus:outline-none focus:border-gold bg-cream-light font-medium text-xs resize-none"
                />
              </div>

              {/* Marketing badges and Visibility checkboxes */}
              <div className="bg-cream-light border border-cream-dark/25 p-4 rounded-md grid grid-cols-2 sm:grid-cols-5 gap-4">
                <label className="inline-flex items-center text-xs text-charcoal cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="mr-2 text-primary focus:ring-primary rounded border-cream-dark/40"
                  />
                  <span>New Arrival</span>
                </label>

                <label className="inline-flex items-center text-xs text-charcoal cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="mr-2 text-primary focus:ring-primary rounded border-cream-dark/40"
                  />
                  <span>Best Seller</span>
                </label>

                <label className="inline-flex items-center text-xs text-charcoal cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="mr-2 text-primary focus:ring-primary rounded border-cream-dark/40"
                  />
                  <span>Featured Exclusive</span>
                </label>

                <label className="inline-flex items-center text-xs text-charcoal cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isSale}
                    onChange={(e) => setIsSale(e.target.checked)}
                    className="mr-2 text-primary focus:ring-primary rounded border-cream-dark/40"
                  />
                  <span>Discount / Sale</span>
                </label>

                <label className="inline-flex items-center text-xs text-charcoal cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={blousePiece}
                    onChange={(e) => setBlousePiece(e.target.checked)}
                    className="mr-2 text-primary focus:ring-primary rounded border-cream-dark/40"
                  />
                  <span>Blouse Included</span>
                </label>

                <div className="col-span-2 sm:col-span-5 pt-3 border-t border-cream-dark/15 flex items-center gap-6">
                  <label className="inline-flex items-center text-xs text-primary cursor-pointer select-none font-bold">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={(e) => setIsVisible(e.target.checked)}
                      className="mr-2 text-primary focus:ring-primary rounded border-cream-dark/40"
                    />
                    <span>Saree visibility enabled (Show in Catalog)</span>
                  </label>
                </div>
              </div>

              {/* IMAGE UPLOAD SECTION */}
              <div className="space-y-3">
                <span className="font-serif text-xs font-bold uppercase tracking-wider text-primary block">
                  Saree Images Manager
                </span>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Uploaded Images:</span>
                    <div className="flex gap-3 flex-wrap">
                      {existingImages.map((img, idx) => (
                        <div key={img} className="relative w-16 aspect-[3/4] rounded border border-cream-dark/30 overflow-hidden bg-cream">
                          <img src={img} alt={`Existing ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(img)}
                            className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full p-0.5 hover:bg-rose-500 shadow"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2 animate-fade-in">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Files to upload:</span>
                    <div className="flex gap-3 flex-wrap">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="relative w-16 aspect-[3/4] rounded border border-emerald-300 overflow-hidden bg-emerald-50 flex items-center justify-center p-1 text-[9px] text-emerald-800 text-center font-bold break-all">
                          {file.name.slice(0, 15)}...
                          <button
                            type="button"
                            onClick={() => handleRemoveSelectedFile(idx)}
                            className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full p-0.5 hover:bg-rose-500 shadow"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* File picker */}
                <div className="flex flex-col gap-1">
                  <label className="border-2 border-dashed border-cream-dark/45 rounded-lg p-5 text-center cursor-pointer hover:border-gold hover:bg-cream-light transition-all flex flex-col items-center justify-center">
                    <Plus className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs font-semibold text-charcoal">Select images to upload</span>
                    <span className="text-[9px] text-gray-400 mt-1">PNG, JPG, JPEG, WEBP up to 5MB (Up to 5 images)</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Submit Row */}
              <div className="border-t border-cream-dark/20 pt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 border border-cream-dark/45 text-charcoal font-semibold rounded text-center transition-colors hover:bg-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="bg-primary text-white border border-gold hover:bg-primary-dark px-6 py-2 rounded text-center font-semibold tracking-wider flex items-center gap-1.5 shadow-md"
                >
                  {modalSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" /> Saving...
                    </>
                  ) : (
                    'Save Saree Details'
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProducts;
