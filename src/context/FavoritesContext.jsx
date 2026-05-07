import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useProperties } from './PropertiesContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://squarenet-backend-production.up.railway.app';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { currentUser, isAuthenticated, token } = useAuth();
  const { incrementPropertyFav, decrementPropertyFav } = useProperties();
  const [favorites, setFavorites] = useState([]);

  const fetchWishlist = async () => {
    if (!isAuthenticated || !token) {
        setFavorites([]);
        return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setFavorites(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch wishlist', err);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [currentUser, token]);


  const addToFavorites = async (property) => {
    if (!isAuthenticated || !token) return false;
    if (isFavorite(property.id || property._id)) return false;

    // optimistic update locally
    incrementPropertyFav(property.id || property._id);
    setFavorites((prevFavorites) => [...prevFavorites, property]);

    try {
      await fetch(`${API_BASE_URL}/api/v1/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ propertyId: (property.id || property._id) })
      });
    } catch (err) {
      console.error(err);
      // rollback could be implemented here
    }
    return true;
  };

  const removeFromFavorites = async (propertyId) => {
    if (!isAuthenticated || !token) return false;
    if (!isFavorite(propertyId)) return false;

    // optimistic update locally
    decrementPropertyFav(propertyId);
    setFavorites((prevFavorites) =>
      prevFavorites.filter((property) => (property.id || property._id) !== propertyId)
    );

    try {
      await fetch(`${API_BASE_URL}/api/v1/wishlist/${propertyId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error(err);
    }
    return true;
  };

  const isFavorite = (propertyId) =>
    favorites.some((property) => (property.id || property._id) === propertyId);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isAuthenticated,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        fetchWishlist
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }

  return context;
};
