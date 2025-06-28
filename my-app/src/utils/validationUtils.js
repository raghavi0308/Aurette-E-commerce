/**
 * Utility functions for validation
 */

/**
 * Validates if an image path is valid
 * @param {string} path - The image path to validate
 * @returns {boolean} Whether the path is valid
 */
export const isValidImagePath = (path) => {
  if (!path) return false;
  
  // Check if it's a valid image path (not base64, not empty, not invalid format)
  return path.startsWith('/images/products/') && 
         !path.includes('base64') && 
         !path.includes('9k=') &&
         path.length > 15; // Basic length check for valid filename
}; 