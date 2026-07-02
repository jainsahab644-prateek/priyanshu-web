import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, Calendar, MessageSquare, Loader2, Users, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminCustomers = () => {
  const { authFetch } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await authFetch('/api/admin/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching admin customers directory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers by search input
  const filteredCustomers = customers.filter(cust => {
    const q = search.toLowerCase();
    return (
      cust.name.toLowerCase().includes(q) ||
      cust.email.toLowerCase().includes(q) ||
      cust.phone.toLowerCase().includes(q)
    );
  });

  // Calculate stats
  const totalCustomers = customers.length;
  const activeInquirers = customers.filter(c => c.inquiriesCount > 0).length;
  const totalCustomerBookings = customers.reduce((acc, c) => acc + c.inquiriesCount, 0);

  return (
    <div className="space-y-6 text-charcoal">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-cream-dark/20 pb-6 select-none">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary tracking-wide">
            Registered Shoppers
          </h1>
          <p className="text-xs text-charcoal-light uppercase tracking-wider mt-1">
            View and monitor registered customer profile records and directory
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 select-none">
        
        {/* Total Customers */}
        <div className="bg-white border border-cream-dark/30 rounded-lg p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Accounts</span>
            <h3 className="text-2xl font-bold text-primary">{totalCustomers}</h3>
            <span className="text-[10px] text-charcoal-light font-medium">Registered shoppers</span>
          </div>
          <div className="p-3 bg-cream text-primary rounded-full">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Active Inquirers */}
        <div className="bg-white border border-cream-dark/30 rounded-lg p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active Inquirers</span>
            <h3 className="text-2xl font-bold text-charcoal">{activeInquirers}</h3>
            <span className="text-[10px] text-emerald-600 font-semibold">
              {totalCustomers > 0 ? Math.round((activeInquirers / totalCustomers) * 100) : 0}% of users
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Total Customer Bookings */}
        <div className="bg-white border border-cream-dark/30 rounded-lg p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Customer Inquiries</span>
            <h3 className="text-2xl font-bold text-charcoal">{totalCustomerBookings}</h3>
            <span className="text-[10px] text-charcoal-light font-medium">Total inquiries logged</span>
          </div>
          <div className="p-3 bg-gold-light/10 text-gold-dark rounded-full">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Toolbar */}
      <div className="bg-white border border-cream-dark/25 p-4 rounded-lg flex items-center justify-between text-xs">
        <div className="relative w-full max-w-sm">
          <Search className="w-4.5 h-4.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name, email, or phone..."
            className="w-full pl-9 pr-3 py-2 border border-cream-dark/40 bg-cream-light rounded focus:outline-none focus:border-gold text-xs"
          />
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
          <p className="font-serif text-charcoal-light text-sm italic">Loading customer directory...</p>
        </div>
      ) : (
        <div className="bg-white border border-cream-dark/30 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {filteredCustomers.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs select-none">
                <thead>
                  <tr className="bg-cream-light border-b border-cream-dark/15 text-charcoal-light font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Customer Shopper</th>
                    <th className="p-4">WhatsApp Phone</th>
                    <th className="p-4">Registration Date</th>
                    <th className="p-4 text-center">Inquiry Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-dark/10 font-medium text-charcoal-light">
                  {filteredCustomers.map((cust) => (
                    <tr key={cust._id} className="hover:bg-cream-light/40 transition-colors">
                      
                      {/* Customer Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary text-white border border-gold/45 rounded-full flex items-center justify-center font-serif text-sm font-bold shadow-sm select-none">
                            {cust.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-serif font-bold text-charcoal text-sm leading-normal">{cust.name}</span>
                            <span className="text-[10px] text-gray-400 font-normal flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-gold" /> {cust.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="p-4">
                        <span className="font-mono font-semibold flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-emerald-500" /> {cust.phone}
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="p-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gold" />
                          {new Date(cust.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                        </span>
                      </td>

                      {/* Inquiry Count */}
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          cust.inquiriesCount > 0 
                            ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                            : 'bg-gray-50 text-gray-400 border border-gray-200'
                        }`}>
                          {cust.inquiriesCount} Bookings
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-16 text-center text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 text-cream-dark/60" />
                <p className="text-sm font-serif font-bold text-charcoal">No customer records matching search</p>
                <p className="text-xs mt-1">As soon as customers register and sign up, they will appear in this list.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCustomers;
