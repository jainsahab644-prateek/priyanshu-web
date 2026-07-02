import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft, Send, CheckSquare, Square, AlertCircle, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  // Inquiry Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle syncing phone to whatsapp
  const handlePhoneChange = (val) => {
    setPhone(val);
    if (sameAsPhone) {
      setWhatsapp(val);
    }
  };

  const handleSameAsPhoneToggle = () => {
    setSameAsPhone(prev => {
      const next = !prev;
      if (next) {
        setWhatsapp(phone);
      }
      return next;
    });
  };

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!name.trim()) return setErrorMsg('Full Name is required.');
    if (!phone.trim()) return setErrorMsg('Mobile Number is required.');
    if (!sameAsPhone && !whatsapp.trim()) return setErrorMsg('WhatsApp Number is required.');
    if (!city.trim()) return setErrorMsg('City is required.');

    setSubmitting(true);

    try {
      const inquiryData = {
        customerDetails: {
          name: name.trim(),
          phone: phone.trim(),
          whatsapp: sameAsPhone ? phone.trim() : whatsapp.trim(),
          email: email.trim(),
          city: city.trim(),
          address: address.trim(),
          message: message.trim()
        },
        items: cartItems.map(item => ({
          sareeId: item._id,
          name: item.name,
          sku: item.sku,
          price: item.price,
          discountPrice: item.discountPrice,
          quantity: item.quantity,
          image: item.image
        })),
        totalAmount: cartTotal
      };

      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inquiryData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit inquiry');
      }

      // Success
      clearCart();
      navigate(`/confirmation/${data._id}`);
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      setErrorMsg(err.message || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
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

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 text-cream-dark/50 mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-semibold text-charcoal mb-3">Your Inquiry Bag is Empty</h2>
        <p className="text-sm text-gray-400 mb-8 max-w-sm mx-auto">
          Add sarees from our exquisite collection first, then fill out the inquiry form to book them.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 bg-primary text-white border border-gold/30 px-8 py-3 rounded text-xs font-bold tracking-widest uppercase hover:bg-primary-dark transition-all shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Browse Saree Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Title */}
      <div className="border-b border-cream-dark/20 pb-6 mb-8 text-center sm:text-left">
        <h1 className="font-serif text-3xl font-bold text-primary tracking-wide">
          Your Inquiry Bag
        </h1>
        <p className="text-xs text-charcoal-light uppercase tracking-wider mt-1">
          Review items and submit booking requests
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Left Side: Items list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-cream-dark/30 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-cream-light border-b border-cream-dark/20 text-xs font-semibold text-charcoal uppercase tracking-wider">
              Selected Sarees
            </div>
            
            <div className="divide-y divide-cream-dark/15 px-6">
              {cartItems.map((item) => (
                <div key={item._id} className="py-5 flex gap-4 sm:gap-6">
                  {/* Thumbnail */}
                  <div className="w-20 sm:w-24 aspect-[3/4] bg-cream-dark/10 shrink-0 rounded overflow-hidden border border-cream-dark/20 flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-primary/40 font-serif font-bold uppercase text-center leading-none">BTT</span>
                    )}
                  </div>

                  {/* Detail */}
                  <div className="flex-grow flex flex-col">
                    <Link
                      to={`/saree/${item._id}`}
                      className="font-serif text-base font-semibold text-charcoal hover:text-primary mb-1 line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <span className="text-[10px] text-charcoal-light font-mono uppercase mb-4">SKU: {item.sku}</span>

                    <div className="flex items-center justify-between mt-auto">
                      {/* Qty controller */}
                      <div className="flex items-center border border-cream-dark/40 rounded bg-cream-light">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="px-2.5 py-1 hover:bg-cream-dark/25 text-xs text-charcoal font-semibold"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs text-charcoal font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="px-2.5 py-1 hover:bg-cream-dark/25 text-xs text-charcoal font-semibold"
                        >
                          +
                        </button>
                      </div>

                      {/* Total */}
                      <span className="text-primary font-bold text-base">
                        {formatPrice(item.discountPrice ? item.discountPrice * item.quantity : item.price * item.quantity)}
                      </span>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-gray-400 hover:text-primary self-center p-1.5 hover:bg-cream rounded-full transition-colors"
                    aria-label="Remove saree"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Total Row */}
            <div className="border-t border-cream-dark/20 px-6 py-5 bg-cream-light flex items-center justify-between">
              <span className="text-sm font-semibold text-charcoal-light uppercase tracking-wider">Estimated Total Value</span>
              <span className="text-primary font-bold text-xl">{formatPrice(cartTotal)}</span>
            </div>

          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Continue browsing sarees
          </Link>
        </div>

        {/* Right Side: Inquiry Form */}
        <div className="bg-white border border-cream-dark/30 rounded-lg shadow-sm p-6">
          <h2 className="font-serif text-lg font-bold text-primary border-b border-cream-dark/20 pb-3 mb-5 uppercase tracking-wide">
            Inquiry & Booking Form
          </h2>

          {errorMsg && (
            <div className="bg-rose-50 text-rose-800 border border-rose-200 p-3 rounded text-xs flex items-start gap-2 mb-4 select-none">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitInquiry} className="space-y-4 text-xs font-medium text-charcoal">
            
            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label htmlFor="name-input">Full Name *</label>
              <input
                id="name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="border border-cream-dark/45 rounded p-2.5 bg-cream-light text-charcoal focus:outline-none focus:border-gold"
              />
            </div>

            {/* Mobile Phone */}
            <div className="flex flex-col gap-1">
              <label htmlFor="phone-input">Mobile Number *</label>
              <input
                id="phone-input"
                type="tel"
                required
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                className="border border-cream-dark/45 rounded p-2.5 bg-cream-light text-charcoal focus:outline-none focus:border-gold"
              />
            </div>

            {/* Same As Mobile Toggle */}
            <button
              type="button"
              onClick={handleSameAsPhoneToggle}
              className="flex items-center gap-2 text-[11px] text-charcoal-light py-1 select-none focus:outline-none"
            >
              {sameAsPhone ? (
                <CheckSquare className="w-4 h-4 text-primary fill-current text-white border-0" />
              ) : (
                <Square className="w-4 h-4 text-gray-300" />
              )}
              <span>WhatsApp number is same as Mobile number</span>
            </button>

            {/* WhatsApp Phone */}
            {!sameAsPhone && (
              <div className="flex flex-col gap-1 animate-fade-in">
                <label htmlFor="whatsapp-input">WhatsApp Number *</label>
                <input
                  id="whatsapp-input"
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Enter WhatsApp number"
                  className="border border-cream-dark/45 rounded p-2.5 bg-cream-light text-charcoal focus:outline-none focus:border-gold"
                />
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label htmlFor="email-input">Email Address (Optional)</label>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="border border-cream-dark/45 rounded p-2.5 bg-cream-light text-charcoal focus:outline-none focus:border-gold"
              />
            </div>

            {/* City */}
            <div className="flex flex-col gap-1">
              <label htmlFor="city-input">City *</label>
              <input
                id="city-input"
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter your city name"
                className="border border-cream-dark/45 rounded p-2.5 bg-cream-light text-charcoal focus:outline-none focus:border-gold"
              />
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1">
              <label htmlFor="address-input">Delivery Address (Optional)</label>
              <textarea
                id="address-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter complete shipping address"
                rows={2}
                className="border border-cream-dark/45 rounded p-2.5 bg-cream-light text-charcoal focus:outline-none focus:border-gold resize-none"
              />
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1">
              <label htmlFor="message-input">Message / Special Requirements (Optional)</label>
              <textarea
                id="message-input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Any customized blouse details, urgency requirements, etc."
                rows={2.5}
                className="border border-cream-dark/45 rounded p-2.5 bg-cream-light text-charcoal focus:outline-none focus:border-gold resize-none"
              />
            </div>

            <p className="text-[10px] text-gray-400 italic pt-2">
              * Note: There is no payment gateway active. Submitting this inquiry locks the items. Our sales agent will reach out on WhatsApp to coordinate order delivery and address questions.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-white border border-gold hover:bg-primary-dark py-3.5 rounded text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 mt-4"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" /> Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Submit Order Inquiry
                </>
              )}
            </button>

          </form>
        </div>

      </div>

    </div>
  );
};

export default Cart;
