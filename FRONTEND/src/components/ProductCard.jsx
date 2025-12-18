import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { title, description, price, _id,images } = product;
  const descRef = useRef();
  const [isOverflow, setIsOverflow] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      const el = descRef.current;
      if (el) {
        // Check if content is being clamped (overflow due to line-clamp)
        setIsOverflow(el.scrollHeight > el.clientHeight);
      }
    };

    checkOverflow();
    
    // Recheck on window resize
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [description]);

  return (
    <div className="product-card">
      <div className="product-image-placeholder">
        <img
        src={images?.[0]?.thumbnail || images?.[0]?.url}
        
        loading='lazy'/>
      </div>
      
      <div className="product-info">
        <h3 className="product-title">{title}</h3>
        <p className="product-description" ref={descRef}>
          {description}
        </p>
        {isOverflow && (
          <Link to={`/product/${_id}`} className="know-more-link">
            ...Know More →
          </Link>
        )}
        
        <div className="product-footer">
          <div className="price-section">
            <span className="currency">{price?.currency || '$'}</span>
            <span className="amount">{price?.amount || 'N/A'}</span>
          </div>
          <Link to={`/product/${_id}`} className="know-more-link">
          <button className="buy-button">
            Buy Now
          </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;