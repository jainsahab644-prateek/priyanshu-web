import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, FolderTree, Layers, MessageSquare, 
  AlertTriangle, ArrowUpRight, TrendingUp, CheckCircle, RefreshCw 
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalCollections: 0,
    totalInquiries: 0,
    newInquiries: 0,
    saleProducts: 0,
    lowStockProducts: 0
  });
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [lowStockSarees, setLowStockSarees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

      // Fetch sarees
      const resSarees = await fetch('/api/admin/sarees', { headers: authHeaders });
      const sarees = resSarees.ok ? await resSarees.json() : [];
      
      // Fetch categories
      const resCats = await fetch('/api/categories');
      const categories = resCats.ok ? await resCats.json() : [];

      // Fetch collections
      const resColls = await fetch('/api/admin/collections', { headers: authHeaders });
      const collections = resColls.ok ? await resColls.json() : [];

      // Fetch inquiries
      const resInq = await fetch('/api/admin/inquiries', { headers: authHeaders });
      const inquiries = resInq.ok ? await resInq.json() : [];

      // Computations
      const saleCount = sarees.filter(s => s.isSale || (s.discountPrice && s.discountPrice < s.price)).length;
      const lowStockCount = sarees.filter(s => s.stockQty <= 2 || s.stockStatus === 'out_of_stock').length;
      const newInqCount = inquiries.filter(i => i.status === 'New').length;

      setStats({
        totalProducts: sarees.length,
        totalCategories: categories.length,
        totalCollections: collections.length,
        totalInquiries: inquiries.length,
        newInquiries: newInqCount,
        saleProducts: saleCount,
        lowStockProducts: lowStockCount
      });

      setRecentInquiries(inquiries.slice(0, 5));
      setLowStockSarees(sarees.filter(s => s.stockQty <= 2 || s.stockStatus === 'out_of_stock').slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-cream-dark/20 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary tracking-wide">
            Dashboard Overview
          </h1>
          <p className="text-xs text-charcoal-light uppercase tracking-wider mt-1">
            Store operations and performance summary
          </p>
        </div>
        
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-1.5 bg-white border border-cream-dark/45 hover:bg-cream-light text-xs font-semibold px-4 py-2 rounded text-charcoal transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4 text-gold shrink-0" /> Refresh Data
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin mb-3" />
          <p className="font-serif text-charcoal-light text-sm italic">Loading dashboard statistics...</p>
        </div>
      ) : (
        <>
          {/* ==========================================
              1. SUMMARY CARDS GRID
              ========================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-charcoal select-none">
            
            {/* New Inquiries Card */}
            <div className="bg-white border border-cream-dark/30 rounded-lg p-5 shadow-sm flex items-center justify-between gold-border-glow">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">New Inquiries</span>
                <h3 className="text-2xl font-bold text-primary">{stats.newInquiries}</h3>
                <span className="text-[10px] text-emerald-600 font-semibold">Pending response</span>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                <MessageSquare className="w-6 h-6" />
              </div>
            </div>

            {/* Total Sarees Card */}
            <div className="bg-white border border-cream-dark/30 rounded-lg p-5 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Sarees</span>
                <h3 className="text-2xl font-bold text-charcoal">{stats.totalProducts}</h3>
                <span className="text-[10px] text-gold-dark font-medium">{stats.saleProducts} on discount</span>
              </div>
              <div className="p-3 bg-gold-light/10 text-gold-dark rounded-full">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>

            {/* Total Inquiries Card */}
            <div className="bg-white border border-cream-dark/30 rounded-lg p-5 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Inquiries</span>
                <h3 className="text-2xl font-bold text-charcoal">{stats.totalInquiries}</h3>
                <span className="text-[10px] text-charcoal-light font-medium">All logged inquires</span>
              </div>
              <div className="p-3 bg-cream text-primary rounded-full">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            {/* Low Stock Alert Card */}
            <div className="bg-white border border-cream-dark/30 rounded-lg p-5 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Low Stock Alerts</span>
                <h3 className={`text-2xl font-bold ${stats.lowStockProducts > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {stats.lowStockProducts}
                </h3>
                <span className="text-[10px] text-charcoal-light font-medium">Items with &lt;= 2 quantity</span>
              </div>
              <div className={`p-3 rounded-full ${stats.lowStockProducts > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {stats.lowStockProducts > 0 ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
              </div>
            </div>

          </div>

          {/* ==========================================
              2. LOWER DETAILED BLOCK (Inquiries and Low Stock)
              ========================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Recent Inquiries Table (2 cols width) */}
            <div className="lg:col-span-2 bg-white border border-cream-dark/30 rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-cream-dark/20 flex items-center justify-between bg-cream-light">
                <h3 className="font-serif text-sm font-bold text-primary uppercase tracking-wider">
                  Recent Order Inquiries
                </h3>
                <Link
                  to="/admin/inquiries"
                  className="text-[10px] text-primary hover:text-gold uppercase tracking-wider font-bold inline-flex items-center gap-1"
                >
                  View All <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                {recentInquiries.length > 0 ? (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-cream-dark/10 text-charcoal-light border-b border-cream-dark/15 font-semibold">
                        <th className="p-4">Inquiry ID</th>
                        <th className="p-4">Customer Name</th>
                        <th className="p-4">Sarees</th>
                        <th className="p-4 text-right">Subtotal</th>
                        <th className="p-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream-dark/10 font-medium text-charcoal-light">
                      {recentInquiries.map((inq) => (
                        <tr key={inq._id} className="hover:bg-cream-light/40 transition-colors">
                          <td className="p-4">
                            <Link to="/admin/inquiries" className="text-primary hover:underline font-serif font-semibold">
                              {inq.inquiryNumber.slice(-8)}
                            </Link>
                          </td>
                          <td className="p-4 font-semibold text-charcoal">{inq.customerDetails.name}</td>
                          <td className="p-4">
                            {inq.items.reduce((acc, i) => acc + i.quantity, 0)} Items
                          </td>
                          <td className="p-4 text-right font-semibold text-charcoal">
                            {formatPrice(inq.totalAmount)}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getStatusColor(inq.status)}`}>
                              {inq.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-12 text-center text-gray-400">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-cream-dark/60" />
                    <p className="text-xs">No customer inquiries submitted yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Low Stock Alert Items */}
            <div className="bg-white border border-cream-dark/30 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
              <div className="px-6 py-4 border-b border-cream-dark/20 flex items-center justify-between bg-cream-light">
                <h3 className="font-serif text-sm font-bold text-primary uppercase tracking-wider">
                  Low Stock Inventory
                </h3>
                <Link
                  to="/admin/products"
                  className="text-[10px] text-primary hover:text-gold uppercase tracking-wider font-bold inline-flex items-center gap-1"
                >
                  Manage Catalog <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-4 divide-y divide-cream-dark/15 flex-grow overflow-y-auto">
                {lowStockSarees.length > 0 ? (
                  lowStockSarees.map((saree) => (
                    <div key={saree._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 aspect-[3/4] bg-cream-dark/15 rounded border shrink-0 overflow-hidden flex items-center justify-center">
                          {saree.images && saree.images.length > 0 ? (
                            <img src={saree.images[0]} alt={saree.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[8px] font-bold text-primary">BTT</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-serif font-bold text-charcoal max-w-[120px] truncate">{saree.name}</span>
                          <span className="text-[9px] text-charcoal-light uppercase font-mono">SKU: {saree.sku}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          Number(saree.stockQty) === 0 
                            ? 'bg-rose-50 text-rose-800 border border-rose-200' 
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {saree.stockQty} In Stock
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                    <p className="text-xs">All products have healthy stock counts!</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
};

export default AdminDashboard;
