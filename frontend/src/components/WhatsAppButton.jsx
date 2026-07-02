import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const WhatsAppButton = () => {
  const { settings } = useSettings();
  
  if (!settings || !settings.contactDetails || !settings.contactDetails.whatsapp) return null;
  
  const whatsappNum = settings.contactDetails.whatsapp.replace(/[^0-9]/g, '');
  const chatUrl = `https://wa.me/${whatsappNum}?text=Hello%20Bani%20Thani%20Textiles%2C%20I%20am%20browsing%20your%20saree%20catalog%20and%20had%20some%20questions.`;

  return (
    <a
      href={chatUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed z-40 flex items-center gap-2 px-4 py-3 text-white transition-all duration-300 shadow-2xl bottom-6 right-6 bg-emerald-600 hover:bg-emerald-500 rounded-full hover:scale-105 group font-medium text-sm"
      aria-label="Contact us on WhatsApp"
      id="whatsapp-floating-btn"
    >
      <MessageCircle className="w-5 h-5 fill-current animate-pulse" />
      <span className="max-w-0 overflow-hidden transition-all duration-500 ease-out group-hover:max-w-xs whitespace-nowrap">
        Inquire on WhatsApp
      </span>
    </a>
  );
};

export default WhatsAppButton;
