import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { toast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const WatchlistContext = createContext(null);

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};

export const WatchlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch watchlist when user logs in
  const fetchWatchlist = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setWatchlist([]);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/users/${user.id}/watchlist`);
      setWatchlist(response.data.watchlist || []);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  // Check if a product is in watchlist
  const isInWatchlist = useCallback((productId) => {
    return watchlist.includes(productId);
  }, [watchlist]);

  // Toggle product in watchlist
  const toggleWatchlist = useCallback(async (productId, productTitle = 'Item') => {
    if (!isAuthenticated || !user?.id) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save items to your watchlist.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/users/${user.id}/watchlist/${productId}/toggle`
      );

      if (response.data.success) {
        if (response.data.in_watchlist) {
          setWatchlist(prev => [...prev, productId]);
          toast({
            title: "Added to Watchlist",
            description: `${productTitle} has been saved to your watchlist.`,
          });
        } else {
          setWatchlist(prev => prev.filter(id => id !== productId));
          toast({
            title: "Removed from Watchlist",
            description: `${productTitle} has been removed from your watchlist.`,
          });
        }
        return response.data.in_watchlist;
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to update watchlist. Please try again.",
        variant: "destructive"
      });
    }
    return null;
  }, [isAuthenticated, user?.id]);

  // Add to watchlist
  const addToWatchlist = useCallback(async (productId, productTitle = 'Item') => {
    if (!isAuthenticated || !user?.id) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save items to your watchlist.",
        variant: "destructive"
      });
      return false;
    }

    if (isInWatchlist(productId)) {
      return true; // Already in watchlist
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/users/${user.id}/watchlist/${productId}`
      );

      if (response.data.success) {
        setWatchlist(prev => [...prev, productId]);
        toast({
          title: "Added to Watchlist",
          description: `${productTitle} has been saved to your watchlist.`,
        });
        return true;
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to add to watchlist. Please try again.",
        variant: "destructive"
      });
    }
    return false;
  }, [isAuthenticated, user?.id, isInWatchlist]);

  // Remove from watchlist
  const removeFromWatchlist = useCallback(async (productId, productTitle = 'Item') => {
    if (!isAuthenticated || !user?.id) {
      return false;
    }

    try {
      const response = await axios.delete(
        `${BACKEND_URL}/api/users/${user.id}/watchlist/${productId}`
      );

      if (response.data.success) {
        setWatchlist(prev => prev.filter(id => id !== productId));
        toast({
          title: "Removed from Watchlist",
          description: `${productTitle} has been removed from your watchlist.`,
        });
        return true;
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove from watchlist. Please try again.",
        variant: "destructive"
      });
    }
    return false;
  }, [isAuthenticated, user?.id]);

  const value = {
    watchlist,
    loading,
    isInWatchlist,
    toggleWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    refreshWatchlist: fetchWatchlist,
    watchlistCount: watchlist.length
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
};

export default WatchlistContext;
