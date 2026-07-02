import React, { useState } from 'react';
import { Plus, Edit2, Trash2, FolderTree, X, ArrowUp, ArrowDown, Check, Loader2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const AdminCategories = () => {
  const { categories, refreshAll } = useSettings();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null); // null if adding, cat._id if editing
  const [modalError, setModalError] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subcategories, setSubcategories] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const handleOpenAdd = () => {
    setEditId(null);
    setModalError('');
    setTitle('');
    setSubcategories('');
    setSortOrder(categories.length + 1);
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditId(cat._id);
    setModalError('');
    setTitle(cat.title);
    setSubcategories(cat.subcategories ? cat.subcategories.join(', ') : '');
    setSortOrder(cat.sortOrder || 0);
    setIsActive(cat.isActive);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deleting this category will remove it from the Navbar. Sarees associated with it will remain, but will lose their category classification on search. Proceed?')) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        refreshAll();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete category');
      }
    } catch (e) {
      console.error(e);
      alert('Network error occurred.');
    }
  };

  const handleUpdateSort = async (cat, direction) => {
    const change = direction === 'up' ? -1 : 1;
    const newOrder = Math.max(1, (cat.sortOrder || 0) + change);
    
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/categories/${cat._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...cat,
          sortOrder: newOrder
        })
      });
      if (response.ok) {
        refreshAll();
      }
    } catch (e) {
      console.error('Error sorting category:', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!title.trim()) return setModalError('Category title is required.');

    setModalSubmitting(true);
    const subList = subcategories
      ? subcategories.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    try {
      const token = localStorage.getItem('admin_token');
      const payload = {
        title: title.trim(),
        subcategories: subList,
        sortOrder: Number(sortOrder),
        isActive
      };

      let response;
      if (editId) {
        response = await fetch(`/api/categories/${editId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save category');
      }

      setModalOpen(false);
      refreshAll();
    } catch (err) {
      console.error(err);
      setModalError(err.message || 'Server error occurred.');
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
            Navbar Saree Categories
          </h1>
          <p className="text-xs text-charcoal-light uppercase tracking-wider mt-1">
            Configure primary categories and sub-classification tags shown in navigation menus
          </p>
        </div>
        
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 bg-primary text-white border border-gold/30 hover:bg-primary-dark text-xs font-semibold px-5 py-2.5 rounded shadow-md transition-all uppercase tracking-wider"
        >
          <Plus className="w-4.5 h-4.5 shrink-0" /> Add New Category
        </button>
      </div>

      {/* Main Table List */}
      <div className="bg-white border border-cream-dark/30 rounded-lg shadow-sm overflow-hidden text-charcoal">
        {categories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs select-none">
              <thead>
                <tr className="bg-cream-light border-b border-cream-dark/15 text-charcoal-light font-semibold uppercase tracking-wider text-[10px]">
                  <th className="p-4 w-16 text-center">Order</th>
                  <th className="p-4">Category Name</th>
                  <th className="p-4">Subcategories classifications</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-dark/10 font-medium text-charcoal-light">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-cream-light/40 transition-colors">
                    
                    {/* Sort buttons */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleUpdateSort(cat, 'up')}
                          className="p-1 hover:bg-cream rounded text-charcoal"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-semibold px-1 text-charcoal">{cat.sortOrder}</span>
                        <button
                          onClick={() => handleUpdateSort(cat, 'down')}
                          className="p-1 hover:bg-cream rounded text-charcoal"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Name */}
                    <td className="p-4 font-serif text-sm font-bold text-charcoal">{cat.title}</td>

                    {/* Subcategories tags list */}
                    <td className="p-4">
                      {cat.subcategories && cat.subcategories.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-w-md">
                          {cat.subcategories.map(sub => (
                            <span key={sub} className="bg-cream border border-cream-dark/50 text-[10px] text-primary px-2 py-0.5 rounded">
                              {sub}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 font-light italic">No subcategories listed</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cat.isActive 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {cat.isActive ? 'Active Menu' : 'Hidden'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id)}
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
            <FolderTree className="w-12 h-12 mx-auto mb-3 text-cream-dark/60" />
            <p className="text-sm font-serif font-bold text-charcoal">No categories seeded</p>
            <p className="text-xs">Create Saree types to organize dropdown navigation menus.</p>
          </div>
        )}
      </div>

      {/* ==========================================
          C. CATEGORY EDITOR MODAL
          ========================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/65 backdrop-blur-[2px] flex items-center justify-center p-4" id="category-modal">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden border border-cream-dark/30">
            
            {/* Header */}
            <div className="px-6 py-4 bg-primary text-white border-b border-gold/30 flex items-center justify-between">
              <h2 className="font-serif text-base font-bold tracking-wide">
                {editId ? 'Edit Category Specifications' : 'Create Saree Category'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-cream hover:bg-primary-dark rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-semibold text-charcoal">
              
              {modalError && (
                <div className="bg-rose-50 text-rose-800 border border-rose-200 p-3 rounded flex items-start gap-2">
                  <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Title */}
              <div className="flex flex-col gap-1">
                <label htmlFor="cat-title-input">Category Title *</label>
                <input
                  id="cat-title-input"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Kanjivaram Sarees"
                  className="border border-cream-dark/45 rounded p-2 focus:outline-none focus:border-gold bg-cream-light font-medium text-xs"
                />
              </div>

              {/* Subcategories */}
              <div className="flex flex-col gap-1">
                <label htmlFor="cat-sub-input">Subcategories (Comma Separated)</label>
                <textarea
                  id="cat-sub-input"
                  value={subcategories}
                  onChange={(e) => setSubcategories(e.target.value)}
                  placeholder="e.g. Pure Zari Kanjivaram, Half Fine, Temple Border"
                  rows={3}
                  className="border border-cream-dark/45 rounded p-2.5 focus:outline-none focus:border-gold bg-cream-light font-medium text-xs resize-none"
                />
              </div>

              {/* Sort Order */}
              <div className="flex flex-col gap-1">
                <label htmlFor="cat-order-input">Menu Sort Order</label>
                <input
                  id="cat-order-input"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="border border-cream-dark/45 rounded p-2 focus:outline-none focus:border-gold bg-cream-light font-medium text-xs"
                />
              </div>

              {/* Active */}
              <label className="inline-flex items-center text-xs text-charcoal cursor-pointer select-none pt-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="mr-2 text-primary focus:ring-primary rounded border-cream-dark/40"
                />
                <span>Enable visibility in Navbar Dropdown</span>
              </label>

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
                    'Save Category'
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

export default AdminCategories;
