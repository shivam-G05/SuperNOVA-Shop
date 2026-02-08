import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { asyncgetproducts } from '../store/actions/productsAction';
import { asyncaddtocart } from '../store/actions/cartAction';
import { asyncgetcartitems } from '../store/actions/cartAction';
import { addReview, getReviews } from '../store/actions/reviewsAction';

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

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  // Review carousel state - changed to 1 review per page for better readability
  const [reviewIndex, setReviewIndex] = useState(0);
  const reviewsPerPage = 1;

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
          
          const cartItem = cartItems?.find(item => item.productId === id);
          const cartQty = cartItem?.quantity || 0;
          setCurrentCartQuantity(cartQty);
          
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
    fetchReviews();
  }, [id]);

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      setReviewError(null);
      const response = await getReviews(id);
      setReviews(response.data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviewError('Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  // Submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setReviewError('Please enter a comment');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError(null);
      
      await addReview(id, Number(rating), comment.trim());
      
      setComment('');
      setRating(5);
      setShowReviewForm(false);
      
      await fetchReviews();
      
      alert('Review submitted successfully!');
    } catch (err) {
      console.error('Error submitting review:', err);
      setReviewError(err.response?.data?.message || 'Failed to submit review');
      alert(err.response?.data?.message || 'Failed to submit review. Please make sure you are logged in.');
    } finally {
      setSubmittingReview(false);
    }
  };

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

  // Star Rating Component
  const StarRating = ({ value, onChange, readOnly = false }) => (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= value ? 'filled' : ''} ${!readOnly ? 'clickable' : ''}`}
          onClick={() => !readOnly && onChange && onChange(star)}
        >
          ★
        </span>
      ))}
    </div>
  );

  // Review Carousel Navigation
  const handleNextReviews = () => {
    if (reviewIndex + reviewsPerPage < reviews.length) {
      setReviewIndex(reviewIndex + reviewsPerPage);
    }
  };

  const handlePrevReviews = () => {
    if (reviewIndex > 0) {
      setReviewIndex(Math.max(0, reviewIndex - reviewsPerPage));
    }
  };

  const visibleReviews = reviews.slice(reviewIndex, reviewIndex + reviewsPerPage);
  const canGoNext = reviewIndex + reviewsPerPage < reviews.length;
  const canGoPrev = reviewIndex > 0;

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

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="product-detail-container">
      <button onClick={() => navigate(-1)} className="back-nav-button">
        ← Back
      </button>

      <div className="product-detail-content">
        {/* LEFT COLUMN - Images and Reviews */}
        <div className="left-column">
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

          {/* Reviews Carousel Section - Below Images */}
          <div className="reviews-carousel-section">
            <div className="reviews-carousel-header">
              <h3>Customer Reviews ({reviews.length})</h3>
              <button 
                className="btn-add-review-small"
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                {showReviewForm ? '✕' : '+'}
              </button>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <div className="review-form-compact">
                {reviewError && (
                  <div className="alert-error">
                    <p>⚠️ {reviewError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmitReview}>
                  <div className="form-group-compact">
                    <label>Rating</label>
                    <StarRating value={rating} onChange={setRating} />
                  </div>

                  <div className="form-group-compact">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts..."
                      rows="4"
                      required
                      disabled={submittingReview}
                    />
                  </div>

                  <button type="submit" disabled={submittingReview} className="submit-btn-compact">
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}

            {/* Reviews Carousel */}
            {reviewsLoading ? (
              <div className="reviews-loading-compact">
                <div className="spinner-small"></div>
                <p>Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="no-reviews-compact">
                <p>No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              <>
                <div className="reviews-grid">
                  {visibleReviews.map((review) => (
                    <div key={review._id} className="review-card-compact">
                      <div className="review-card-header">
                        <StarRating value={review.rating} readOnly />
                        <span className="review-date-compact">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="review-comment-compact">{review.comment}</p>
                    </div>
                  ))}
                </div>

                {/* Carousel Navigation Arrows */}
                {reviews.length > reviewsPerPage && (
                  <div className="carousel-controls">
                    <button
                      className="arrow-btn"
                      onClick={handlePrevReviews}
                      disabled={!canGoPrev}
                      aria-label="Previous review"
                    >
                      ‹
                    </button>
                    <span className="carousel-indicator">
                      {reviewIndex + 1} / {reviews.length}
                    </span>
                    <button
                      className="arrow-btn"
                      onClick={handleNextReviews}
                      disabled={!canGoNext}
                      aria-label="Next review"
                    >
                      ›
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN - Product Info */}
        <div className="product-info-section">
          <div className="product-header">
            <h1 className="product-detail-title">{product.title}</h1>
            <p className="product-category">Category:<span>{product.category}</span></p>

            
            <div className="stock-badge-container">
              <span className={`stock-badge ${isInStock ? 'in-stock' : 'out-of-stock'}`}>
                {isInStock ? '✓' : '✗'} {stockStatus}
              </span>
              {isInStock && product.stock && (
                <span className="stock-count">({product.stock} total available)</span>
              )}
            </div>

            {reviews.length > 0 && (
              <div className="rating-summary">
                <StarRating value={Math.round(averageRating)} readOnly />
                <span className="rating-text">
                  {averageRating} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}
          </div>

          <div className="price-container">
            <span className="price-currency">{product.price?.currency || '$'}</span>
            <span className="price-amount">{product.price?.amount || 'N/A'}</span>
          </div>

          <div className="divider"></div>

          <div className="description-section">
            <h3 className="section-titles">Description</h3>
            <p className="product-full-description">{product.description}</p>
          </div>

          <div className="divider"></div>

          {currentCartQuantity > 0 && (
            <div className="alert-info">
              <p>
                ℹ️ You already have {currentCartQuantity} {currentCartQuantity === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          )}

          {error && (
            <div className="alert-error">
              <p>⚠️ {error}</p>
            </div>
          )}

          {isInStock && canAddToCart && (
            <div className="quantity-section">
              <h3 className="section-title">
                Quantity {availableStock < product.stock && (
                  <span className="stock-remaining">
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

          {isInStock && !canAddToCart && (
            <div className="alert-warning">
              <p>
                You have reached the maximum available stock for this item in your cart.
              </p>
            </div>
          )}

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

          <div className="additional-info">
            <div className="info-items">
              <span className="info-icon">🚚</span>
              <span className="info-text">Free shipping on orders over INR500</span>
            </div>
            <div className="info-items">
              <span className="info-icon">↩️</span>
              <span className="info-text">30-day return policy</span>
            </div>
            <div className="info-items">
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