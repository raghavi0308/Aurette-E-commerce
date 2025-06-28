/**
 * Utility functions for handling image URLs
 */

/**
 * Processes and returns the correct image URL
 * @param {string} imagePath - The original image path
 * @returns {string} The processed image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-image.jpg';
  
  // If it's already a full URL (Cloudinary or other external URL), return as is
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('data:')) return imagePath;
  
  // If it starts with a forward slash, it's already a relative path
  if (imagePath.startsWith('/')) {
    // Convert .jpg to .webp in the path
    return imagePath.replace(/\.(jpg|jpeg|png)$/, '.webp');
  }
  
  // Handle local file paths
  if (imagePath.includes('\\') || imagePath.includes('/')) {
    // Extract just the filename from the path
    const filename = imagePath.split(/[\\/]/).pop()
      .replace(/\(1\)/, '')
      .replace(/\.\.\./g, '')
      .replace(/twirl/g, 'twril')
      .replace(/\.(jpg|jpeg|png)$/, '.webp');
    return `/images/products/${filename}`;
  }
  
  // If it's just a filename, assume it's in the products directory
  const webpFilename = imagePath.replace(/\.(jpg|jpeg|png)$/, '.webp');
  return `/images/products/${webpFilename}`;
}; 