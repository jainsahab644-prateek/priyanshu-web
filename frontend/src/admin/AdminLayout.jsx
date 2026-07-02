import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, FolderTree, Layers, Image, 
  MessageSquare, Settings, LogOut, Menu, X, ShieldAlert, Users 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const AdminLayout = () => {
  const { token, loading, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Protected route check
  useEffect(() => {
    if (!loading && !token) {
      navigate('/admin/login');
    }
  }, [token, loading, navigate]);

  // Close mobile sidebar on page navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-light flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
        <p className="font-serif text-charcoal-light text-sm italic">Verifying credentials...</p>
      </div>
    );
  }

  if (!token) return null; // Let the useEffect redirect

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Saree Catalog', path: '/admin/products', icon: ShoppingBag },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Collections', path: '/admin/collections', icon: Layers },
    { name: 'Banners & Marquees', path: '/admin/banners', icon: Image },
    { name: 'Inquiries Queue', path: '/admin/inquiries', icon: MessageSquare },
    { name: 'Customers Directory', path: '/admin/customers', icon: Users },
    { name: 'Global Settings', path: '/admin/settings', icon: Settings },
  ];

  const shopName = settings?.shopName || 'Bani Thani Textiles';

  return (
    <div className="min-h-screen bg-cream flex">
      
      {/* ==========================================
          1. DESKTOP SIDEBAR (Visible on lg)
          ========================================== */}
      <aside className="hidden lg:flex flex-col w-64 bg-charcoal text-gray-300 border-r border-gold/30 shrink-0">
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-800 text-center select-none bg-charcoal-dark">
          <span className="font-serif text-lg font-bold text-white tracking-widest uppercase block">
            BTT ADMIN
          </span>
          <span className="text-[9px] text-gold uppercase tracking-[0.2em] font-semibold border-t border-gold/30 mt-1 pt-0.5 inline-block">
            {shopName}
          </span>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-grow p-4 space-y-1.5 text-xs font-semibold uppercase tracking-wider">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary text-white border-l-4 border-gold' 
                    : 'hover:bg-charcoal-light hover:text-white'
                }`}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800 bg-charcoal-dark">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 rounded transition-colors"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Logout</span>
          </button>
        </div>

      </aside>

      {/* ==========================================
          2. MOBILE SIDEBAR DRAWER (Visible on mobile)
          ========================================== */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" id="admin-sidebar-mobile">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-charcoal/65 backdrop-blur-[1px]"
            onClick={() => setIsSidebarOpen(false)}
          />

          <div className="relative w-64 bg-charcoal text-gray-300 h-full flex flex-col justify-between border-r border-gold/30">
            <div>
              {/* Header */}
              <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-charcoal-dark">
                <span className="font-serif text-sm font-bold text-white tracking-widest uppercase">Admin Panel</span>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 hover:bg-charcoal-light rounded text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="p-4 space-y-1.5 text-xs font-semibold uppercase tracking-wider flex flex-col">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded transition-all ${
                        isActive 
                          ? 'bg-primary text-white border-l-4 border-gold' 
                          : 'hover:bg-charcoal-light hover:text-white'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Logout */}
            <div className="p-4 border-t border-gray-800 bg-charcoal-dark">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 rounded"
              >
                <LogOut className="w-4.5 h-4.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          3. MAIN CONTAINER
          ========================================== */}
      <div className="flex-grow flex flex-col overflow-x-hidden">
        
        {/* Mobile Header Toolbar */}
        <header className="lg:hidden bg-charcoal text-white h-16 flex items-center justify-between px-6 border-b border-gold/30 select-none">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1 hover:bg-charcoal-light rounded"
            aria-label="Open navigation sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <span className="font-serif text-sm font-bold tracking-widest">
            {shopName.toUpperCase()} ADMIN
          </span>
          
          <div className="w-6 h-6" /> {/* Spacer */}
        </header>

        {/* Dynamic Inner Views */}
        <main className="p-6 sm:p-10 flex-grow">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

      </div>

    </div>
  );
};

export default AdminLayout;
