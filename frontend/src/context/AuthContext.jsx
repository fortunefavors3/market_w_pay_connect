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
    // Check if user is logged in (from sessionStorage only - not persistent)
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const register = async (userData) => {
    // Mock registration - save to localStorage for account persistence
    const newUser = {
      id: `user_${Date.now()}`,
      email: userData.email,
      phone: userData.phone,
      password: userData.password, // Store hashed in production
      createdAt: new Date().toISOString(),
      shippingAddress: null,
      paymentMethods: [],
      verified: true,
      name: userData.email.split('@')[0],
      avatar: `https://ui-avatars.com/api/?name=${userData.email.split('@')[0]}&background=667eea&color=fff`,
    };
    
    // Save account to localStorage (persistent account data)
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    accounts.push(newUser);
    localStorage.setItem('accounts', JSON.stringify(accounts));
    
    // Set session (not persistent across browser close)
    sessionStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    return { success: true, user: newUser };
  };

  const login = async (phone, password) => {
    // Mock login - check against stored accounts
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const account = accounts.find(acc => acc.phone === phone && acc.password === password);
    
    if (account) {
      // Set session only (cleared on browser close)
      sessionStorage.setItem('user', JSON.stringify(account));
      setUser(account);
      return { success: true, user: account };
    }
    
    return { success: false, error: 'Invalid phone number or password' };
  };

  const logout = () => {
    sessionStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    
    // Update session
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Update persistent account data
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const updatedAccounts = accounts.map(acc => 
      acc.id === updatedUser.id ? updatedUser : acc
    );
    localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
    
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
