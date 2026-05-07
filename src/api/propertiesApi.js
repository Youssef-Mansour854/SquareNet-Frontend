import { normalizePropertyMedia } from '../utils/propertyMedia';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://squarenet-backend-production.up.railway.app';

const getAuthToken = () =>
  sessionStorage.getItem('squareNetAuthToken') || localStorage.getItem('squareNetAuthToken');

const parseResponseBody = async (response) => {
  const responseText = await response.text();
  if (!responseText) return {};
  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Failed to parse API response', error);
    return {};
  }
};

// ─── Properties ───────────────────────────────────────────

export const fetchAllProperties = async (queryString = '') => {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/properties${queryString ? `?${queryString}` : ''}`
  );
  const data = await parseResponseBody(res);
  if (!res.ok) throw new Error(data.message || 'Failed to fetch properties');
  return (data.data || []).map(normalizePropertyMedia);
};

export const fetchPropertyById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/v1/properties/${id}`);
  const data = await parseResponseBody(res);
  if (!res.ok) throw new Error(data.message || 'Property not found');
  return normalizePropertyMedia(data.data);
};

export const createProperty = async (newProperty) => {
  const token = getAuthToken();
  const isFormData = typeof FormData !== 'undefined' && newProperty instanceof FormData;

  const headers = { Authorization: `Bearer ${token}` };
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE_URL}/api/v1/properties`, {
    method: 'POST',
    headers,
    body: isFormData ? newProperty : JSON.stringify(newProperty),
  });

  const data = await parseResponseBody(res);
  if (!res.ok) {
    throw new Error(data.message || data.errors?.[0]?.msg || 'حدث خطأ أثناء نشر العقار');
  }
  return normalizePropertyMedia(data.data);
};

export const updateProperty = async (propertyId, formData) => {
  const token = getAuthToken();
  const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;

  const headers = { Authorization: `Bearer ${token}` };
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE_URL}/api/v1/properties/${propertyId}`, {
    method: 'PUT',
    headers,
    body: isFormData ? formData : JSON.stringify(formData),
  });

  const data = await parseResponseBody(res);
  if (!res.ok) {
    throw new Error(data.message || data.errors?.[0]?.msg || 'تعذر تعديل العقار');
  }
  return normalizePropertyMedia(data.data);
};

export const deletePropertyApi = async (propertyId) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/v1/properties/${propertyId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await parseResponseBody(res);
    throw new Error(data.message || 'تعذر حذف العقار');
  }
  return true;
};

export const fetchMyProperties = async () => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/v1/properties/my-properties`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await parseResponseBody(res);
  if (!res.ok) throw new Error(data.message || 'Failed to fetch my properties');
  return (data.data || []).map(normalizePropertyMedia);
};
