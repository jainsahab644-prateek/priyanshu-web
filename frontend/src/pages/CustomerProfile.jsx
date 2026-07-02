import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useSettings } from '../context/SettingsContext';
import { User, Mail, Phone, Calendar, LogOut, MessageSquare, ExternalLink, CalendarDays, Inbox, Loader2 } from 'lucide-react';

const CustomerProfile = () => {
  const { customerUser, customerLoading, customerLogout, customerAuthFetch } = useCustomerAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [inquiries, setInquiries] = useState([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(true);

  // Redirect to login if not logged in
  useEffect(() => {
    if (!customerLoading && !customerUser) {
      navigate('/login');
    }
  }, [customerUser, customerLoading, navigate]);

  // Fetch customer inquiries
  useEffect(() => {
    const fetchMyInquiries = async () => {
      if (!customerUser) return;
      try {
        const response = await customerAuthFetch('/api/customers/inquiries');
        if (response.ok) {
          const data = await response.json();
          setInquiries(data);
        }
      } catch (error) {
        console.error('Error fetching customer inquiries:', error);
      } finally {
        setInquiriesLoading(false);
      }
    };

    fetchMyInquiries();
  }, [customerUser]);

  const handleLogout = () => {
    customerLogout();
    navigate('/');
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Contacted': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Confirmed': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Cancelled': return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Completed': return 'bg-purple-50 text-purple-800 border-purple-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getWhatsAppChatLink = (inq) => {
    const whatsappNum = settings?.contactDetails?.whatsapp?.replace(/[^0-9]/g, '') || '919876543210';
    const message = `Hello Bani Thani Textiles, I would like to check the status of my order inquiry:\n\n*Inquiry ID*: ${inq.inquiryNumber}\n*Total Amount*: ₹${inq.totalAmount}`;
    return `https://wa.me/${whatsappNum}?text=${encodeURIComponent(message)}`;
  };

  if (customerLoading || !customerUser) {
    return (
      <div className="flex flex-col items-center justify-center py-36 text-center select-none">
        <Loader2 className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
        <p className="font-serif text-charcoal-light text-sm italic">Loading customer dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-charcoal">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-cream-dark/20 pb-6 mb-8 select-none">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary tracking-wide">
            My Customer Account
          </h1>
          <p className="text-xs text-charcoal-light uppercase tracking-wider mt-1">
            Manage your profile, view submitted order inquiries & get WhatsApp updates
          </p>
        </div>
        
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100/70 text-xs font-bold px-5 py-2.5 rounded shadow-sm transition-all uppercase tracking-wider self-start md:self-center"
        >
          <LogOut className="w-4 h-4 shrink-0" /> Logout Account
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Account details card */}
        <div className="bg-white border border-cream-dark/30 rounded-xl p-6 sm:p-8 shadow-sm h-fit">
          <h3 className="font-serif text-base font-bold text-primary border-b border-cream-dark/15 pb-2 mb-6 uppercase tracking-wider">
            Profile Details
          </h3>
          
          <div className="space-y-4 text-xs font-semibold text-charcoal-light leading-relaxed">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cream text-primary rounded-full shrink-0">
                <User className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Full Name</span>
                <span className="font-bold text-charcoal text-sm">{customerUser.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-cream text-primary rounded-full shrink-0">
                <Mail className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Email Address</span>
                <span className="font-medium text-charcoal text-sm break-all">{customerUser.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-cream text-primary rounded-full shrink-0">
                <Phone className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase tracking-wider">WhatsApp Phone</span>
                <span className="font-semibold text-charcoal text-sm">{customerUser.phone}</span>
              </div>
            </div>

            {customerUser.createdAt && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cream text-primary rounded-full shrink-0">
                  <CalendarDays className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Date Registered</span>
                  <span className="font-medium text-charcoal text-sm">
                    {new Date(customerUser.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Inquiries list (2 cols wide) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-cream-dark/30 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[350px]">
            
            <div className="px-6 py-4 border-b border-cream-dark/20 flex items-center justify-between bg-cream-light/40">
              <h3 className="font-serif text-sm font-bold text-primary uppercase tracking-wider">
                My Saree Booking Inquiries
              </h3>
            </div>

            {inquiriesLoading ? (
              <div className="flex flex-col items-center justify-center flex-grow py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                <p className="text-xs italic text-gray-400">Loading inquiry history...</p>
              </div>
            ) : inquiries.length > 0 ? (
              <div className="overflow-x-auto flex-grow">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-cream-dark/10 text-charcoal-light border-b border-cream-dark/15 font-semibold text-[10px] uppercase tracking-wider select-none">
                      <th className="p-4">Inquiry ID</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-center">Items</th>
                      <th className="p-4 text-right">Subtotal</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-dark/10 font-medium text-charcoal-light">
                    {inquiries.map((inq) => (
                      <tr key={inq._id} className="hover:bg-cream-light/30 transition-colors">
                        <td className="p-4">
                          <Link 
                            to={`/confirmation/${inq._id}`} 
                            className="text-primary hover:underline font-serif font-bold text-sm flex items-center gap-1.5"
                          >
                            <span>{inq.inquiryNumber.slice(-8)}</span>
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          </Link>
                        </td>
                        <td className="p-4">
                          {new Date(inq.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                        </td>
                        <td className="p-4 text-center">
                          {inq.items.reduce((acc, item) => acc + item.quantity, 0)} Pcs
                        </td>
                        <td className="p-4 text-right font-bold text-charcoal">
                          {formatPrice(inq.totalAmount)}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold ${getStatusColor(inq.status)}`}>
                            {inq.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <a
                            href={getWhatsAppChatLink(inq)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex p-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 rounded-full transition-all"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5 fill-current" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-grow py-16 text-center text-gray-400 px-6">
                <Inbox className="w-12 h-12 mx-auto mb-3 text-cream-dark/65" />
                <p className="text-sm font-serif font-bold text-charcoal mb-1">No inquiries submitted yet</p>
                <p className="text-xs max-w-sm leading-relaxed mb-6">You haven't submitted any saree inquiries yet. Saree bookings will appear here as soon as you inquire.</p>
                <Link
                  to="/shop"
                  className="bg-primary text-white border border-gold hover:bg-primary-dark px-6 py-2.5 rounded text-xs font-bold tracking-widest uppercase shadow-md transition-all"
                >
                  Browse Saree Catalog
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default CustomerProfile;
