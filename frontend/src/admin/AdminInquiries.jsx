import React, { useState, useEffect } from 'react';
import { MessageSquare, Phone, Download, Eye, X, Edit2, Loader2, Save, FileSpreadsheet } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const AdminInquiries = () => {
  const { settings } = useSettings();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Details Modal
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [notesText, setNotesText] = useState('');
  const [updatingInq, setUpdatingInq] = useState(false);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/inquiries', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setInquiries(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleOpenDetails = (inq) => {
    setSelectedInquiry(inq);
    setNotesText(inq.internalNotes || '');
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingInq(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (selectedInquiry && selectedInquiry._id === id) {
          setSelectedInquiry(prev => ({ ...prev, status: newStatus }));
        }
        fetchInquiries();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingInq(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setUpdatingInq(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/inquiries/${selectedInquiry._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          internalNotes: notesText.trim()
        })
      });
      if (response.ok) {
        alert('Internal notes saved successfully.');
        fetchInquiries();
      }
    } catch (e) {
      console.error(e);
      alert('Failed to save notes.');
    } finally {
      setUpdatingInq(false);
    }
  };

  // Export Inquiries to CSV Excel sheet
  const handleExportCSV = () => {
    if (inquiries.length === 0) return;
    
    const headers = ['Inquiry Number,Name,Phone,WhatsApp,Email,City,Address,Total Amount,Status,Date\n'];
    const rows = inquiries.map(inq => {
      const esc = (val) => `"${(val || '').toString().replace(/"/g, '""')}"`;
      return [
        inq.inquiryNumber,
        esc(inq.customerDetails.name),
        esc(inq.customerDetails.phone),
        esc(inq.customerDetails.whatsapp),
        esc(inq.customerDetails.email),
        esc(inq.customerDetails.city),
        esc(inq.customerDetails.address),
        inq.totalAmount,
        inq.status,
        new Date(inq.createdAt).toLocaleDateString()
      ].join(',');
    });

    const blob = new Blob([headers + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `BTT_Catalog_Inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format currency
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

  const getWhatsAppMessageLink = (inq) => {
    const whatsappNum = inq.customerDetails.whatsapp.replace(/[^0-9]/g, '');
    const message = `Hello ${inq.customerDetails.name}, I am contacting you regarding your saree inquiry ${inq.inquiryNumber} placed with Bani Thani Textiles. Let's discuss details!`;
    return `https://wa.me/${whatsappNum}?text=${encodeURIComponent(message)}`;
  };

  const filteredInquiries = statusFilter 
    ? inquiries.filter(i => i.status === statusFilter) 
    : inquiries;

  return (
    <div className="space-y-6 text-charcoal">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-cream-dark/20 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary tracking-wide">
            Customer Inquiries Queue
          </h1>
          <p className="text-xs text-charcoal-light uppercase tracking-wider mt-1">
            Review customer saree selections, update contacted states, and call/WhatsApp users
          </p>
        </div>
        
        <button
          onClick={handleExportCSV}
          disabled={inquiries.length === 0}
          className="inline-flex items-center gap-1.5 bg-white border border-cream-dark/45 hover:bg-cream-light text-xs font-semibold px-4 py-2.5 rounded text-charcoal transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-600 shrink-0" /> Export Inquiries to CSV
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs select-none">
        {['', 'New', 'Contacted', 'Confirmed', 'Completed', 'Cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-full border transition-all ${
              statusFilter === status 
                ? 'bg-primary border-primary text-white font-bold' 
                : 'bg-white border-cream-dark/30 text-charcoal-light hover:border-gold'
            }`}
          >
            {status || 'All Inquiries'}
          </button>
        ))}
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin mb-3" />
          <p className="font-serif text-charcoal-light text-sm italic">Loading customer inquiries...</p>
        </div>
      ) : (
        <div className="bg-white border border-cream-dark/30 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {filteredInquiries.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs select-none">
                <thead>
                  <tr className="bg-cream-light border-b border-cream-dark/15 text-charcoal-light font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Inquiry Number</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">WhatsApp / Mobile</th>
                    <th className="p-4">City</th>
                    <th className="p-4 text-center">Items</th>
                    <th className="p-4 text-right">Subtotal</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Date</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-dark/10 font-medium text-charcoal-light">
                  {filteredInquiries.map((inq) => (
                    <tr key={inq._id} className="hover:bg-cream-light/40 transition-colors">
                      
                      {/* Inquiry Number */}
                      <td className="p-4 font-serif font-bold text-primary">
                        {inq.inquiryNumber}
                      </td>

                      {/* Customer Name */}
                      <td className="p-4 font-semibold text-charcoal">{inq.customerDetails.name}</td>

                      {/* WhatsApp / phone */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <a 
                            href={`https://wa.me/${inq.customerDetails.whatsapp.replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                          <a 
                            href={`tel:${inq.customerDetails.phone.replace(/\s+/g, '')}`} 
                            className="text-charcoal hover:underline"
                            title="Call customer"
                          >
                            {inq.customerDetails.phone}
                          </a>
                        </div>
                      </td>

                      {/* City */}
                      <td className="p-4">{inq.customerDetails.city}</td>

                      {/* Items count */}
                      <td className="p-4 text-center">
                        {inq.items.reduce((acc, i) => acc + i.quantity, 0)} sarees
                      </td>

                      {/* Total */}
                      <td className="p-4 text-right font-bold text-charcoal">
                        {formatPrice(inq.totalAmount)}
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getStatusColor(inq.status)}`}>
                          {inq.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="p-4 text-center">
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </td>

                      {/* Action */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOpenDetails(inq)}
                          className="p-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded transition-colors"
                          title="View order details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-16 text-center text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-cream-dark/60" />
                <p className="text-sm font-serif font-bold text-charcoal">No customer inquiries found</p>
                <p className="text-xs">Any shopping cart submissions will appear in this queue list.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          D. INQUIRY DETAILS DIALOG MODAL
          ========================================== */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-charcoal/65 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto" id="inquiry-details-modal">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl border border-cream-dark/30">
            
            {/* Header */}
            <div className="px-6 py-4 bg-primary text-white border-b border-gold/30 flex items-center justify-between">
              <h2 className="font-serif text-base font-bold tracking-wide">
                Inquiry Invoice Details: {selectedInquiry.inquiryNumber}
              </h2>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1 text-cream hover:bg-primary-dark rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 text-xs font-semibold text-charcoal max-h-[75vh] overflow-y-auto">
              
              {/* Row 1: Contact card and Status selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Customer card */}
                <div className="bg-cream-light border border-cream-dark/25 p-4 rounded-md space-y-2">
                  <h3 className="font-serif text-xs font-bold uppercase tracking-widest text-primary border-b border-cream-dark/15 pb-1 mb-2">Customer Profile</h3>
                  <p><span className="text-gray-400">Name:</span> <span className="font-bold text-charcoal">{selectedInquiry.customerDetails.name}</span></p>
                  <p><span className="text-gray-400">Phone:</span> <a href={`tel:${selectedInquiry.customerDetails.phone}`} className="text-charcoal hover:underline">{selectedInquiry.customerDetails.phone}</a></p>
                  <p><span className="text-gray-400">WhatsApp:</span> <a href={`https://wa.me/${selectedInquiry.customerDetails.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">{selectedInquiry.customerDetails.whatsapp}</a></p>
                  <p><span className="text-gray-400">Email:</span> <span className="font-medium">{selectedInquiry.customerDetails.email || 'N/A'}</span></p>
                  <p><span className="text-gray-400">City / State:</span> <span className="font-bold">{selectedInquiry.customerDetails.city}</span></p>
                  {selectedInquiry.customerDetails.address && (
                    <p className="pt-1.5 border-t border-cream-dark/10"><span className="text-gray-400">Shipping Address:</span> <span className="font-medium text-charcoal block leading-relaxed mt-1 bg-white p-2 rounded border border-cream-dark/20">{selectedInquiry.customerDetails.address}</span></p>
                  )}
                  {selectedInquiry.customerDetails.message && (
                    <p className="pt-1.5 border-t border-cream-dark/10"><span className="text-gray-400">Customer Message:</span> <span className="font-medium text-primary italic block mt-1">"{selectedInquiry.customerDetails.message}"</span></p>
                  )}
                </div>

                {/* Status selector */}
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="inquiry-status-select">Update Inquiry Status</label>
                    <select
                      id="inquiry-status-select"
                      value={selectedInquiry.status}
                      disabled={updatingInq}
                      onChange={(e) => handleUpdateStatus(selectedInquiry._id, e.target.value)}
                      className="border border-cream-dark/45 rounded p-2.5 bg-cream-light font-medium text-xs text-charcoal focus:outline-none focus:border-gold"
                    >
                      <option value="New">New / Pending Response</option>
                      <option value="Contacted">Customer Contacted</option>
                      <option value="Confirmed">Booking Confirmed</option>
                      <option value="Completed">Order Completed</option>
                      <option value="Cancelled">Inquiry Cancelled</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="internal-notes-textarea">Internal Notes (Admin Only)</label>
                    <textarea
                      id="internal-notes-textarea"
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                      placeholder="Add conversation summary, tracking details, or notes..."
                      rows={4.5}
                      className="border border-cream-dark/45 rounded p-2.5 bg-cream-light font-medium text-xs text-charcoal focus:outline-none focus:border-gold resize-none"
                    />
                    <button
                      type="button"
                      disabled={updatingInq}
                      onClick={handleSaveNotes}
                      className="bg-primary text-white border border-gold hover:bg-primary-dark py-2 rounded text-center font-semibold tracking-wider flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Save className="w-4 h-4" /> Save Notes
                    </button>
                  </div>
                </div>

              </div>

              {/* Row 2: Selected Sarees list */}
              <div>
                <h3 className="font-serif text-xs font-bold uppercase tracking-widest text-primary border-b border-cream-dark/15 pb-1 mb-3">Saree Invoice Summary</h3>
                <div className="divide-y divide-cream-dark/15 border border-cream-dark/20 rounded bg-cream-light px-4">
                  {selectedInquiry.items.map((item) => {
                    const activePrice = item.discountPrice ? item.discountPrice : item.price;
                    return (
                      <div key={item.sareeId} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 aspect-[3/4] bg-cream-dark/25 rounded overflow-hidden shrink-0 border border-cream-dark/20 flex items-center justify-center">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[9px] font-serif font-bold text-primary">BTT</span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-serif font-bold text-charcoal text-xs">{item.name}</span>
                            <span className="text-[9px] text-gray-400 font-mono uppercase">SKU: {item.sku}</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span>{formatPrice(activePrice)} x {item.quantity} = </span>
                          <span className="font-bold text-charcoal">{formatPrice(activePrice * item.quantity)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Total */}
                <div className="flex justify-between items-center font-bold text-charcoal text-sm mt-3 px-4">
                  <span>TOTAL VALUE:</span>
                  <span className="text-primary text-base">{formatPrice(selectedInquiry.totalAmount)}</span>
                </div>
              </div>

              {/* Row 3: Action triggers */}
              <div className="border-t border-cream-dark/20 pt-4 flex gap-3 flex-wrap justify-end">
                <a
                  href={`tel:${selectedInquiry.customerDetails.phone.replace(/\s+/g, '')}`}
                  className="bg-white text-charcoal border border-cream-dark/45 hover:bg-cream px-4 py-2.5 rounded text-center font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Phone className="w-4 h-4" /> Call Customer
                </a>
                <a
                  href={getWhatsAppMessageLink(selectedInquiry)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 text-white border border-emerald-700 hover:bg-emerald-500 px-4 py-2.5 rounded text-center font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                >
                  <MessageSquare className="w-4 h-4 fill-current" /> WhatsApp Contact
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  className="bg-primary text-white border border-gold hover:bg-primary-dark px-5 py-2.5 rounded text-center font-bold uppercase tracking-wider shadow-sm"
                >
                  Close Details
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminInquiries;
