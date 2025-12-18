import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  asyncgetcartitems,
  asyncupdatecartitems,
} from "../store/actions/cartAction";
import { asyncgetproducts } from "../store/actions/productsAction";
import CheckoutModal from "../components/CheckoutModal";
import "./Cart.css";

const Cart = () => {
  const { user, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItems, setUpdatingItems] = useState({});
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      fetchCartData();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchCartData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [items, products] = await Promise.all([
        asyncgetcartitems(),
        asyncgetproducts(),
      ]);

      if (!items || !products) {
        throw new Error("Failed to fetch data");
      }

      const enrichedCartItems = items
        .map((item) => {
          const product = products.find((p) => p._id === item.productId);
          return {
            ...item,
            product: product || null,
          };
        })
        .filter((item) => item.product !== null); // Filter out items with no product

      setCartItems(enrichedCartItems);
    } catch (err) {
      console.error("Error fetching cart data:", err);
      setError("Failed to load cart items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, productId, newQuantity, stock) => {
    if (newQuantity < 1 || newQuantity > stock) return;

    try {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));

      await asyncupdatecartitems(productId, newQuantity);

      setCartItems((prev) =>
        prev.map((item) =>
          item._id === itemId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } catch (err) {
      console.error("Error updating quantity:", err);
      setError("Failed to update quantity.");
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleIncrement = (item) => {
    const stock = item.product?.stock || 0;
    if (item.quantity < stock) {
      updateQuantity(item._id, item.productId, item.quantity + 1, stock);
    }
  };

  const handleDecrement = (item) => {
    const stock = item.product?.stock || 0;
    if (item.quantity > 1) {
      updateQuantity(item._id, item.productId, item.quantity - 1, stock);
    }
  };

  const calculateCartTotal = () => {
    return cartItems.reduce((total, item) => {
      if (item.product) {
        return total + item.product.price.amount * item.quantity;
      }
      return total;
    }, 0);
  };

  const formatPrice = (amount, currency = "INR") => {
    const symbols = { USD: "$", INR: "₹", EUR: "€" };
    return `${symbols[currency] || currency} ${amount.toFixed(2)}`;
  };

  // Show loading while checking auth
  if (authLoading || loading) {
    return (
      <div className="cart-container">
        <div className="loading">Loading your cart...</div>
      </div>
    );
  }

  // Show auth required message if not logged in
  if (!user) {
    return (
      <div className="cart-container">
        <div className="auth-required">
          <h2>Login Required</h2>
          <p>Please log in or create an account to view your cart</p>
          <div className="auth-buttons">
            <Link to="/login" className="auth-btn login-btn">Login</Link>
            <Link to="/register" className="auth-btn register-btn">Register</Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <h2>Your Cart is Empty</h2>
          <p>Add some products to get started!</p>
          <Link to="/" className="continue-shopping-btn">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        cartTotal={calculateCartTotal()}
      />

      <h1 className="cart-title">Shopping Cart</h1>

      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map((item) => {
            const { product, quantity } = item;
            const stock = product.stock || 0;
            const isUpdating = updatingItems[item._id];
            const imageUrl =
              product.images?.[0]?.url || "/placeholder-image.png";

            return (
              <div key={item._id} className="cart-item">
                <div className="item-image">
                  <img src={imageUrl} alt={product.title} />
                </div>

                <div className="item-details">
                  <h3 className="item-title">{product.title}</h3>
                  <p className="item-price">
                    Price: {formatPrice(product.price.amount, product.price.currency)}
                  </p>

                  <div className="quantity-controls">
                    <button
                      className="qty-btn"
                      onClick={() => handleDecrement(item)}
                      disabled={quantity <= 1 || isUpdating}
                    >
                      −
                    </button>

                    <span className="quantity-display">{quantity}</span>

                    <button
                      className="qty-btn"
                      onClick={() => handleIncrement(item)}
                      disabled={quantity >= stock || isUpdating}
                    >
                      +
                    </button>
                  </div>

                  <p
                    className="stock-info"
                    style={{
                      fontSize: "0.85rem",
                      color: stock <= 5 ? "#e74c3c" : "#7f8c8d",
                    }}
                  >
                    {stock <= 5
                      ? `Only ${stock} left in stock`
                      : `In stock: ${stock}`}
                  </p>
                </div>

                <div className="item-total">
                  <p className="total-label">Total:</p>
                  <p className="total-amount">
                    {formatPrice(product.price.amount * quantity, product.price.currency)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>{formatPrice(calculateCartTotal())}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>{formatPrice(calculateCartTotal())}</span>
          </div>
          <button
            className="checkout-btn"
            onClick={() => setShowCheckoutModal(true)}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;