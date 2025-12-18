import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { asyncgetmyorders } from "../store/actions/orderAction";
import "./Orders.css";

const Orders = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchOrders();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchOrders = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await asyncgetmyorders();

    const ordersArray = Array.isArray(response)
      ? response
      : response?.orders || response?.data || [];

    // 🔽 SORT: latest orders first
    const sortedOrders = [...ordersArray].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    setOrders(sortedOrders);
  } catch (err) {
    setError("Failed to load orders");
    console.error(err);
  } finally {
    setLoading(false);
  }
};



  const getStatusColor = (status) => {
    const colors = {
      PENDING: "#ff9800",
      CONFIRMED: "#2196f3",
      SHIPPED: "#9c27b0",
      DELIVERED: "#4caf50",
      CANCELLED: "#f44336",
    };
    return colors[status] || "#757575";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (amount, currency = "INR") => {
    const symbols = { USD: "$", INR: "₹", EUR: "€" };
    return `${symbols[currency] || currency} ${amount.toFixed(2)}`;
  };

  // Show loading while checking auth
  if (authLoading || loading) {
    return (
      <div className="orders-container">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  // Show auth required message if not logged in
  if (!user) {
    return (
      <div className="orders-container">
        <div className="auth-required">
          {/* <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '64px', height: '64px', marginBottom: '1rem', color: '#3b82f6' }}>
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
          </svg> */}
          <h2>Login Required</h2>
          <p>Please log in or create an account to view your orders</p>
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
      <div className="orders-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (orders.length === 0) {  
    return (
      <div className="orders-container">
        <div className="empty-orders">
          <h2>No Orders Yet</h2>
          <p>Start shopping to see your orders here!</p>
          <Link to="/" className="continue-shopping-btn">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h1 className="orders-title">My Orders</h1>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <p className="order-id">Order #{order._id.slice(-8)}</p>
                <p className="order-date">{formatDate(order.createdAt)}</p>
              </div>
              <div
                className="order-status"
                style={{ backgroundColor: getStatusColor(order.status) }}
              >
                {order.status}
              </div>
            </div>

            <div className="order-details">
              <div className="order-items-count">
                <span>{order.items.length} item(s)</span>
              </div>
              <div className="order-total">
                <span className="total-label">Total:</span>
                <span className="total-amount">
                  {formatPrice(order.totalPrice.amount, order.totalPrice.currency)}
                </span>
              </div>
            </div>

            <div className="order-actions">
              <button
                className="view-details-btn"
                onClick={() => navigate(`/order/${order._id}`)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;