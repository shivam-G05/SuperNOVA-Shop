import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { asyncgetaddresses } from "../store/actions/addressAction";
import { asynccreateorder } from "../store/actions/orderAction";
import "./CheckoutModal.css";

const CheckoutModal = ({ isOpen, onClose, cartTotal }) => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAddresses();
    }
  }, [isOpen]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const userAddresses = await asyncgetaddresses();
      setAddresses(userAddresses || []);
      
      // Auto-select default address if exists
      const defaultAddr = userAddresses?.find(addr => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr._id);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddress(addressId);
  };

  const handleAddAddress = () => {
    onClose();
    navigate("/profile");
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert("Please select a shipping address");
      return;
    }

    const address = addresses.find(addr => addr._id === selectedAddress);
    if (!address) return;

    // const shippingAddress = {
    //   street: address.street,
    //   city: address.city,
    //   state: address.state,
    //   pincode: address.zip || address.pincode,
    //   country: address.country || "India",
    // };

    const shippingAddress = {
  street: address.street,
  city: address.city,
  state: address.state,
  pincode: String(address.zip || address.pincode), // ✅ force string
  country: address.country || "India",
};


    try {
      setIsCreatingOrder(true);
      const order = await asynccreateorder(shippingAddress);
      onClose();
      navigate(`/order/${order._id}`);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to create order";
      alert(errorMsg);
      console.error(err);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="checkout-modal-overlay" onClick={onClose}>
      <div className="checkout-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="checkout-modal-header">
          <h2>Select Shipping Address</h2>
          <button className="close-modal-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="checkout-modal-body">
          {loading ? (
            <div className="loading-addresses">Loading addresses...</div>
          ) : addresses.length === 0 ? (
            <div className="no-addresses-checkout">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <p>No addresses found</p>
              <p className="no-address-subtitle">
                Please add a shipping address to continue
              </p>
              <button className="add-address-redirect-btn" onClick={handleAddAddress}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Add Address
              </button>
            </div>
          ) : (
            <>
              <div className="addresses-list-checkout">
                {addresses.map((address) => (
                  <div
                    key={address._id}
                    className={`address-card-checkout ${
                      selectedAddress === address._id ? "selected" : ""
                    }`}
                    onClick={() => handleAddressSelect(address._id)}
                  >
                    <div className="address-radio">
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress === address._id}
                        onChange={() => handleAddressSelect(address._id)}
                      />
                    </div>
                    <div className="address-info-checkout">
                      {address.isDefault && (
                        <span className="default-tag">Default</span>
                      )}
                      <p className="address-line">{address.street}</p>
                      <p className="address-line">
                        {address.city}, {address.state}
                      </p>
                      <p className="address-line">PIN: {address.zip || address.pincode}</p>
                      {address.country && (
                        <p className="address-line">{address.country}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button className="add-new-address-btn" onClick={handleAddAddress}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Add New Address
              </button>
            </>
          )}
        </div>

        {addresses.length > 0 && (
          <div className="checkout-modal-footer">
            <div className="order-total-checkout">
              <span>Order Total:</span>
              <span className="total-price">₹ {cartTotal.toFixed(2)}</span>
            </div>
            <button
              className="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={!selectedAddress || isCreatingOrder}
            >
              {isCreatingOrder ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;