const fs = require('fs');
const path = require('path');

// Read the mapping file
const mappingPath = path.join(__dirname, 'cloudinaryMapping.json');
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

// Read the products file
const productsPath = path.join(__dirname, '../../my-app/src/data/products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// Function to get filename from path
function getFilenameFromPath(path) {
    return path.split('/').pop();
}

// Function to get Cloudinary URL from mapping
function getCloudinaryUrl(localPath) {
    const filename = getFilenameFromPath(localPath);
    return mapping[filename] || localPath;
}

// Update products with Cloudinary URLs
const updatedProducts = products.map(product => {
    // Update main image
    if (product.image) {
        product.image = getCloudinaryUrl(product.image);
    }

    // Update images array
    if (product.images && Array.isArray(product.images)) {
        product.images = product.images.map(img => getCloudinaryUrl(img));
    }

    return product;
});

// Write updated products back to file
fs.writeFileSync(productsPath, JSON.stringify(updatedProducts, null, 2), 'utf8');

console.log('Products.json has been updated with Cloudinary URLs'); 