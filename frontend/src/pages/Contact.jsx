import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageSquare, Send, Check } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const Contact = () => {
  const { settings } = useSettings();

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const address = settings?.contactDetails?.address || 'Bani Thani Textiles, Ethnic Market, Johari Bazaar, Jaipur, Rajasthan, India';
  const phone = settings?.contactDetails?.phone || '+91 98765 43210';
  const email = settings?.contactDetails?.email || 'info@banithanitextiles.com';
  const whatsapp = settings?.contactDetails?.whatsapp || '+91 98765 43210';
  
  const title = settings?.contactPageContent?.title || 'Visit Our Heritage Store';
  const description = settings?.contactPageContent?.description || 'Step into Bani Thani Textiles store to experience luxury fabrics and traditional designs in person, or reach out to us for bulk orders and bridal appointments.';

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Simulate contact form submit
    setSuccess(true);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormMessage('');
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="pb-16">
      {/* Banner */}
      <section className="bg-primary text-white py-16 text-center select-none border-b border-gold/30">
        <div className="max-w-4xl mx-auto px-4">
          <span className="text-gold uppercase tracking-[0.2em] text-xs font-semibold block mb-2">Connect</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-wide">Contact Us</h1>
          <div className="w-16 h-0.5 bg-gold mx-auto mt-4" />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Column 1: Contact Details & Info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-2xl font-bold text-primary mb-4">{title}</h2>
              <p className="text-charcoal-light text-sm leading-relaxed font-light">
                {description}
              </p>
            </div>

            {/* Icons list */}
            <div className="bg-white border border-cream-dark/30 rounded-lg p-6 space-y-5 shadow-sm">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-gold shrink-0 mt-1" />
                <div>
                  <h4 className="font-serif font-bold text-charcoal text-sm mb-1">Store Address</h4>
                  <p className="text-xs text-charcoal-light leading-relaxed">{address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t border-cream-dark/10 pt-4">
                <Phone className="w-5 h-5 text-gold shrink-0 mt-1" />
                <div>
                  <h4 className="font-serif font-bold text-charcoal text-sm mb-1">Phone Number</h4>
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className="text-xs text-charcoal-light hover:text-primary transition-colors">
                    {phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t border-cream-dark/10 pt-4">
                <MessageSquare className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
                <div>
                  <h4 className="font-serif font-bold text-charcoal text-sm mb-1">WhatsApp Chat</h4>
                  <a 
                    href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-emerald-600 hover:underline"
                  >
                    {whatsapp}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t border-cream-dark/10 pt-4">
                <Mail className="w-5 h-5 text-gold shrink-0 mt-1" />
                <div>
                  <h4 className="font-serif font-bold text-charcoal text-sm mb-1">Email Address</h4>
                  <a href={`mailto:${email}`} className="text-xs text-charcoal-light hover:text-primary transition-colors">
                    {email}
                  </a>
                </div>
              </div>
            </div>

            {/* Google Map Section Placeholder (Elegant Leaflet/Maps design mockup) */}
            <div className="bg-cream-dark/25 border border-cream-dark/30 rounded-lg overflow-hidden h-[250px] relative flex flex-col items-center justify-center text-center p-6">
              {/* Elegant Gold Map Grid Mockup */}
              <div className="absolute inset-0 bg-gold-light/10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              <div className="w-12 h-12 rounded-full bg-primary border-2 border-gold/45 flex items-center justify-center text-white mb-3 z-10 shadow-lg animate-pulse">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-charcoal font-bold text-sm mb-1 z-10">Bani Thani Textiles</h4>
              <p className="text-[10px] text-gray-400 max-w-[200px] mb-4 z-10">Johari Bazaar, Jaipur, Rajasthan</p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-primary border border-cream-dark/45 px-4 py-1.5 rounded text-[10px] font-semibold tracking-wider uppercase hover:bg-primary hover:text-white transition-all shadow-sm z-10"
              >
                View on Google Maps
              </a>
            </div>

          </div>

          {/* Column 2: Send Message Form */}
          <div className="bg-white border border-cream-dark/30 rounded-lg p-8 shadow-sm">
            <h3 className="font-serif text-xl font-semibold text-primary border-b border-cream-dark/20 pb-3 mb-6 uppercase tracking-wide">
              Leave a Message
            </h3>

            {success && (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded text-xs flex items-center gap-2 mb-6 animate-fade-in select-none">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Thank you! Your message has been sent successfully. We will get back to you shortly.</span>
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-4 text-xs font-semibold text-charcoal">
              
              <div className="flex flex-col gap-1">
                <label htmlFor="contact-name">Your Full Name *</label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Enter full name"
                  className="border border-cream-dark/45 rounded p-2.5 bg-cream-light text-charcoal focus:outline-none focus:border-gold text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="contact-email">Email Address *</label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="border border-cream-dark/45 rounded p-2.5 bg-cream-light text-charcoal focus:outline-none focus:border-gold text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="contact-phone">Phone Number (Optional)</label>
                <input
                  id="contact-phone"
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="border border-cream-dark/45 rounded p-2.5 bg-cream-light text-charcoal focus:outline-none focus:border-gold text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="contact-message">Message *</label>
                <textarea
                  id="contact-message"
                  required
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="How can we help you? (Bulk order requests, wedding timelines, etc.)"
                  rows={5}
                  className="border border-cream-dark/45 rounded p-2.5 bg-cream-light text-charcoal focus:outline-none focus:border-gold text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white border border-gold hover:bg-primary-dark py-3.5 rounded text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Send Message
              </button>

            </form>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Contact;
