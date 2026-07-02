import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageSquare, Facebook, Instagram } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const Footer = () => {
  const { settings, collections } = useSettings();

  const shopName = settings?.shopName || 'Bani Thani Textiles';
  const address = settings?.contactDetails?.address || 'Jaipur, Rajasthan, India';
  const phone = settings?.contactDetails?.phone || '+91 98765 43210';
  const email = settings?.contactDetails?.email || 'info@banithanitextiles.com';
  const whatsapp = settings?.contactDetails?.whatsapp || '+91 98765 43210';
  const facebook = settings?.socialLinks?.facebook || '#';
  const instagram = settings?.socialLinks?.instagram || '#';
  const pinterest = settings?.socialLinks?.pinterest || '#';

  const activeCollections = collections.filter(c => c.isActive).slice(0, 4);

  return (
    <footer className="bg-charcoal text-gray-300 pt-16 pb-8 border-t-2 border-gold/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Column */}
          <div className="flex flex-col">
            <h2 className="font-serif text-white text-2xl tracking-widest uppercase mb-4">
              {shopName.split(' ')[0]} <span className="text-gold">{shopName.split(' ').slice(1).join(' ')}</span>
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Celebrate the grace of handcrafted Indian heritage. We weave threads of tradition, royalty, and craftsmanship into modern designer sarees.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <a href={facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-charcoal-light hover:bg-gold hover:text-charcoal rounded-full transition-all duration-300" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-charcoal-light hover:bg-gold hover:text-charcoal rounded-full transition-all duration-300" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href={pinterest} target="_blank" rel="noopener noreferrer" className="p-2 bg-charcoal-light hover:bg-gold hover:text-charcoal rounded-full transition-all duration-300" aria-label="Pinterest">
                {/* Custom Pinterest P using text */}
                <span className="font-bold text-xs px-1 select-none">P</span>
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="font-serif text-white text-lg tracking-wider mb-4 border-b border-gray-700 pb-2">
              Customer Support
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-gold transition-colors">Home Page</Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-gold transition-colors">Explore Saree Shop</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gold transition-colors">Our Story & Heritage</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold transition-colors">Get in Touch</Link>
              </li>
            </ul>
          </div>

          {/* Collections Column */}
          <div>
            <h3 className="font-serif text-white text-lg tracking-wider mb-4 border-b border-gray-700 pb-2">
              Featured Collections
            </h3>
            <ul className="space-y-2.5 text-sm">
              {activeCollections.length > 0 ? (
                activeCollections.map(c => (
                  <li key={c._id}>
                    <Link to={`/shop?collection=${encodeURIComponent(c.title)}`} className="hover:text-gold transition-colors">
                      {c.title}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link to="/shop?collection=Wedding%20Collection" className="hover:text-gold transition-colors">Wedding Collection</Link></li>
                  <li><Link to="/shop?collection=Festival%20Collection" className="hover:text-gold transition-colors">Festival Collection</Link></li>
                  <li><Link to="/shop?collection=Bridal%20Collection" className="hover:text-gold transition-colors">Bridal Collection</Link></li>
                  <li><Link to="/shop?collection=Traditional%20Collection" className="hover:text-gold transition-colors">Traditional Collection</Link></li>
                </>
              )}
              <li>
                <Link to="/shop?discount=true" className="text-rose-400 hover:text-gold transition-colors">Special Sale Offers</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details Column */}
          <div>
            <h3 className="font-serif text-white text-lg tracking-wider mb-4 border-b border-gray-700 pb-2">
              Contact Store
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <span className="text-gray-400 leading-normal">{address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-gold transition-colors">{phone}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">WhatsApp: {whatsapp}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-gold transition-colors overflow-hidden text-ellipsis whitespace-nowrap">{email}</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} {shopName}. All Rights Reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gold transition-colors">Shipping & Return Policy</a>
            <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
