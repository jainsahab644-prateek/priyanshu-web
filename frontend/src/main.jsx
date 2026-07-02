import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <CartProvider>
          <CustomerAuthProvider>
            <App />
          </CustomerAuthProvider>
        </CartProvider>
      </SettingsProvider>
    </AuthProvider>
  </React.StrictMode>
);
