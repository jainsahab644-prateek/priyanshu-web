import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Public Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

// Public Pages
import Home from './pages/Home';
import SareeCatalog from './pages/SareeCatalog';
import SareeDetails from './pages/SareeDetails';
import Cart from './pages/Cart';
import OrderConfirmation from './pages/OrderConfirmation';
import About from './pages/About';
import Contact from './pages/Contact';
import CustomerAuth from './pages/CustomerAuth';
import CustomerProfile from './pages/CustomerProfile';

// Admin Components
import AdminLayout from './admin/AdminLayout';

// Admin Pages
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminProducts from './admin/AdminProducts';
import AdminCategories from './admin/AdminCategories';
import AdminCollections from './admin/AdminCollections';
import AdminInquiries from './admin/AdminInquiries';
import AdminBanners from './admin/AdminBanners';
import AdminSettings from './admin/AdminSettings';
import AdminCustomers from './admin/AdminCustomers';

// Public Layout Wrapper
const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* PUBLIC WEBPAGE ROUTES */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<SareeCatalog />} />
          <Route path="/saree/:id" element={<SareeDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<CustomerAuth />} />
          <Route path="/profile" element={<CustomerProfile />} />
        </Route>

        {/* ADMIN PORTAL ACCESS ROUTES */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* PROTECTED ADMIN PATHS */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="collections" element={<AdminCollections />} />
          <Route path="inquiries" element={<AdminInquiries />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="customers" element={<AdminCustomers />} />
        </Route>

        {/* DEFAULT FALLBACK CATCHALL */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
