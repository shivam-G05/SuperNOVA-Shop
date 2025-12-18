import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { asyncgetproducts } from '../store/actions/productsAction';
import { asyncaddtocart } from '../store/actions/cartAction';
import { asyncgetcartitems } from '../store/actions/cartAction';

import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [currentCartQuantity, setCurrentCartQuantity] = useState(0);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProductAndCart = async () => {
      try {
        setLoading(true);
        const [products, cartItems] = await Promise.all([
          asyncgetproducts(),
          asyncgetcartitems()
        ]);
        
        const foundProduct = products.find(p => p._id === id);
        
        if (foundProduct) {
          setProduct(foundProduct);
          
          // Find current quantity in cart for this product
          const cartItem = cartItems?.find(item => item.productId === id);
          const cartQty = cartItem?.quantity || 0;
          setCurrentCartQuantity(cartQty);
          
          // Adjust available quantity selector max based on what's already in cart
          const maxAvailable = foundProduct.stock - cartQty;
          if (maxAvailable <= 0) {
            setQuantity(0);
          } else if (quantity > maxAvailable) {
            setQuantity(maxAvailable);
          }
        } else {
          console.error('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndCart();
  }, [id]);

  const handleQuantityChange = (type) => {
    const availableStock = (product?.stock || 0) - currentCartQuantity;
    
    if (type === 'increment' && quantity < availableStock) {
      setQuantity(quantity + 1);
      setError(null);
    } else if (type === 'increment' && quantity >= availableStock) {
      setError(`Maximum available quantity is ${availableStock} (${currentCartQuantity} already in cart)`);
    } else if (type === 'decrement' && quantity > 1) {
      setQuantity(quantity - 1);
      setError(null);
    }
  };

  const addToCart = async () => {
    const availableStock = (product?.stock || 0) - currentCartQuantity;
    
    // Validate stock before adding
    if (currentCartQuantity >= product.stock) {
      setError(`Cannot add more items. You already have the maximum stock (${product.stock}) in your cart.`);
      return;
    }
    
    if (quantity > availableStock) {
      setError(`Cannot add ${quantity} items. Only ${availableStock} available (${currentCartQuantity} already in cart).`);
      return;
    }

    if (quantity <= 0) {
      setError('Please select a valid quantity');
      return;
    }

    try {
      setAddingToCart(true);
      setError(null);
      await asyncaddtocart(id, quantity);
      navigate('/cart');
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add item to cart. Please try again.');
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-container">
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/')} className="back-button">
          ← Back to Products
        </button>
      </div>
    );
  }

  const stockStatus = product.stock > 0 ? 'In Stock' : 'Out of Stock';
  const isInStock = product.stock > 0;
  const availableStock = product.stock - currentCartQuantity;
  const canAddToCart = availableStock > 0;

  return (
    <div className="product-detail-container">
      <button onClick={() => navigate(-1)} className="back-nav-button">
        ← Back
      </button>

      <div className="product-detail-content">
        {/* Image Gallery Section */}
        <div className="image-gallery">
          <div className="main-image">
            <div className="image-placeholder">
              <img
                src={
                  product.images?.[selectedImage]?.url ||
                  product.images?.[selectedImage]?.thumbnail
                }
                alt={product.title}
                className="main-product-image"
              />
            </div>
          </div>

          <div className="thumbnail-gallery">
            {product.images.map((img, index) => (
              <div
                key={img._id || index}
                className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
              >
                <img
                  src={img.thumbnail || img.url}
                  alt={`${product.title} ${index + 1}`}
                  className="thumbnail-image"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info Section */}
        <div className="product-info-section">
          <div className="product-header">
            <h1 className="product-detail-title">{product.title}</h1>
            
            <div className="stock-badge-container">
              <span className={`stock-badge ${isInStock ? 'in-stock' : 'out-of-stock'}`}>
                {isInStock ? '✓' : '✗'} {stockStatus}
              </span>
              {isInStock && product.stock && (
                <span className="stock-count">({product.stock} total available)</span>
              )}
            </div>
          </div>

          <div className="price-container">
            <span className="price-currency">{product.price?.currency || '$'}</span>
            <span className="price-amount">{product.price?.amount || 'N/A'}</span>
          </div>

          <div className="divider"></div>

          <div className="description-section">
            <h3 className="section-title">Description</h3>
            <p className="product-full-description">{product.description}</p>
          </div>

          <div className="divider"></div>

          {/* Cart Status Alert */}
          {currentCartQuantity > 0 && (
            <div style={{
              padding: '12px',
              backgroundColor: '#e3f2fd',
              borderLeft: '4px solid #2196f3',
              borderRadius: '4px',
              marginBottom: '1rem'
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#1976d2' }}>
                ℹ️ You already have {currentCartQuantity} {currentCartQuantity === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: '#ffebee',
              borderLeft: '4px solid #f44336',
              borderRadius: '4px',
              marginBottom: '1rem'
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#c62828' }}>
                ⚠️ {error}
              </p>
            </div>
          )}

          {/* Quantity Selector */}
          {isInStock && canAddToCart && (
            <div className="quantity-section">
              <h3 className="section-title">
                Quantity {availableStock < product.stock && (
                  <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: 'normal' }}>
                    ({availableStock} remaining)
                  </span>
                )}
              </h3>
              <div className="quantity-selector">
                <button 
                  className="quantity-btn" 
                  onClick={() => handleQuantityChange('decrement')}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="quantity-value">{quantity}</span>
                <button 
                  className="quantity-btn" 
                  onClick={() => handleQuantityChange('increment')}
                  disabled={quantity >= availableStock}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Max Stock Warning */}
          {isInStock && !canAddToCart && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fff3e0',
              borderLeft: '4px solid #ff9800',
              borderRadius: '4px',
              marginBottom: '1rem'
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#e65100' }}>
                You have reached the maximum available stock for this item in your cart.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="add-to-cart-btn" 
              disabled={!isInStock || !canAddToCart || addingToCart}
              onClick={addToCart}
            >
              {addingToCart ? 'Adding...' : 
               !isInStock ? 'Out of Stock' : 
               !canAddToCart ? 'Max Quantity in Cart' : 
               'Add to Cart'}
            </button>
            <button 
              className="buy-now-btn" 
              disabled={!isInStock || !canAddToCart || addingToCart}
              onClick={addToCart}
            >
              {!isInStock ? 'Notify Me' : 
               !canAddToCart ? 'Max Quantity Reached' :
               'Buy Now'}
            </button>
          </div>

          {/* Additional Info */}
          <div className="additional-info">
            <div className="info-item">
              <span className="info-icon">🚚</span>
              <span className="info-text">Free shipping on orders over INR500</span>
            </div>
            <div className="info-item">
              <span className="info-icon">↩️</span>
              <span className="info-text">30-day return policy</span>
            </div>
            <div className="info-item">
              <span className="info-icon">🔒</span>
              <span className="info-text">Secure payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;