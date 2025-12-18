import React, { useState, useEffect } from 'react';
import './SellerDashboard.css';
import { asyncgetusers } from '../store/actions/userAction';
import {
  asyncgetSellerMetrics,
  asyncgetSellerOrders,
  asyncgetSellerDashboardProducts
} from '../store/actions/seller';



const SellerDashboard = () => {
  ;

  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch user data
  const checkUser = async () => {
    try {
      const res = await asyncgetusers();
      console.log('User data:', res);
      setUser(res);
    } catch (err) {
      console.error('Error fetching user:', err);
      setLoading(false);
    }
  };

  // Initial user fetch
  useEffect(() => {
    checkUser();
  }, []);

  // Fetch dashboard data when user is loaded
  useEffect(() => {
    if (user) {
      console.log('User role:', user.role);
      if (user.role === 'seller') {
        fetchDashboardData();
      } else {
        setLoading(false);
      }
    }
  }, [user]);

  const fetchDashboardData = async () => {
  try {
    setLoading(true);

    const [metricsData, ordersData, productsData] = await Promise.all([
      asyncgetSellerMetrics(),
      asyncgetSellerOrders(),
      asyncgetSellerDashboardProducts(),
    ]);

    setMetrics(metricsData || { sales: 0, revenue: 0, topProducts: [] });
    setOrders(ordersData || []);
    setProducts(productsData || []);

  } catch (err) {
    console.error('Error fetching dashboard data:', err);

    setMetrics({ sales: 0, revenue: 0, topProducts: [] });
    setOrders([]);
    setProducts([]);

  } finally {
    setLoading(false);
  }
};


  // Show loading while checking user
  if (user === null) {
    return (
      <div className="seller-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not a seller
  if (user?.role !== 'seller') {
    return (
      <div className="seller-dashboard">
        <div className="access-denied">
          <div className="access-denied-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2>Access Denied</h2>
          <p>Only sellers can access this dashboard.</p>
          <p className="access-denied-hint">Please register as a seller to list and manage products.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="seller-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'CONFIRMED': 'status-confirmed',
      'SHIPPED': 'status-shipped',
      'DELIVERED': 'status-delivered',
      'CANCELLED': 'status-cancelled',
      'PENDING': 'status-pending'
    };
    return colors[status] || 'status-default';
  };

  return (
    <div className="seller-dashboard">
      <div className="dashboard-header">
        <h1>Seller Dashboard</h1>
        <p className="welcome-text">Welcome back, Mr. {user.fullName?.firstName || user.name}!</p>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon sales-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="metric-content">
              <h3>Total Sales</h3>
              <p className="metric-value">{metrics.sales || 0}</p>
              <span className="metric-label">Units Sold</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon revenue-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="metric-content">
              <h3>Total Revenue</h3>
              <p className="metric-value">{formatCurrency(metrics.revenue || 0)}</p>
              <span className="metric-label">Total Earnings</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon products-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </div>
            <div className="metric-content">
              <h3>Products</h3>
              <p className="metric-value">{products.length}</p>
              <span className="metric-label">Total Listed</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon orders-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="metric-content">
              <h3>Orders</h3>
              <p className="metric-value">{orders.length}</p>
              <span className="metric-label">Total Orders</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Products */}
      {metrics?.topProducts && metrics.topProducts.length > 0 && (
        <div className="top-products-section">
          <h2>Top Products</h2>
          <div className="top-products-list">
            {metrics.topProducts.map((product, index) => (
              <div key={product.id} className="top-product-item">
                <span className="product-rank">#{index + 1}</span>
                <div className="product-info">
                  <h4>{product.title}</h4>
                  <span className="product-sales">{product.sold} units sold</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders ({orders.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products ({products.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <h2>Recent Activity</h2>
            <p className="overview-text">
              You have {orders.length} total orders and {products.length} products listed.
              Check the Orders and Products tabs for detailed information.
            </p>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-content">
            {orders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <h3>No Orders Yet</h3>
                <p>Orders will appear here once customers start purchasing your products</p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order._id} className="order-card">
                    <div className="order-header">
                      <div>
                        <h3>Order #{order._id.slice(-8)}</h3>
                        <p className="order-date">{formatDate(order.createdAt)}</p>
                      </div>
                      <span className={`order-status ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="order-customer">
                      <strong>Customer:</strong> {order.user?.name || 'N/A'}
                    </div>
                    <div className="order-items">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item">
                          <span>Quantity: {item.quantity}</span>
                          <span>{formatCurrency(item.price.amount * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="products-content">
            {products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                </div>
                <h3>No Products Listed</h3>
                <p>Start adding products to see them here</p>
              </div>
            ) : (
              <div className="products-grid">
                {products.map((product) => (
                  <div key={product._id} className="product-card">
                    {product.images && product.images.length > 0 && (
                      <div className="product-image">
                        <img 
                          src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url} 
                          alt={product.title}
                          onError={(e) => {
                            console.error('Image failed to load:', product.images[0]);
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="product-details">
                      <h3>{product.title}</h3>
                      <p className="product-price">{formatCurrency(product.price.amount)}</p>
                      {product.stock !== undefined && (
                        <p className="product-stock">
                          Stock: <span className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
                            {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;