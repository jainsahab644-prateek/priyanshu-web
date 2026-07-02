import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('bani_thani_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        setCartItems([]);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('bani_thani_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (saree, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item._id === saree._id);
      if (existing) {
        return prev.map(item =>
          item._id === saree._id
            ? { ...item, quantity: Math.min(item.stockQty || 99, item.quantity + quantity) }
            : item
        );
      }
      return [
        ...prev,
        {
          _id: saree._id,
          name: saree.name,
          sku: saree.sku,
          price: saree.price,
          discountPrice: saree.discountPrice,
          image: saree.images && saree.images.length > 0 ? saree.images[0] : '',
          stockQty: saree.stockQty,
          quantity
        }
      ];
    });
  };

  const removeFromCart = (sareeId) => {
    setCartItems(prev => prev.filter(item => item._id !== sareeId));
  };

  const updateQuantity = (sareeId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(sareeId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item._id === sareeId
          ? { ...item, quantity: Math.min(item.stockQty || 99, quantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const cartTotal = cartItems.reduce((acc, item) => {
    const activePrice = item.discountPrice ? item.discountPrice : item.price;
    return acc + activePrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
