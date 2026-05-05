import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAllProperties,
  createProperty,
  updateProperty,
  deletePropertyApi,
} from '../api/propertiesApi';

const PropertiesContext = createContext();
const VIEWS_STORAGE_KEY = 'squareNetPropertyViewsV2';
const FAVS_STORAGE_KEY = 'squareNetPropertyFavsV2';

const getPropertyOwnerId = (property) => {
  if (!property) return null;
  if (typeof property.ownerId === 'string') return property.ownerId;
  return property.ownerId?._id || property.ownerId?.id || null;
};

export const PropertiesProvider = ({ children }) => {
  const queryClient = useQueryClient();

  // ─── React Query: fetch all properties ───
  const {
    data: properties = [],
    refetch: refetchProperties,
  } = useQuery({
    queryKey: ['properties'],
    queryFn: () => fetchAllProperties(),
    staleTime: 1000 * 60 * 5,     // 5 minutes cache
    refetchOnWindowFocus: false,
  });

  // ─── Local stats (views / favs) ───
  const [propertyViews, setPropertyViews] = useState({});
  const [propertyFavsCount, setPropertyFavsCount] = useState({});

  useEffect(() => {
    try {
      const storedViews = localStorage.getItem(VIEWS_STORAGE_KEY);
      if (storedViews) setPropertyViews(JSON.parse(storedViews));

      const storedFavs = localStorage.getItem(FAVS_STORAGE_KEY);
      if (storedFavs) setPropertyFavsCount(JSON.parse(storedFavs));
    } catch (error) {
      console.error('Failed to load local stats:', error);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(propertyViews).length > 0) {
      localStorage.setItem(VIEWS_STORAGE_KEY, JSON.stringify(propertyViews));
    }
  }, [propertyViews]);

  useEffect(() => {
    if (Object.keys(propertyFavsCount).length > 0) {
      localStorage.setItem(FAVS_STORAGE_KEY, JSON.stringify(propertyFavsCount));
    }
  }, [propertyFavsCount]);

  const incrementPropertyView = useCallback((id) => {
    setPropertyViews((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }, []);

  const resetPropertyViews = useCallback(() => {
    localStorage.removeItem(VIEWS_STORAGE_KEY);
    setPropertyViews({});
  }, []);

  const incrementPropertyFav = useCallback((id) => {
    setPropertyFavsCount((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }, []);

  const decrementPropertyFav = useCallback((id) => {
    setPropertyFavsCount((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
  }, []);

  // ─── fetchProperties (backward-compatible wrapper) ───
  const fetchProperties = useCallback(
    async (queryString = '') => {
      if (queryString) {
        // When there's a query string, fetch with that specific filter
        try {
          const data = await fetchAllProperties(queryString);
          // Update the cache with the filtered results
          queryClient.setQueryData(['properties'], data);
        } catch (err) {
          console.error('Failed to fetch properties', err);
        }
      } else {
        // Just refetch the default query
        refetchProperties();
      }
    },
    [queryClient, refetchProperties]
  );

  // ─── Mutations ───

  const addMutation = useMutation({
    mutationFn: createProperty,
    onSuccess: (newProperty) => {
      queryClient.setQueryData(['properties'], (old = []) => [newProperty, ...old]);
    },
  });

  const addProperty = useCallback(
    async (newProperty) => {
      try {
        const result = await addMutation.mutateAsync(newProperty);
        return { ok: true, property: result };
      } catch (err) {
        return { ok: false, message: err.message || 'حدث خطأ أثناء نشر العقار' };
      }
    },
    [addMutation]
  );

  const deleteMutation = useMutation({
    mutationFn: deletePropertyApi,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['properties'], (old = []) =>
        old.filter((p) => p.id !== deletedId && p._id !== deletedId)
      );
    },
  });

  const deleteProperty = useCallback(
    async (propertyId) => {
      try {
        await deleteMutation.mutateAsync(propertyId);
        return { ok: true };
      } catch (err) {
        return { ok: false, message: err.message || 'تعذر حذف العقار' };
      }
    },
    [deleteMutation]
  );

  const updateMutation = useMutation({
    mutationFn: ({ propertyId, formData }) => updateProperty(propertyId, formData),
    onSuccess: (updatedProperty) => {
      queryClient.setQueryData(['properties'], (old = []) =>
        old.map((p) =>
          p.id === updatedProperty.id || p._id === updatedProperty._id ? updatedProperty : p
        )
      );
    },
  });

  const updatePropertyStatus = useCallback(
    async (propertyId, status) => {
      try {
        const result = await updateMutation.mutateAsync({
          propertyId,
          formData: { status },
        });
        return { ok: true, property: result };
      } catch (err) {
        return { ok: false, message: err.message || 'تعذر تحديث الحالة' };
      }
    },
    [updateMutation]
  );

  const editProperty = useCallback(
    async (propertyId, formData) => {
      try {
        const result = await updateMutation.mutateAsync({ propertyId, formData });
        return { ok: true, property: result };
      } catch (err) {
        return { ok: false, message: err.message || 'تعذر تعديل العقار' };
      }
    },
    [updateMutation]
  );

  // ─── Derived helpers ───

  const getPropertiesByOwnerId = useCallback(
    (ownerId) => properties.filter((property) => getPropertyOwnerId(property) === ownerId),
    [properties]
  );

  // ─── Context value ───

  const value = useMemo(
    () => ({
      properties,
      propertyViews,
      propertyFavsCount,
      fetchProperties,
      addProperty,
      getPropertiesByOwnerId,
      incrementPropertyView,
      resetPropertyViews,
      incrementPropertyFav,
      decrementPropertyFav,
      deleteProperty,
      updatePropertyStatus,
      editProperty,
    }),
    [
      properties,
      propertyViews,
      propertyFavsCount,
      fetchProperties,
      addProperty,
      getPropertiesByOwnerId,
      incrementPropertyView,
      resetPropertyViews,
      incrementPropertyFav,
      decrementPropertyFav,
      deleteProperty,
      updatePropertyStatus,
      editProperty,
    ]
  );

  return (
    <PropertiesContext.Provider value={value}>
      {children}
    </PropertiesContext.Provider>
  );
};

export const useProperties = () => {
  const context = useContext(PropertiesContext);
  if (!context) {
    throw new Error('useProperties must be used within a PropertiesProvider');
  }
  return context;
};
