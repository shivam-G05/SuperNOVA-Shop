import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${product._id}`);
  };

  const formatPrice = (amount, currency = "INR") => {
    const symbols = { USD: "$", INR: "₹", EUR: "€" };
    return `${symbols[currency] || currency} ${amount.toFixed(2)}`;
  };

  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0].url 
    : "/placeholder-image.png";

  return (
    <div className="product-card" onClick={handleCardClick}>
      <div className="product-image">
        <img src={imageUrl} alt={product.title} />
        {product.stock <= 5 && product.stock > 0 && (
          <div className="stock-badge low-stock">Only {product.stock} left!</div>
        )}
        {product.stock === 0 && (
          <div className="stock-badge out-of-stock">Out of Stock</div>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>
        
        <p className="product-description">
          {product.description && product.description.length > 80
            ? `${product.description.substring(0, 80)}...`
            : product.description || "No description available"}
        </p>

        <div className="product-footer">
          <div className="product-price">
            <span className="price-label">Price:</span>
            <span className="price-amount">
              {formatPrice(product.price.amount, product.price.currency)}
            </span>
          </div>

          <button 
            className="view-btn"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${product._id}`);
            }}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;