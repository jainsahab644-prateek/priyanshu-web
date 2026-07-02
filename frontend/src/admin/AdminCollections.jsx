import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers, X, Check, Loader2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const AdminCollections = () => {
  const { collections, refreshAll } = useSettings();
  const [sareesList, setSareesList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null); // null if adding, coll._id if editing
  const [modalError, setModalError] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [existingBannerUrl, setExistingBannerUrl] = useState('');
  const [selectedSarees, setSelectedSarees] = useState([]); // Array of sareeIds
  const [showOnHome, setShowOnHome] = useState(true);
  const [isActive, setIsActive] = useState(true);

  // Fetch sarees list on load for checkbox selection
  useEffect(() => {
    const fetchSarees = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const response = await fetch('/api/admin/sarees', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setSareesList(data);
        }
      } catch (e) {
        console.error('Error fetching sarees list for collection mapping:', e);
      }
    };
    fetchSarees();
  }, []);

  const handleOpenAdd = () => {
    setEditId(null);
    setModalError('');
    setTitle('');
    setDescription('');
    setBannerImageFile(null);
    setExistingBannerUrl('');
    setSelectedSarees([]);
    setShowOnHome(true);
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (coll) => {
    setEditId(coll._id);
    setModalError('');
    setTitle(coll.title);
    setDescription(coll.description || '');
    setBannerImageFile(null);
    setExistingBannerUrl(coll.bannerImage || '');
    setSelectedSarees(coll.sarees || []);
    setShowOnHome(coll.showOnHome);
    setIsActive(coll.isActive);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this collection? Associated sarees will not be deleted, but they will no longer be grouped under this collection.')) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/collections/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        refreshAll();
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to delete collection');
      }
    } catch (e) {
      console.error(e);
      alert('Network error occurred.');
    }
  };

  const handleSareeCheckboxToggle = (sareeId) => {
    setSelectedSarees(prev => {
      if (prev.includes(sareeId)) {
        return prev.filter(id => id !== sareeId);
      } else {
        return [...prev, sareeId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!title.trim()) return setModalError('Collection title is required.');

    setModalSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('showOnHome', showOnHome);
      formData.append('isActive', isActive);
      formData.append('sarees', JSON.stringify(selectedSarees));

      if (bannerImageFile) {
        formData.append('bannerImage', bannerImageFile);
      }

      const token = localStorage.getItem('admin_token');

      let response;
      if (editId) {
        response = await fetch(`/api/admin/collections/${editId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
      } else {
        response = await fetch('/api/admin/collections', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save collection');
      }

      setModalOpen(false);
      refreshAll();
    } catch (err) {
      console.error(err);
      setModalError(err.message || 'Server error saving collection.');
    } finally {
      setModalSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-cream-dark/20 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary tracking-wide">
            Design Collections
          </h1>
          <p className="text-xs text-charcoal-light uppercase tracking-wider mt-1">
            Group individual sarees into luxury themed collections and set landing hero banners
          </p>
        </div>
        
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 bg-primary text-white border border-gold/30 hover:bg-primary-dark text-xs font-semibold px-5 py-2.5 rounded shadow-md transition-all uppercase tracking-wider"
        >
          <Plus className="w-4.5 h-4.5 shrink-0" /> Add New Collection
        </button>
      </div>

      {/* Collections List */}
      <div className="bg-white border border-cream-dark/30 rounded-lg shadow-sm overflow-hidden text-charcoal">
        {collections.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs select-none">
              <thead>
                <tr className="bg-cream-light border-b border-cream-dark/15 text-charcoal-light font-semibold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Collection Banner</th>
                  <th className="p-4">Title / Name</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-center">Associated Sarees</th>
                  <th className="p-4 text-center">Home Visibility</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-dark/10 font-medium text-charcoal-light">
                {collections.map((coll) => (
                  <tr key={coll._id} className="hover:bg-cream-light/40 transition-colors">
                    
                    {/* Banner Thumbnail */}
                    <td className="p-4">
                      <div className="w-16 h-10 bg-primary-dark rounded overflow-hidden border border-cream-dark/35 flex items-center justify-center">
                        {coll.bannerImage ? (
                          <img src={coll.bannerImage} alt={coll.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[7px] font-bold text-gold uppercase tracking-wider">No Image</span>
                        )}
                      </div>
                    </td>

                    {/* Title */}
                    <td className="p-4 font-serif text-sm font-bold text-charcoal">{coll.title}</td>

                    {/* Description */}
                    <td className="p-4 max-w-xs truncate text-charcoal-light">{coll.description || 'No description provided'}</td>

                    {/* Associated Count */}
                    <td className="p-4 text-center">
                      <span className="bg-cream border border-cream-dark/50 text-[10px] text-primary font-bold px-2 py-0.5 rounded">
                        {coll.sarees?.length || 0} Sarees
                      </span>
                    </td>

                    {/* Visibility */}
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        coll.showOnHome 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                          : 'bg-gray-50 text-gray-800 border border-gray-200'
                      }`}>
                        {coll.showOnHome ? 'Visible on Home' : 'Hidden'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(coll)}
                          className="p-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(coll._id)}
                          className="p-1.5 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-gray-400">
            <Layers className="w-12 h-12 mx-auto mb-3 text-cream-dark/60" />
            <p className="text-sm font-serif font-bold text-charcoal">No collections created</p>
            <p className="text-xs">Group related sarees together into thematic luxury segments.</p>
          </div>
        )}
      </div>

      {/* ==========================================
          C. COLLECTION EDITOR MODAL
          ========================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/65 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto" id="collection-modal">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-cream-dark/30 my-8">
            
            {/* Header */}
            <div className="px-6 py-4 bg-primary text-white border-b border-gold/30 flex items-center justify-between">
              <h2 className="font-serif text-base font-bold tracking-wide">
                {editId ? 'Edit Collection settings' : 'Create Design Collection'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-cream hover:bg-primary-dark rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-5 text-xs font-semibold text-charcoal">
              
              {modalError && (
                <div className="bg-rose-50 text-rose-800 border border-rose-200 p-3 rounded flex items-start gap-2">
                  <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Title */}
              <div className="flex flex-col gap-1">
                <label htmlFor="coll-title-input">Collection Title *</label>
                <input
                  id="coll-title-input"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Wedding Saree Collection"
                  className="border border-cream-dark/45 rounded p-2 focus:outline-none focus:border-gold bg-cream-light font-medium text-xs"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label htmlFor="coll-desc-input">Description / Promo Slogan</label>
                <textarea
                  id="coll-desc-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Traditional weaves tailored for standard Indian bridal ceremonies..."
                  rows={2.5}
                  className="border border-cream-dark/45 rounded p-2.5 focus:outline-none focus:border-gold bg-cream-light font-medium text-xs resize-none"
                />
              </div>

              {/* Image Banner Upload */}
              <div className="space-y-2">
                <label>Collection Banner Image</label>
                {existingBannerUrl && (
                  <div className="relative w-36 h-20 bg-primary rounded border overflow-hidden">
                    <img src={existingBannerUrl} alt="Existing banner" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setExistingBannerUrl('')}
                      className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBannerImageFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs font-medium bg-cream-light border border-cream-dark/45 rounded p-2"
                />
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-2 gap-4">
                <label className="inline-flex items-center text-xs text-charcoal cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showOnHome}
                    onChange={(e) => setShowOnHome(e.target.checked)}
                    className="mr-2 text-primary focus:ring-primary rounded border-cream-dark/40"
                  />
                  <span>Show on Public Homepage Grid</span>
                </label>

                <label className="inline-flex items-center text-xs text-charcoal cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="mr-2 text-primary focus:ring-primary rounded border-cream-dark/40"
                  />
                  <span>Collection Active Status (visible in lists)</span>
                </label>
              </div>

              {/* ASSOCIATE SAREES LIST */}
              <div className="space-y-3 pt-3 border-t border-cream-dark/15">
                <span className="font-serif text-xs font-bold uppercase tracking-wider text-primary block">
                  Select Associated Sarees ({selectedSarees.length} selected)
                </span>
                
                <div className="border border-cream-dark/30 rounded bg-cream-light max-h-48 overflow-y-auto p-3 divide-y divide-cream-dark/10">
                  {sareesList.length > 0 ? (
                    sareesList.map(saree => {
                      const isChecked = selectedSarees.includes(saree._id);
                      return (
                        <button
                          key={saree._id}
                          type="button"
                          onClick={() => handleSareeCheckboxToggle(saree._id)}
                          className="w-full flex items-center justify-between py-2 text-left text-xs font-medium text-charcoal hover:bg-cream-dark/10 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                            <span>{saree.name} <span className="text-[10px] text-gray-400 font-mono">({saree.sku})</span></span>
                          </div>
                          <div className={`w-4 h-4 border rounded flex items-center justify-center shrink-0 ${isChecked ? 'bg-primary border-primary text-white' : 'border-cream-dark/45 bg-white'}`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <span className="text-gray-400 italic">No sarees added yet in inventory to select</span>
                  )}
                </div>
              </div>

              {/* Submit Row */}
              <div className="border-t border-cream-dark/20 pt-4 flex items-center justify-end gap-3.5 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-cream-dark/45 text-charcoal font-semibold rounded text-center hover:bg-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="bg-primary text-white border border-gold hover:bg-primary-dark px-5 py-2 rounded text-center font-semibold tracking-wider flex items-center gap-1.5"
                >
                  {modalSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" /> Saving...
                    </>
                  ) : (
                    'Save Collection'
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

export default AdminCollections;
