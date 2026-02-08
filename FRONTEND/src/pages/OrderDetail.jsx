import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { asyncgetproducts } from "../store/actions/productsAction";

import {
  asyncgetorderbyid,
  asynccancelorder,
  asyncupdateorderaddress,
} from "../store/actions/orderAction";
import "./OrderDetail.css";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productsMap, setProductsMap] = useState({});

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
  });

  const handlePayment=()=>{
    navigate(`/payment/${id}`)
  }
  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const orderData = await asyncgetorderbyid(id);
      setOrder(orderData);
      
      // Populate form with current address
      setAddressForm({
        street: orderData.shippingAddress.street,
        city: orderData.shippingAddress.city,
        state: orderData.shippingAddress.state,
        pincode: orderData.shippingAddress.zip,
        country: orderData.shippingAddress.country || "",
      });
    } catch (err) {
      setError("Failed to load order details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
  const fetchProducts = async () => {
    try {
      const products = await asyncgetproducts();
      const map = {};
      products.forEach((p) => {
        map[p._id] = p;
      });
      setProductsMap(map);
    } catch (err) {
      console.error("Failed to load products", err);
    }
  };

  fetchProducts();
}, []);


  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      const updatedOrder = await asynccancelorder(id);
      setOrder(updatedOrder);
      alert("Order cancelled successfully!");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to cancel order";
      alert(errorMsg);
      console.error(err);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();

    if (!addressForm.street || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setIsUpdating(true);
      const updatedOrder = await asyncupdateorderaddress(id, addressForm);
      setOrder(updatedOrder);
      setShowAddressForm(false);
      alert("Address updated successfully!");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to update address";
      alert(errorMsg);
      console.error(err);
    } finally {
      setIsUpdating(false);
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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (amount, currency = "INR") => {
    const symbols = { USD: "$", INR: "₹", EUR: "€" };
    return `${symbols[currency] || currency} ${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="order-detail-container">
        <div className="loading-spinner">Loading order details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-detail-container">
        <div className="error-message">{error || "Order not found"}</div>
        <button className="back-btn" onClick={() => navigate("/order")}>
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="order-detail-container">
      <button className="back-btn" onClick={() => navigate("/order")}>
        ← Back to Orders
      </button>

      <div className="order-detail-wrapper">
        {/* Order Header */}
        <div className="detail-header">
          <div className="header-info">
            <h1>Order Details</h1>
            <p className="order-id">Order ID: {order._id}</p>
            <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div
            className="status-badge"
            style={{ backgroundColor: getStatusColor(order.status) }}
          >
            {order.status}
          </div>
        </div>

        {/* Order Items */}
        <div className="detail-section">
          <h2>Order Items ({order.items.length})</h2>
          <div className="items-list">
            {order.items.map((item, index) => (
              <div key={index} className="detail-item">
                <div className="item-info">
                  <span className="item-label">Product ID:</span>
                  <span className="item-value">{item.product}</span>
                </div>

                <div className="item-info">
  <span className="item-label">Product:</span>
  <span className="item-value">
    {productsMap[item.product]?.title || "Loading..."}
  </span>
</div>
                
                <div className="item-info">
                  <span className="item-label">Quantity:</span>
                  <span className="item-value">{item.quantity}</span>
                </div>
                <div className="item-info">
                  <span className="item-label">Price:</span>
                  <span className="item-value">
                    {formatPrice(item.price.amount, item.price.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="detail-section">
          <div className="section-header">
            <h2>Shipping Address</h2>
            {order.status === "PENDING" && !showAddressForm && (
              <button
                className="edit-btn"
                onClick={() => setShowAddressForm(true)}
              >
                Edit Address
              </button>
            )}
          </div>

          {showAddressForm ? (
            <form className="address-form" onSubmit={handleUpdateAddress}>
              <div className="form-row">
                <div className="form-group">
                  <label>Street Address *</label>
                  <input
                    type="text"
                    name="street"
                    value={addressForm.street}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={addressForm.city}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={addressForm.state}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>PIN Code *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={addressForm.pincode}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={addressForm.country}
                    onChange={handleAddressChange}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowAddressForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update Address"}
                </button>
              </div>
            </form>
          ) : (
            <div className="address-display">
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
              <p>PIN: {order.shippingAddress.pincode}</p>
              {order.shippingAddress.country && (
                <p>{order.shippingAddress.country}</p>
              )}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="detail-section summary-section">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>{formatPrice(order.totalPrice.amount, order.totalPrice.currency)}</span>
          </div>
          <div className="summary-row total-row">
            <span>Total:</span>
            <span>{formatPrice(order.totalPrice.amount, order.totalPrice.currency)}</span>
          </div>
        </div>

        {/* Actions */}
        {order.status === "PENDING" && (
          <div className="detail-actions">
            <button className="cancel-order-btn" onClick={handleCancelOrder}>
              Cancel Order
            </button>


            <button className="pay-order-btn" onClick={handlePayment}>
              Pay for Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;