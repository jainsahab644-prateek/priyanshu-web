import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image, MessageSquare, X, Check, Loader2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { compressImage } from '../utils/imageCompressor';

const AdminBanners = () => {
  const { announcements, refreshAll } = useSettings();
  const [banners, setBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);

  // active tab: 'banners' vs 'announcements'
  const [activeTab, setActiveTab] = useState('banners');

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('banner'); // 'banner' vs 'announcement'
  const [editId, setEditId] = useState(null); // null if adding
  const [modalError, setModalError] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Form Fields: Banner
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerBtnText, setBannerBtnText] = useState('Shop Now');
  const [bannerBtnLink, setBannerBtnLink] = useState('/shop');
  const [bannerDesktopFile, setBannerDesktopFile] = useState(null);
  const [bannerMobileFile, setBannerMobileFile] = useState(null);
  const [existingDesktopUrl, setExistingDesktopUrl] = useState('');
  const [existingMobileUrl, setExistingMobileUrl] = useState('');
  const [bannerOrder, setBannerOrder] = useState(0);
  const [showBanner, setShowBanner] = useState(true);

  // Form Fields: Announcement
  const [annContent, setAnnContent] = useState('');
  const [annOrder, setAnnOrder] = useState(0);
  const [annActive, setAnnActive] = useState(true);

  const fetchBanners = async () => {
    setBannersLoading(true);
    try {
      const response = await fetch('/api/admin/banners', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBanners(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBannersLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenAddBanner = () => {
    setModalType('banner');
    setEditId(null);
    setModalError('');
    setBannerTitle('');
    setBannerSubtitle('');
    setBannerBtnText('Shop Now');
    setBannerBtnLink('/shop');
    setBannerDesktopFile(null);
    setBannerMobileFile(null);
    setExistingDesktopUrl('');
    setExistingMobileUrl('');
    setBannerOrder(banners.length + 1);
    setShowBanner(true);
    setIsModalOpen(true);
  };

  const handleOpenEditBanner = (b) => {
    setModalType('banner');
    setEditId(b._id);
    setModalError('');
    setBannerTitle(b.title || '');
    setBannerSubtitle(b.subtitle || '');
    setBannerBtnText(b.buttonText || 'Shop Now');
    setBannerBtnLink(b.buttonLink || '/shop');
    setBannerDesktopFile(null);
    setBannerMobileFile(null);
    setExistingDesktopUrl(b.desktopImage || '');
    setExistingMobileUrl(b.mobileImage || '');
    setBannerOrder(b.order || 0);
    setShowBanner(b.showBanner);
    setIsModalOpen(true);
  };

  const handleOpenAddAnnouncement = () => {
    setModalType('announcement');
    setEditId(null);
    setModalError('');
    setAnnContent('');
    setAnnOrder(announcements.length + 1);
    setAnnActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditAnnouncement = (a) => {
    setModalType('announcement');
    setEditId(a._id);
    setModalError('');
    setAnnContent(a.content);
    setAnnOrder(a.order || 0);
    setAnnActive(a.isActive);
    setIsModalOpen(true);
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Delete this home page banner?')) return;
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchBanners();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this marquee announcement text?')) return;
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        refreshAll();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSubmitting(true);

    const token = localStorage.getItem('admin_token');

    try {
      if (modalType === 'banner') {
        const formData = new FormData();
        formData.append('title', bannerTitle.trim());
        formData.append('subtitle', bannerSubtitle.trim());
        formData.append('buttonText', bannerBtnText.trim());
        formData.append('buttonLink', bannerBtnLink.trim());
        formData.append('order', bannerOrder);
        formData.append('showBanner', showBanner);

        if (bannerDesktopFile) formData.append('desktopImage', bannerDesktopFile);
        if (bannerMobileFile) formData.append('mobileImage', bannerMobileFile);

        let response;
        if (editId) {
          response = await fetch(`/api/admin/banners/${editId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
          });
        } else {
          response = await fetch('/api/admin/banners', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
          });
        }
        if (!response.ok) throw new Error('Failed to save banner');
        fetchBanners();
      } else {
        // Announcement
        if (!annContent.trim()) throw new Error('Announcement text content is required.');
        const payload = {
          content: annContent.trim(),
          order: Number(annOrder),
          isActive: annActive
        };

        let response;
        if (editId) {
          response = await fetch(`/api/admin/announcements/${editId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });
        } else {
          response = await fetch('/api/admin/announcements', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });
        }
        if (!response.ok) throw new Error('Failed to save announcement');
        refreshAll();
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setModalError(err.message || 'Error occurred.');
    } finally {
      setModalSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-charcoal">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-cream-dark/20 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary tracking-wide">
            Promotions & Marketing
          </h1>
          <p className="text-xs text-charcoal-light uppercase tracking-wider mt-1">
            Manage homepage sliders and header marquee announcement ticks
          </p>
        </div>
        
        <button
          onClick={activeTab === 'banners' ? handleOpenAddBanner : handleOpenAddAnnouncement}
          className="inline-flex items-center gap-1.5 bg-primary text-white border border-gold/30 hover:bg-primary-dark text-xs font-semibold px-5 py-2.5 rounded shadow-md transition-all uppercase tracking-wider"
        >
          <Plus className="w-4.5 h-4.5 shrink-0" /> {activeTab === 'banners' ? 'Add Slider Banner' : 'Add Announcement'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cream-dark/20 text-xs font-semibold select-none">
        <button
          onClick={() => setActiveTab('banners')}
          className={`px-6 py-3 border-b-2 uppercase tracking-wider flex items-center gap-2 ${activeTab === 'banners' ? 'border-primary text-primary' : 'border-transparent text-charcoal-light hover:text-primary'}`}
        >
          <Image className="w-4.5 h-4.5" /> Hero Slider Banners
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-6 py-3 border-b-2 uppercase tracking-wider flex items-center gap-2 ${activeTab === 'announcements' ? 'border-primary text-primary' : 'border-transparent text-charcoal-light hover:text-primary'}`}
        >
          <MessageSquare className="w-4.5 h-4.5" /> Announcement Marquees
        </button>
      </div>

      {/* Content lists */}
      {activeTab === 'banners' ? (
        
        /* BANNER SLIDERS GRID */
        bannersLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : banners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.map((b) => (
              <div key={b._id} className="bg-white border border-cream-dark/30 rounded-lg shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all">
                {/* Image display */}
                <div className="aspect-[21/9] bg-primary-dark relative overflow-hidden flex items-center justify-center border-b border-cream-dark/20">
                  {b.desktopImage ? (
                    <img src={b.desktopImage} alt={b.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-gold uppercase tracking-wider font-bold">Slider Image Pending</span>
                  )}
                  <span className="absolute top-2 left-2 bg-charcoal/80 text-white text-[9px] px-2 py-0.5 rounded border border-gold/30">Order: {b.order}</span>
                  {!b.showBanner && <span className="absolute top-2 right-2 bg-rose-600 text-white text-[9px] px-2 py-0.5 rounded font-bold uppercase">Hidden</span>}
                </div>
                
                {/* Details */}
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-charcoal">{b.title || 'Untitled Banner'}</h3>
                    <p className="text-gray-400 text-[11px] font-normal leading-relaxed mt-1">{b.subtitle || 'No subtitle provided'}</p>
                    <div className="mt-3 text-[10px] font-medium text-charcoal-light flex items-center gap-4">
                      <span>Button: <strong className="text-primary">{b.buttonText}</strong></span>
                      <span>Link: <strong className="text-primary">{b.buttonLink}</strong></span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-end gap-2 border-t border-cream-dark/15 pt-3 mt-4">
                    <button
                      onClick={() => handleOpenEditBanner(b)}
                      className="p-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded text-xs flex items-center gap-1 font-semibold"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(b._id)}
                      className="p-1.5 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 rounded text-xs flex items-center gap-1 font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-cream-dark/30 rounded-lg p-16 text-center text-gray-400">
            <Image className="w-12 h-12 mx-auto mb-2 text-cream-dark/60" />
            <p className="text-sm font-serif font-bold text-charcoal">No slider banners uploaded</p>
            <p className="text-xs">Click Add Slider Banner to upload custom desktop and mobile layouts.</p>
          </div>
        )
      ) : (
        
        /* ANNOUNCEMENTS TABLE */
        announcements.length > 0 ? (
          <div className="bg-white border border-cream-dark/30 rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs select-none">
              <thead>
                <tr className="bg-cream-light border-b border-cream-dark/15 text-charcoal-light font-semibold uppercase tracking-wider text-[10px]">
                  <th className="p-4 w-20 text-center">Order</th>
                  <th className="p-4">Announcement Message Content</th>
                  <th className="p-4 text-center">Active Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-dark/10 font-medium text-charcoal-light">
                {announcements.map((ann) => (
                  <tr key={ann._id} className="hover:bg-cream-light/40 transition-colors">
                    <td className="p-4 text-center font-bold text-charcoal">{ann.order}</td>
                    <td className="p-4 font-medium text-charcoal text-xs leading-normal">{ann.content}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ann.isActive 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {ann.isActive ? 'Active Ticker' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditAnnouncement(ann)}
                          className="p-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAnnouncement(ann._id)}
                          className="p-1.5 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 rounded"
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
          <div className="bg-white border border-cream-dark/30 rounded-lg p-16 text-center text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-cream-dark/60" />
            <p className="text-sm font-serif font-bold text-charcoal">No announcement messages</p>
            <p className="text-xs">Create tickers to slide across the top navbar bar.</p>
          </div>
        )
      )}

      {/* ==========================================
          M. BANNER / ANNOUNCEMENT MODAL DIALOG
          ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/65 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto" id="marketing-modal">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden border border-cream-dark/30">
            
            {/* Header */}
            <div className="px-6 py-4 bg-primary text-white border-b border-gold/30 flex items-center justify-between">
              <h2 className="font-serif text-base font-bold tracking-wide">
                {modalType === 'banner'
                  ? (editId ? 'Edit Hero Slider Banner' : 'Add Hero Slider Banner')
                  : (editId ? 'Edit Announcement Marquee' : 'Add Announcement Marquee')}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
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

              {modalType === 'banner' ? (
                /* BANNER FORM FIELDS */
                <>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="banner-title-input">Banner Large Title</label>
                    <input
                      id="banner-title-input"
                      type="text"
                      value={bannerTitle}
                      onChange={(e) => setBannerTitle(e.target.value)}
                      placeholder="e.g. Traditional Wedding Silks"
                      className="border border-cream-dark/45 rounded p-2 focus:outline-none focus:border-gold bg-cream-light font-medium text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="banner-sub-input">Subtitle / Description</label>
                    <textarea
                      id="banner-sub-input"
                      value={bannerSubtitle}
                      onChange={(e) => setBannerSubtitle(e.target.value)}
                      placeholder="e.g. Pure luxury bridal weaves hand-stitched by Rajasthan master artisans..."
                      rows={2}
                      className="border border-cream-dark/45 rounded p-2.5 focus:outline-none focus:border-gold bg-cream-light font-medium text-xs resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="banner-btn-text">Button Label</label>
                      <input
                        id="banner-btn-text"
                        type="text"
                        value={bannerBtnText}
                        onChange={(e) => setBannerBtnText(e.target.value)}
                        placeholder="Shop Now"
                        className="border border-cream-dark/45 rounded p-2 focus:outline-none bg-cream-light font-medium text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="banner-btn-link">Button Redirect Link</label>
                      <input
                        id="banner-btn-link"
                        type="text"
                        value={bannerBtnLink}
                        onChange={(e) => setBannerBtnLink(e.target.value)}
                        placeholder="/shop"
                        className="border border-cream-dark/45 rounded p-2 focus:outline-none bg-cream-light font-medium text-xs"
                      />
                    </div>
                  </div>

                  {/* Desktop Image upload */}
                  <div className="space-y-1">
                    <label>Desktop Layout Banner Image *</label>
                    {existingDesktopUrl && (
                      <div className="relative w-28 h-12 bg-primary rounded border overflow-hidden">
                        <img src={existingDesktopUrl} alt="Desktop image preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setExistingDesktopUrl('')} className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files ? e.target.files[0] : null;
                        if (file) {
                          const compressed = await compressImage(file);
                          setBannerDesktopFile(compressed);
                        } else {
                          setBannerDesktopFile(null);
                        }
                      }}
                      className="w-full text-[10px] bg-cream-light border border-cream-dark/45 rounded p-1.5"
                    />
                  </div>

                  {/* Mobile Image upload */}
                  <div className="space-y-1">
                    <label>Mobile Layout Banner Image (Optional)</label>
                    {existingMobileUrl && (
                      <div className="relative w-16 h-12 bg-primary rounded border overflow-hidden">
                        <img src={existingMobileUrl} alt="Mobile image preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setExistingMobileUrl('')} className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files ? e.target.files[0] : null;
                        if (file) {
                          const compressed = await compressImage(file);
                          setBannerMobileFile(compressed);
                        } else {
                          setBannerMobileFile(null);
                        }
                      }}
                      className="w-full text-[10px] bg-cream-light border border-cream-dark/45 rounded p-1.5"
                    />
                  </div>

                  {/* Order & show banner */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="banner-order-input">Slider Order Position</label>
                      <input
                        id="banner-order-input"
                        type="number"
                        value={bannerOrder}
                        onChange={(e) => setBannerOrder(e.target.value)}
                        className="border border-cream-dark/45 rounded p-2 focus:outline-none bg-cream-light font-medium text-xs"
                      />
                    </div>
                    
                    <label className="inline-flex items-center text-xs text-charcoal cursor-pointer select-none self-end pb-3">
                      <input
                        type="checkbox"
                        checked={showBanner}
                        onChange={(e) => setShowBanner(e.target.checked)}
                        className="mr-2 text-primary focus:ring-primary rounded border-cream-dark/40"
                      />
                      <span>Show on homepage</span>
                    </label>
                  </div>

                </>
              ) : (
                /* ANNOUNCEMENT FORM FIELDS */
                <>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="ann-content-input">Announcement Ticker Text *</label>
                    <textarea
                      id="ann-content-input"
                      required
                      value={annContent}
                      onChange={(e) => setAnnContent(e.target.value)}
                      placeholder="e.g. ✨ Wedding Saree Collection Live Now - Book on WhatsApp ✨"
                      rows={3}
                      className="border border-cream-dark/45 rounded p-2.5 focus:outline-none focus:border-gold bg-cream-light font-medium text-xs resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="ann-order-input">Ticker Display Order</label>
                      <input
                        id="ann-order-input"
                        type="number"
                        value={annOrder}
                        onChange={(e) => setAnnOrder(e.target.value)}
                        className="border border-cream-dark/45 rounded p-2 focus:outline-none bg-cream-light font-medium text-xs"
                      />
                    </div>

                    <label className="inline-flex items-center text-xs text-charcoal cursor-pointer select-none self-end pb-3">
                      <input
                        type="checkbox"
                        checked={annActive}
                        onChange={(e) => setAnnActive(e.target.checked)}
                        className="mr-2 text-primary focus:ring-primary rounded border-cream-dark/40"
                      />
                      <span>Enable active marquee</span>
                    </label>
                  </div>
                </>
              )}

              {/* Submit Row */}
              <div className="border-t border-cream-dark/20 pt-4 flex items-center justify-end gap-3.5 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                    'Save Details'
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

export default AdminBanners;
