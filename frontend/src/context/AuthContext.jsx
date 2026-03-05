import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Generate a simple session token
const generateSessionToken = () => {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

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
  const [sessionToken, setSessionToken] = useState(null);

  useEffect(() => {
    // Check if user is logged in from localStorage (persistent across redirects)
    const storedSession = localStorage.getItem('effinsure_session');
    const storedToken = localStorage.getItem('effinsure_session_token');
    
    if (storedSession && storedToken) {
      try {
        const sessionData = JSON.parse(storedSession);
        // Verify the session token matches
        if (sessionData.sessionToken === storedToken) {
          setUser(sessionData.user);
          setSessionToken(storedToken);
        } else {
          // Invalid session, clear it
          localStorage.removeItem('effinsure_session');
          localStorage.removeItem('effinsure_session_token');
        }
      } catch (e) {
        console.error('Failed to parse session:', e);
        localStorage.removeItem('effinsure_session');
        localStorage.removeItem('effinsure_session_token');
      }
    }
    setIsLoading(false);
  }, []);

  const createSession = (userData) => {
    const token = generateSessionToken();
    const sessionData = {
      user: userData,
      sessionToken: token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };
    
    localStorage.setItem('effinsure_session', JSON.stringify(sessionData));
    localStorage.setItem('effinsure_session_token', token);
    setSessionToken(token);
    setUser(userData);
    
    return token;
  };

  const register = async (userData) => {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
    
    // Check for blocked identifiers (fraud prevention)
    try {
      const fraudCheckResponse = await fetch(`${BACKEND_URL}/api/fraud-prevention/check-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: userData.phone,
          email: userData.email
        })
      });
      
      const fraudCheck = await fraudCheckResponse.json();
      
      if (!fraudCheck.can_register) {
        return { 
          success: false, 
          error: fraudCheck.message || 'This phone number or email is associated with an account that has unpaid platform fees. Please resolve the outstanding balance before creating a new account.',
          blocked: true
        };
      }
    } catch (error) {
      console.error('Fraud check failed:', error);
      // Continue with registration if fraud check fails (fail open for UX)
    }
    
    // Check if account already exists locally
    const accounts = JSON.parse(localStorage.getItem('effinsure_accounts') || '[]');
    const existingAccount = accounts.find(acc => acc.phone === userData.phone || acc.email === userData.email);
    
    if (existingAccount) {
      return { success: false, error: 'An account with this phone or email already exists' };
    }
    
    const newUser = {
      id: `user_${Date.now()}`,
      email: userData.email,
      phone: userData.phone,
      password: userData.password, // In production, hash this!
      createdAt: new Date().toISOString(),
      shippingAddress: null,
      paymentMethods: [],
      verified: true,
      name: userData.email.split('@')[0],
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.email.split('@')[0])}&background=667eea&color=fff`,
    };
    
    // Save account to localStorage (persistent account data)
    accounts.push(newUser);
    localStorage.setItem('effinsure_accounts', JSON.stringify(accounts));
    
    // Create persistent session
    createSession(newUser);
    
    return { success: true, user: newUser };
  };

  const login = async (phone, password) => {
    // Check against stored accounts
    const accounts = JSON.parse(localStorage.getItem('effinsure_accounts') || '[]');
    const account = accounts.find(acc => acc.phone === phone && acc.password === password);
    
    if (account) {
      // Create persistent session
      createSession(account);
      return { success: true, user: account };
    }
    
    return { success: false, error: 'Invalid phone number or password' };
  };

  const logout = () => {
    localStorage.removeItem('effinsure_session');
    localStorage.removeItem('effinsure_session_token');
    setSessionToken(null);
    setUser(null);
  };

  const updateUser = (updates) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    
    // Update session
    const storedSession = localStorage.getItem('effinsure_session');
    if (storedSession) {
      const sessionData = JSON.parse(storedSession);
      sessionData.user = updatedUser;
      localStorage.setItem('effinsure_session', JSON.stringify(sessionData));
    }
    
    // Update persistent account data
    const accounts = JSON.parse(localStorage.getItem('effinsure_accounts') || '[]');
    const updatedAccounts = accounts.map(acc => 
      acc.id === updatedUser.id ? updatedUser : acc
    );
    localStorage.setItem('effinsure_accounts', JSON.stringify(updatedAccounts));
    
    setUser(updatedUser);
  };

  const saveShippingAddress = (address) => {
    updateUser({ shippingAddress: address });
  };

  const savePaymentMethod = (paymentMethod) => {
    const paymentMethods = user?.paymentMethods || [];
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

  // Check if the current user can access a specific user's data
  const canAccessUser = (targetUserId) => {
    if (!user || !sessionToken) return false;
    return user.id === targetUserId;
  };

  // Verify the session is still valid
  const isSessionValid = () => {
    const storedSession = localStorage.getItem('effinsure_session');
    const storedToken = localStorage.getItem('effinsure_session_token');
    
    if (!storedSession || !storedToken) return false;
    
    try {
      const sessionData = JSON.parse(storedSession);
      // Check token matches
      if (sessionData.sessionToken !== storedToken) return false;
      // Check not expired
      if (new Date(sessionData.expiresAt) < new Date()) {
        logout();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user && !!sessionToken,
    sessionToken,
    register,
    login,
    logout,
    updateUser,
    saveShippingAddress,
    savePaymentMethod,
    canAccessUser,
    isSessionValid,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
