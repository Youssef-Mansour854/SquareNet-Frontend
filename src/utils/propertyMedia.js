const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://square-net-backend-production.up.railway.app';

export const buildPropertyImageUrl = (imagePath) => {
  if (!imagePath) {
    return '';
  }

  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('data:') ||
    imagePath.startsWith('blob:') ||
    imagePath.startsWith('/')
  ) {
    return imagePath;
  }

  return `${API_BASE_URL}/properties/${imagePath}`;
};

export const normalizePropertyMedia = (property) => {
  if (!property) {
    return property;
  }

  const normalizedImages = Array.isArray(property.images)
    ? property.images.map(buildPropertyImageUrl)
    : [];

  const normalizedMainImage = buildPropertyImageUrl(property.image);

  return {
    ...property,
    image: normalizedMainImage,
    images: normalizedImages,
    gallery: [normalizedMainImage, ...normalizedImages].filter(Boolean),
  };
};

