import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const register = async (userData) => {
    // Mock registration
    const newUser = {
      id: `user_${Date.now()}`,
      email: userData.email,
      phone: userData.phone,
      createdAt: new Date().toISOString(),
      shippingAddress: null,
      paymentMethods: [],
      verified: true,
      name: userData.email.split('@')[0],
      avatar: `https://ui-avatars.com/api/?name=${userData.email.split('@')[0]}&background=667eea&color=fff`,
    };
    
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    return { success: true, user: newUser };
  };

  const login = async (email, password) => {
    // Mock login
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.email === email) {
        setUser(user);
        return { success: true, user };
      }
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const saveShippingAddress = (address) => {
    updateUser({ shippingAddress: address });
  };

  const savePaymentMethod = (paymentMethod) => {
    const paymentMethods = user.paymentMethods || [];
    // Only save masked version
    const maskedPayment = {
      id: `pm_${Date.now()}`,
      last4: paymentMethod.cardNumber.slice(-4),
      brand: 'visa', // Would detect from card number
      expiryMonth: paymentMethod.expiryDate.split('/')[0],
      expiryYear: paymentMethod.expiryDate.split('/')[1],
    };
    paymentMethods.push(maskedPayment);
    updateUser({ paymentMethods });
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateUser,
    saveShippingAddress,
    savePaymentMethod,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
