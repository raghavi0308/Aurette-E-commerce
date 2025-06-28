import React, { useState, useEffect } from 'react';
import './AdminForm.css';
import AdminProductCard from './AdminProductCard';

const AdminForm = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    color: '',
    sizes: [],
    stock: '',
    description: '',
    careInstructions: '',
    returnPolicy: '',
    image: null,
    images: []
  });

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products...');
      const response = await fetch('http://localhost:5000/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      console.log('Fetched products:', data);
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSizesChange = (e) => {
    const sizes = e.target.value.split(',').map(size => size.trim());
    setFormData(prev => ({
      ...prev,
      sizes
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'sizes') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key === 'image' && formData[key]) {
          formDataToSend.append(key, formData[key]);
        } else if (key === 'images' && formData[key].length > 0) {
          formData[key].forEach(file => {
            formDataToSend.append('images', file);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Failed to add product');
      }

      // Reset form and refresh products
      setFormData({
        name: '',
        price: '',
        category: '',
        color: '',
        sizes: [],
        stock: '',
        description: '',
        careInstructions: '',
        returnPolicy: '',
        image: null,
        images: []
      });
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (product) => {
    // TODO: Implement edit functionality
    console.log('Edit product:', product);
  };

  const handleDelete = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      // Refresh products after deletion
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-form-section">
        <h2>Add New Product</h2>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="name">Product Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price:</label>
            <input
              type="text"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category:</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="color">Color:</label>
            <input
              type="text"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="sizes">Sizes (comma-separated):</label>
            <input
              type="text"
              id="sizes"
              name="sizes"
              value={formData.sizes.join(', ')}
              onChange={handleSizesChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="stock">Stock:</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="careInstructions">Care Instructions:</label>
            <textarea
              id="careInstructions"
              name="careInstructions"
              value={formData.careInstructions}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="returnPolicy">Return Policy:</label>
            <textarea
              id="returnPolicy"
              name="returnPolicy"
              value={formData.returnPolicy}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Main Image:</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="images">Additional Images:</label>
            <input
              type="file"
              id="images"
              name="images"
              onChange={handleImagesChange}
              accept="image/*"
              multiple
            />
          </div>

          <button type="submit" className="submit-button">Add Product</button>
        </form>
      </div>

      <div className="admin-products-section">
        <h2>Manage Products</h2>
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : error ? (
          <div className="error">Error: {error}</div>
        ) : products.length === 0 ? (
          <div className="no-products">No products found</div>
        ) : (
          <div className="products-list">
            {products.map(product => {
              console.log('Rendering product:', product);
              return (
                <AdminProductCard
                  key={product._id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminForm; 