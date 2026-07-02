import React, { useState, useEffect } from 'react';
import { useParams as RouterParams, Link as RouterLink, useNavigate as RouterNavigate } from 'react-router-dom';
import { CheckCircle2, MessageSquare, ShoppingBag, MapPin, Phone, User, Calendar, Printer } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const OrderConfirmation = () => {
  const { id } = RouterParams();
  const navigate = RouterNavigate();
  const { settings } = useSettings();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch inquiry details
  useEffect(() => {
    const fetchInquiryDetails = async () => {
      try {
        const response = await fetch(`/api/inquiries/${id}`);
        if (response.ok) {
          const found = await response.json();
          if (found) {
            setInquiry(found);
          } else {
            navigate('/shop');
          }
        }
      } catch (err) {
        console.error('Error fetching inquiry:', err);
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };

    fetchInquiryDetails();
  }, [id, navigate]);

  // Format currency
  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const handlePrint = () => {
    window.print();
  };

  // Generate WhatsApp Invoice deep-link
  const getWhatsAppInvoiceLink = () => {
    if (!inquiry) return '#';
    const whatsappNum = settings?.contactDetails?.whatsapp?.replace(/[^0-9]/g, '') || '919876543210';
    
    let itemsText = '';
    inquiry.items.forEach((item, index) => {
      const activePrice = item.discountPrice ? item.discountPrice : item.price;
      itemsText += `${index + 1}. ${item.name} (SKU: ${item.sku}) - Qty: ${item.quantity} - Price: ₹${activePrice}\n`;
    });

    const message = `Hello Bani Thani Textiles, I just submitted an order inquiry!\n\n*Inquiry ID*: ${inquiry.inquiryNumber}\n*Date*: ${new Date(inquiry.createdAt).toLocaleDateString()}\n\n*Customer Details*:\n- Name: ${inquiry.customerDetails.name}\n- Phone: ${inquiry.customerDetails.phone}\n- City: ${inquiry.customerDetails.city}\n\n*Selected Sarees*:\n${itemsText}\n*Total Estimated Amount*: *₹${inquiry.totalAmount}*\n\nPlease confirm booking and share delivery/payment details.`;

    return `https://wa.me/${whatsappNum}?text=${encodeURIComponent(message)}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-36 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
        <p className="font-serif text-charcoal-light text-sm italic">Generating invoice details...</p>
      </div>
    );
  }

  if (!inquiry) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Top Success Banner */}
      <div className="text-center mb-10 select-none">
        <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4 animate-bounce" />
        <h1 className="font-serif text-3xl font-bold text-primary tracking-wide mb-3">
          Inquiry Successfully Received
        </h1>
        <p className="text-sm text-charcoal-light max-w-lg mx-auto leading-relaxed">
          Thank you! Your order inquiry has been logged. **Bani Thani Textiles** sales consultants will contact you soon on WhatsApp or Phone to coordinate.
        </p>
      </div>

      {/* Main Ticket Layout */}
      <div className="bg-white border border-cream-dark/30 rounded-lg shadow-xl overflow-hidden gold-border-glow print:border-none print:shadow-none mb-8">
        
        {/* Ticket Header */}
        <div className="bg-primary text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gold/30 gap-4">
          <div>
            <span className="text-[10px] text-gold font-bold tracking-[0.25em] uppercase block mb-1">Inquiry Invoice</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-wide">{inquiry.inquiryNumber}</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-cream/80">
            <Calendar className="w-4 h-4 text-gold shrink-0" />
            <span>{new Date(inquiry.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Section 1: Customer Details */}
          <div>
            <h3 className="font-serif text-xs font-bold uppercase tracking-widest text-primary border-b border-cream-dark/15 pb-2 mb-4">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-xs text-charcoal-light">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gold shrink-0" />
                <span className="font-medium text-gray-400 w-16 shrink-0">Name:</span>
                <span className="font-semibold text-charcoal">{inquiry.customerDetails.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <span className="font-medium text-gray-400 w-16 shrink-0">Phone:</span>
                <span className="font-semibold text-charcoal">{inquiry.customerDetails.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-medium text-gray-400 w-16 shrink-0">WhatsApp:</span>
                <span className="font-semibold text-charcoal">{inquiry.customerDetails.whatsapp}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold shrink-0" />
                <span className="font-medium text-gray-400 w-16 shrink-0">City:</span>
                <span className="font-semibold text-charcoal">{inquiry.customerDetails.city}</span>
              </div>
              {inquiry.customerDetails.address && (
                <div className="col-span-1 sm:col-span-2 flex items-start gap-2 pt-1.5">
                  <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <span className="font-medium text-gray-400 w-16 shrink-0">Address:</span>
                  <span className="font-medium text-charcoal leading-relaxed">{inquiry.customerDetails.address}</span>
                </div>
              )}
              {inquiry.customerDetails.message && (
                <div className="col-span-1 sm:col-span-2 flex items-start gap-2 pt-1.5 border-t border-cream-dark/10 mt-1.5">
                  <span className="font-medium text-gray-400 w-16 shrink-0 mt-0.5">Notes:</span>
                  <span className="font-medium text-primary italic leading-relaxed">"{inquiry.customerDetails.message}"</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Sarees List */}
          <div>
            <h3 className="font-serif text-xs font-bold uppercase tracking-widest text-primary border-b border-cream-dark/15 pb-2 mb-4">
              Selected Sarees Details
            </h3>
            
            <div className="divide-y divide-cream-dark/15">
              {inquiry.items.map((item) => {
                const activePrice = item.discountPrice ? item.discountPrice : item.price;
                return (
                  <div key={item.sareeId} className="py-3 flex items-center justify-between text-xs gap-4">
                    <div className="flex items-center gap-3">
                      {/* Image Thumbnail */}
                      <div className="w-10 aspect-[3/4] bg-cream-dark/15 shrink-0 rounded overflow-hidden border border-cream-dark/20 flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[9px] font-serif font-bold text-primary">BTT</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-serif font-bold text-charcoal text-sm">{item.name}</span>
                        <span className="text-[9px] text-charcoal-light font-mono uppercase">SKU: {item.sku}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-charcoal-light text-right">
                      <span>{formatPrice(activePrice)} x {item.quantity}</span>
                      <span className="font-semibold text-charcoal text-sm">{formatPrice(activePrice * item.quantity)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Subtotal */}
            <div className="border-t border-cream-dark/20 pt-4 flex items-center justify-between font-bold text-charcoal">
              <span className="text-xs uppercase tracking-wider text-charcoal-light">Total Estimated Amount</span>
              <span className="text-primary text-lg">{formatPrice(inquiry.totalAmount)}</span>
            </div>

          </div>

        </div>

      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 print:hidden">
        
        {/* WhatsApp Deep link */}
        <a
          href={getWhatsAppInvoiceLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto bg-emerald-600 text-white border border-emerald-700 hover:bg-emerald-500 px-8 py-3.5 rounded text-xs font-bold tracking-widest uppercase shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-4 h-4 fill-current" /> Send Invoice on WhatsApp
        </a>



        {/* Continue Shopping */}
        <RouterLink
          to="/shop"
          className="w-full sm:w-auto bg-primary text-white border border-gold hover:bg-primary-dark px-8 py-3.5 rounded text-xs font-bold tracking-widest uppercase shadow-sm flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" /> Return to Catalog
        </RouterLink>

      </div>

    </div>
  );
};

export default OrderConfirmation;
