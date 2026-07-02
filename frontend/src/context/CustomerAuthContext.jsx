import React, { createContext, useState, useEffect, useContext } from 'react';

const CustomerAuthContext = createContext();

export const CustomerAuthProvider = ({ children }) => {
  const [customerToken, setCustomerToken] = useState(localStorage.getItem('customer_token') || null);
  const [customerUser, setCustomerUser] = useState(null);
  const [customerLoading, setCustomerLoading] = useState(true);

  useEffect(() => {
    const verifyCustomerToken = async () => {
      if (!customerToken) {
        setCustomerLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/customers/me', {
          headers: {
            'Authorization': `Bearer ${customerToken}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setCustomerUser(data);
        } else {
          // Token expired or invalid
          customerLogout();
        }
      } catch (error) {
        console.error('Error verifying customer token:', error);
      } finally {
        setCustomerLoading(false);
      }
    };

    verifyCustomerToken();
  }, [customerToken]);

  const customerLogin = async (email, password) => {
    try {
      const response = await fetch('/api/customers/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('customer_token', data.token);
      setCustomerToken(data.token);
      setCustomerUser(data.customer);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const customerSignup = async (name, email, phone, password) => {
    try {
      const response = await fetch('/api/customers/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, phone, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('customer_token', data.token);
      setCustomerToken(data.token);
      setCustomerUser(data.customer);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const customerLogout = () => {
    localStorage.removeItem('customer_token');
    setCustomerToken(null);
    setCustomerUser(null);
  };

  const customerAuthFetch = async (url, options = {}) => {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${customerToken}`
    };
    return fetch(url, { ...options, headers });
  };

  return (
    <CustomerAuthContext.Provider value={{ 
      customerToken, 
      customerUser, 
      customerLoading, 
      customerLogin, 
      customerSignup, 
      customerLogout, 
      customerAuthFetch 
    }}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => useContext(CustomerAuthContext);
