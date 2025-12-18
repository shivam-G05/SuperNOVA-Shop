import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './SellProducts.css';
import {
  asyncgetSellerProducts,
  asynccreateProduct,
  asyncupdateProduct,
  asyncdeleteProduct
} from '../store/actions/productsAction';


const SellProducts = () => {
  const { user } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priceAmount: '',
    priceCurrency: 'INR',
    stock: '0',
    images: []
  });

  const [imagePreview, setImagePreview] = useState([]);
  
  const fetchProducts = async () => {
  setLoading(true);
  try {
    const data = await asyncgetSellerProducts();
    setProducts(data || []);
  } catch (err) {
    console.log(err);
    setProducts([]);
  }
  setLoading(false);
  };


  useEffect(() => {
    if (user?.role === 'seller') {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [user]);

  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 4) {
      alert('You can upload a maximum of 4 images only');
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: files
    }));

    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.priceAmount) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.stock < 0) {
      alert('Stock cannot be negative');
      return;
    }

    setIsSubmitting(true);

    try {
  if (editingProduct) {
    await asyncupdateProduct(editingProduct._id, formData);
  } else {
    await asynccreateProduct(formData);
  }

  resetForm();
  setShowModal(false);
  fetchProducts();
} catch (err) {
  alert('Something went wrong. Please try again.');
  console.log(err);
}


    setIsSubmitting(false);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      priceAmount: product.price.amount,
      priceCurrency: product.price.currency,
      stock: product.stock || 0,
      images: []
    });
    setImagePreview([]);
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
  await asyncdeleteProduct(productId);
  fetchProducts();
} catch (err) {
  alert('Failed to delete product');
  console.log(err);
}

  };

  const openCreateModal = () => {
    setEditingProduct(null);
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priceAmount: '',
      priceCurrency: 'INR',
      stock: '0',
      images: []
    });
    setImagePreview([]);
  };

  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (user?.role !== 'seller') {
    return (
      <div className="sell-products-container">
        <div className="access-denied">
          <div className="access-denied-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2>Access Denied</h2>
          <p>Only sellers can access this page.</p>
          <p className="access-denied-hint">Please register as a seller to list and manage products.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="sell-products-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sell-products-container">
      <div className="sell-products-header">
        <div className="header-content">
          <h1>My Products</h1>
          <p className="header-subtitle">Manage your product listings</p>
        </div>
        <button className="create-product-btn" onClick={openCreateModal}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </div>
          <h3>No Products Available</h3>
          <p>Start adding products to grow your business</p>
          <button className="empty-state-btn" onClick={openCreateModal}>
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <div key={product._id} className="product-card">
              <div className="product-image-container">
                {product.images && product.images.length > 0 && product.images[0] ? (
                  <img 
                    src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url} 
                    alt={product.title}
                    onError={(e) => {
                      console.error('Image failed to load:', product.images[0]);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="product-image-placeholder" style={{display: product.images && product.images.length > 0 ? 'none' : 'flex'}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              </div>
              
              <div className="product-details">
                <h3 className="product-title">{product.title}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-price">
                  {formatCurrency(product.price.amount, product.price.currency)}
                </div>
                <div className="product-stock">
                  <span className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>

              <div className="product-actions">
                <button 
                  className="action-btn edit-btn"
                  onClick={() => handleEdit(product)}
                  title="Edit Product"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
                <button 
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(product._id)}
                  title="Delete Product"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="modal-close" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-group">
                <label htmlFor="title">Product Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter product title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priceAmount">Price *</label>
                  <input
                    type="number"
                    id="priceAmount"
                    name="priceAmount"
                    value={formData.priceAmount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="priceCurrency">Currency</label>
                  <select
                    id="priceCurrency"
                    name="priceCurrency"
                    value={formData.priceCurrency}
                    onChange={handleInputChange}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="stock">Stock Quantity *</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  required
                />
                <small style={{color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block'}}>
                  Enter the number of units available in stock
                </small>
              </div>

              {editingProduct && editingProduct.images && editingProduct.images.length > 0 && (
                <div className="form-group">
                  <label>Current Product Images</label>
                  <div className="image-preview-container">
                    {editingProduct.images.map((image, index) => (
                      <div key={index} className="image-preview">
                        <img 
                          src={typeof image === 'string' ? image : image.url} 
                          alt={`Product ${index + 1}`} 
                        />
                      </div>
                    ))}
                  </div>
                  <p style={{fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem'}}>
                    Note: Image updates are not supported in edit mode. To change images, you'll need to delete and recreate the product.
                  </p>
                </div>
              )}

              {!editingProduct && (
                <div className="form-group">
                  <label htmlFor="images">Product Images (Max 4)</label>
                  <input
                    type="file"
                    id="images"
                    name="images"
                    onChange={handleImageChange}
                    accept="image/*"
                    multiple
                    className="file-input"
                  />
                  <label htmlFor="images" className="file-input-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    {formData.images.length > 0 
                      ? `${formData.images.length} image(s) selected` 
                      : 'Click to upload images'}
                  </label>
                </div>
              )}

              {!editingProduct && imagePreview.length > 0 && (
                <div className="image-preview-container">
                  {imagePreview.map((preview, index) => (
                    <div key={index} className="image-preview">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting 
                    ? 'Saving...' 
                    : editingProduct 
                      ? 'Update Product' 
                      : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellProducts;