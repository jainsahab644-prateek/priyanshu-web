import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, X, Loader2, Info } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const AdminSettings = () => {
  const { settings, refreshAll } = useSettings();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // General Fields
  const [shopName, setShopName] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState('');

  // Contacts
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  // Socials
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [pinterest, setPinterest] = useState('');

  // About Content
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutStory, setAboutStory] = useState('');
  const [aboutFeatures, setAboutFeatures] = useState([]);
  const [newFeatureText, setNewFeatureText] = useState('');

  // Contact Content
  const [contactTitle, setContactTitle] = useState('');
  const [contactDesc, setContactDesc] = useState('');

  useEffect(() => {
    if (settings) {
      setShopName(settings.shopName || '');
      setExistingLogoUrl(settings.logoUrl || '');
      setAddress(settings.contactDetails?.address || '');
      setPhone(settings.contactDetails?.phone || '');
      setWhatsapp(settings.contactDetails?.whatsapp || '');
      setEmail(settings.contactDetails?.email || '');
      setFacebook(settings.socialLinks?.facebook || '');
      setInstagram(settings.socialLinks?.instagram || '');
      setPinterest(settings.socialLinks?.pinterest || '');
      
      setAboutTitle(settings.aboutPageContent?.title || '');
      setAboutStory(settings.aboutPageContent?.story || '');
      setAboutFeatures(settings.aboutPageContent?.features || []);
      
      setContactTitle(settings.contactPageContent?.title || '');
      setContactDesc(settings.contactPageContent?.description || '');
    }
  }, [settings]);

  const handleAddFeature = () => {
    if (newFeatureText.trim()) {
      setAboutFeatures(prev => [...prev, newFeatureText.trim()]);
      setNewFeatureText('');
    }
  };

  const handleRemoveFeature = (index) => {
    setAboutFeatures(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmitSettings = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('shopName', shopName.trim());
      formData.append('address', address.trim());
      formData.append('phone', phone.trim());
      formData.append('whatsapp', whatsapp.trim());
      formData.append('email', email.trim());
      formData.append('facebook', facebook.trim());
      formData.append('instagram', instagram.trim());
      formData.append('pinterest', pinterest.trim());

      const aboutContent = {
        title: aboutTitle.trim(),
        story: aboutStory.trim(),
        features: aboutFeatures
      };
      formData.append('aboutPageContent', JSON.stringify(aboutContent));

      const contactContent = {
        title: contactTitle.trim(),
        description: contactDesc.trim()
      };
      formData.append('contactPageContent', JSON.stringify(contactContent));

      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update settings');
      }

      setSuccessMsg('Global website settings updated successfully.');
      setLogoFile(null);
      if (data.logoUrl) {
        setExistingLogoUrl(data.logoUrl);
      }
      refreshAll();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error occurred saving settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-charcoal">
      
      {/* Header */}
      <div className="border-b border-cream-dark/20 pb-6 mb-6">
        <h1 className="font-serif text-3xl font-bold text-primary tracking-wide">
          Global Website Settings
        </h1>
        <p className="text-xs text-charcoal-light uppercase tracking-wider mt-1">
          Configure shop branding, contact profiles, socials, and structured pages content
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded text-xs select-none animate-fade-in font-bold">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 text-rose-800 border border-rose-200 p-4 rounded text-xs select-none animate-fade-in">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmitSettings} className="space-y-8 text-xs font-semibold text-charcoal">
        
        {/* SECTION A: Brand Profile */}
        <div className="bg-white border border-cream-dark/30 rounded-lg p-6 shadow-sm space-y-4">
          <h2 className="font-serif text-sm font-bold uppercase tracking-widest text-primary border-b border-cream-dark/15 pb-2">
            1. Brand Identity
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label htmlFor="shop-name-input">Shop / Store Name *</label>
              <input
                id="shop-name-input"
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Bani Thani Textiles"
                className="border border-cream-dark/45 rounded p-2.5 bg-cream-light focus:outline-none focus:border-gold font-medium"
              />
            </div>
            
            <div className="space-y-2">
              <label>Shop Logo</label>
              <div className="flex items-center gap-3">
                {existingLogoUrl && (
                  <div className="relative w-14 h-14 bg-cream rounded border overflow-hidden shrink-0 flex items-center justify-center p-1">
                    <img src={existingLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setExistingLogoUrl('')}
                      className="absolute top-0 right-0 bg-rose-600 text-white rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-[10px] bg-cream-light border border-cream-dark/45 rounded p-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION B: Contact Channels */}
        <div className="bg-white border border-cream-dark/30 rounded-lg p-6 shadow-sm space-y-4">
          <h2 className="font-serif text-sm font-bold uppercase tracking-widest text-primary border-b border-cream-dark/15 pb-2">
            2. Contact Channels
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="contact-phone-input">Display Phone Number</label>
              <input
                id="contact-phone-input"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="border border-cream-dark/45 rounded p-2.5 bg-cream-light focus:outline-none focus:border-gold font-medium"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="contact-whatsapp-input">WhatsApp Number *</label>
              <input
                id="contact-whatsapp-input"
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+91 98765 43210"
                className="border border-cream-dark/45 rounded p-2.5 bg-cream-light focus:outline-none focus:border-gold font-medium"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="contact-email-input">Store Email Address</label>
              <input
                id="contact-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@banithanitextiles.com"
                className="border border-cream-dark/45 rounded p-2.5 bg-cream-light focus:outline-none focus:border-gold font-medium"
              />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-3">
              <label htmlFor="contact-addr-input">Store physical Address</label>
              <input
                id="contact-addr-input"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter complete store showroom address"
                className="border border-cream-dark/45 rounded p-2.5 bg-cream-light focus:outline-none focus:border-gold font-medium"
              />
            </div>
          </div>
        </div>

        {/* SECTION C: Social Media Links */}
        <div className="bg-white border border-cream-dark/30 rounded-lg p-6 shadow-sm space-y-4">
          <h2 className="font-serif text-sm font-bold uppercase tracking-widest text-primary border-b border-cream-dark/15 pb-2">
            3. Social Profiles
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="social-fb-input">Facebook Page URL</label>
              <input
                id="social-fb-input"
                type="url"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/yourpage"
                className="border border-cream-dark/45 rounded p-2.5 bg-cream-light focus:outline-none focus:border-gold font-medium"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="social-ig-input">Instagram Profile URL</label>
              <input
                id="social-ig-input"
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/yourprofile"
                className="border border-cream-dark/45 rounded p-2.5 bg-cream-light focus:outline-none focus:border-gold font-medium"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="social-pin-input">Pinterest Profile URL</label>
              <input
                id="social-pin-input"
                type="url"
                value={pinterest}
                onChange={(e) => setPinterest(e.target.value)}
                placeholder="https://pinterest.com/yourprofile"
                className="border border-cream-dark/45 rounded p-2.5 bg-cream-light focus:outline-none focus:border-gold font-medium"
              />
            </div>
          </div>
        </div>

        {/* SECTION D: Structured About Page */}
        <div className="bg-white border border-cream-dark/30 rounded-lg p-6 shadow-sm space-y-4">
          <h2 className="font-serif text-sm font-bold uppercase tracking-widest text-primary border-b border-cream-dark/15 pb-2">
            4. About Us Page Settings
          </h2>
          
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="about-title-input">About Page Banner Headline</label>
              <input
                id="about-title-input"
                type="text"
                value={aboutTitle}
                onChange={(e) => setAboutTitle(e.target.value)}
                placeholder="e.g. Preserving Indian Heritage Since Years"
                className="border border-cream-dark/45 rounded p-2.5 bg-cream-light focus:outline-none focus:border-gold font-medium"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="about-story-input">Our Legacy Story Text</label>
              <textarea
                id="about-story-input"
                value={aboutStory}
                onChange={(e) => setAboutStory(e.target.value)}
                placeholder="Enter complete brand introduction story details..."
                rows={5}
                className="border border-cream-dark/45 rounded p-2.5 bg-cream-light focus:outline-none focus:border-gold font-medium resize-none"
              />
            </div>

            {/* Checklist Dynamic feature elements */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-charcoal-light uppercase block">Why Customers Choose Us checklist:</span>
              
              {/* Features list */}
              {aboutFeatures.length > 0 && (
                <div className="space-y-2 border border-cream-dark/30 rounded bg-cream-light p-3">
                  {aboutFeatures.map((feat, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs font-medium text-charcoal leading-relaxed py-1">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                        <span>{feat}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-rose-600 hover:text-rose-500 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add feature input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeatureText}
                  onChange={(e) => setNewFeatureText(e.target.value)}
                  placeholder="e.g. 100% Pure silk handloom certified"
                  className="w-full border border-cream-dark/45 rounded px-2.5 py-1.5 bg-cream-light focus:outline-none focus:border-gold font-medium"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="bg-primary text-white border border-gold px-4 rounded font-bold uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-primary-dark"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION E: Structured Contact Page */}
        <div className="bg-white border border-cream-dark/30 rounded-lg p-6 shadow-sm space-y-4">
          <h2 className="font-serif text-sm font-bold uppercase tracking-widest text-primary border-b border-cream-dark/15 pb-2">
            5. Contact Page Settings
          </h2>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="contact-title-input">Contact page Title</label>
              <input
                id="contact-title-input"
                type="text"
                value={contactTitle}
                onChange={(e) => setContactTitle(e.target.value)}
                placeholder="Visit Our Showroom"
                className="border border-cream-dark/45 rounded p-2.5 bg-cream-light focus:outline-none focus:border-gold font-medium"
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label htmlFor="contact-desc-input">Contact page Description</label>
              <textarea
                id="contact-desc-input"
                value={contactDesc}
                onChange={(e) => setContactDesc(e.target.value)}
                placeholder="Enter details welcoming store visits or describing bridal booking guidelines..."
                rows={3}
                className="border border-cream-dark/45 rounded p-2.5 bg-cream-light focus:outline-none focus:border-gold font-medium resize-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-cream-dark/20">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white border border-gold hover:bg-primary-dark px-10 py-3.5 rounded text-xs font-bold tracking-widest uppercase shadow-md flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" /> Saving Settings...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Global Settings
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};

export default AdminSettings;
