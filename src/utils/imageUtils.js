/**
 * Convierte una ruta relativa de imagen a una URL completa
 * @param {string} imagePath - Ruta relativa o URL completa
 * @returns {string} URL completa de la imagen
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // Si ya es una URL completa, retornarla tal cual
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Si es una ruta relativa que empieza con /storage, convertirla a URL completa
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const baseUrl = apiUrl.replace('/api', ''); // Remover /api del final

  // Si empieza con /storage, usar directamente
  if (imagePath.startsWith('/storage/')) {
    return `${baseUrl}${imagePath}`;
  }

  // Si no empieza con /, agregar /storage/
  if (!imagePath.startsWith('/')) {
    return `${baseUrl}/storage/${imagePath}`;
  }

  // Si empieza con / pero no es /storage, agregar /storage
  return `${baseUrl}/storage${imagePath}`;
};

