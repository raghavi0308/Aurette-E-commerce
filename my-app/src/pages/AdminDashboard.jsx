import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminDashboard.css';
import AdminOrdersView from './AdminOrdersView';

const API_URL = 'http://localhost:5000/api/products';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: '',
    price: '',
    image: null,
    images: [],
    sizes: [],
    color: '',
    model: '',
    description: '',
    careInstructions: '',
    styleTips: '',
    returnPolicy: '',
    GSM: '',
    ratings: 0
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/admin/login');
      return;
    }
    fetchProducts();
  }, [user, loading, navigate]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
      setError('');
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Failed to load products: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInput = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.split(',').map(item => item.trim())
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      // Validate required fields
      if (!formData.name || !formData.slug || !formData.price || !formData.image) {
        throw new Error('Please fill in all required fields');
      }

      // Validate category
      if (!formData.category) {
        throw new Error('Please select a category');
      }

      // Create FormData object for file upload
      const formDataToSend = new FormData();
      
      // Append all text fields
      Object.keys(formData).forEach(key => {
        if (key === 'image') {
          // Handle main image file
          if (formData[key] instanceof File) {
            formDataToSend.append('image', formData[key]);
          }
        } else if (key === 'images') {
          // Handle additional images
          if (Array.isArray(formData[key])) {
            formData[key].forEach(file => {
              if (file instanceof File) {
                formDataToSend.append('images', file);
              }
            });
          }
        } else if (key === 'sizes') {
          // Handle sizes array
          formDataToSend.append('sizes', JSON.stringify(formData[key]));
        } else {
          // Handle other fields
          formDataToSend.append(key, formData[key]);
        }
      });

      // Format price to include "Rs." if not present
      const price = formDataToSend.get('price');
      if (price && !price.startsWith('Rs.')) {
        formDataToSend.set('price', `Rs.${price}`);
      }

      console.log('Submitting product data:', {
        name: formDataToSend.get('name'),
        category: formDataToSend.get('category'),
        price: formDataToSend.get('price'),
        image: formDataToSend.get('image')?.name,
        images: formDataToSend.getAll('images').map(f => f.name)
      });

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to add product' }));
        throw new Error(errorData.message || 'Failed to add product');
      }

      const data = await response.json();
      setSuccess('Product added successfully!');
      
      // Reset form
      setFormData({
        name: '',
        slug: '',
        category: '',
        price: '',
        image: null,
        images: [],
        sizes: [],
        color: '',
        model: '',
        description: '',
        careInstructions: '',
        styleTips: '',
        returnPolicy: '',
        GSM: '',
        ratings: 0
      });

      // Refresh product list
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      setError('Error adding product: ' + error.message);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      category: product.category?.slug || '',
      price: product.price,
      image: product.image,
      images: product.images || [],
      sizes: product.sizes || [],
      color: product.color || '',
      model: product.model || '',
      description: product.description || '',
      careInstructions: product.careInstructions || '',
      styleTips: product.styleTips || '',
      returnPolicy: product.returnPolicy || '',
      GSM: product.GSM || '',
      ratings: product.ratings || 0
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Format image path
      const formatImagePath = (path) => {
        if (!path) return '';
        if (path.startsWith('file:///')) {
          const parts = path.split('/');
          return `/images/products/${parts[parts.length - 1]}`;
        }
        if (path.startsWith('/')) {
          return path;
        }
        if (path.startsWith('http')) {
          return path;
        }
        return `/images/products/${path}`;
      };

      const formattedData = {
        ...formData,
        price: formData.price.startsWith('Rs.') ? formData.price : `Rs.${formData.price}`,
        image: formatImagePath(formData.image),
        images: formData.images
          .map(img => formatImagePath(img))
          .filter(img => img !== ''),
        sizes: formData.sizes.map(size => size.trim()).filter(size => size !== ''),
        category: formData.category
      };

      const response = await fetch(`${API_URL}/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update product' }));
        throw new Error(errorData.message || 'Failed to update product');
      }

      setSuccess('Product updated successfully!');
      setIsEditModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Error updating product: ' + error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`${API_URL}/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete product');
        }

        setSuccess('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        setError('Error deleting product: ' + error.message);
      }
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Product Management Section */}
      <div className="product-management-section">
        <h2>Product Management</h2>
        <div className="product-form-container">
          <h3>Add New Product</h3>
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Slug:</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Category:</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                <option value="shop">Shop</option>
                <option value="tassels">Tassels</option>
                <option value="minime">Minime</option>
                <option value="teeva">Teeva</option>
              </select>
            </div>

            <div className="form-group">
              <label>Price:</label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Rs.XXX"
                required
              />
            </div>

            <div className="form-group">
              <label>Image:</label>
              <input
                type="file"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                required
              />
              {formData.image && (
                <p className="file-name">Selected: {formData.image.name}</p>
              )}
            </div>

            <div className="form-group">
              <label>Additional Images:</label>
              <input
                type="file"
                name="images"
                onChange={handleAdditionalImagesChange}
                accept="image/*"
                multiple
              />
              {formData.images.length > 0 && (
                <p className="file-name">Selected: {formData.images.length} files</p>
              )}
            </div>

            <div className="form-group">
              <label>Sizes (comma-separated):</label>
              <input
                type="text"
                name="sizes"
                value={formData.sizes.join(', ')}
                onChange={handleArrayInput}
                required
              />
            </div>

            <div className="form-group">
              <label>Color:</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Model:</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Description:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Style Tips:</label>
              <textarea
                name="styleTips"
                value={formData.styleTips}
                onChange={handleInputChange}
                placeholder="Enter styling suggestions and tips for the product"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Care Instructions:</label>
              <textarea
                name="careInstructions"
                value={formData.careInstructions}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Return Policy:</label>
              <textarea
                name="returnPolicy"
                value={formData.returnPolicy}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>GSM:</label>
              <input
                type="text"
                name="GSM"
                value={formData.GSM}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Ratings (0-5):</label>
              <input
                type="number"
                name="ratings"
                value={formData.ratings}
                onChange={handleInputChange}
                min="0"
                max="5"
                step="0.1"
              />
            </div>

            <button type="submit" className="submit-button">
              Add Product
            </button>
          </form>
        </div>

        {/* Existing Product List */}
        <div className="product-list-container">
          <h3>Existing Products</h3>
          <div className="product-grid">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="product-details">
                  <h4>{product.name}</h4>
                  <p className="price">{product.price}</p>
                  {/* <p className="category">Category: {product.category?.name || 'Uncategorized'}</p> */}
                  <div className="product-actions">
                    <button 
                      className="edit-button"
                      onClick={() => handleEditProduct(product)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-button"
                      onClick={() => handleDeleteProduct(product._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Orders View */}
      <div className="admin-orders-section">
        <AdminOrdersView />
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Product</h3>
              <button 
                className="close-button"
                onClick={() => setIsEditModalOpen(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateProduct} className="product-form">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Slug:</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category:</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="shop">Shop</option>
                  <option value="tassels">Tassels</option>
                  <option value="minime">Minime</option>
                </select>
              </div>

              <div className="form-group">
                <label>Price:</label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Rs.XXX"
                  required
                />
              </div>

              <div className="form-group">
                <label>Image:</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleImageChange}
                  accept="image/*"
                  required
                />
              </div>

              <div className="form-group">
                <label>Additional Images:</label>
                <input
                  type="file"
                  name="images"
                  onChange={handleAdditionalImagesChange}
                  accept="image/*"
                  multiple
                />
              </div>

              <div className="form-group">
                <label>Sizes (comma-separated):</label>
                <input
                  type="text"
                  name="sizes"
                  value={formData.sizes.join(', ')}
                  onChange={handleArrayInput}
                  required
                />
              </div>

              <div className="form-group">
                <label>Color:</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Model:</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Style Tips:</label>
                <textarea
                  name="styleTips"
                  value={formData.styleTips}
                  onChange={handleInputChange}
                  placeholder="Enter styling suggestions and tips for the product"
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Care Instructions:</label>
                <textarea
                  name="careInstructions"
                  value={formData.careInstructions}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Return Policy:</label>
                <textarea
                  name="returnPolicy"
                  value={formData.returnPolicy}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>GSM:</label>
                <input
                  type="text"
                  name="GSM"
                  value={formData.GSM}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Ratings (0-5):</label>
                <input
                  type="number"
                  name="ratings"
                  value={formData.ratings}
                  onChange={handleInputChange}
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="submit-button">
                  Update Product
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 