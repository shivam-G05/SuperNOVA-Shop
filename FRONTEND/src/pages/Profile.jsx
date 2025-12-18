import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { asyncgetusers, asynclogout } from "../store/actions/userAction";
import { asyncgetaddresses, asyncaddaddress, asyncdeleteaddress } from "../store/actions/addressAction";
import "./Profile.css";

import { useAuth } from "../context/AuthContext";



const Profile = () => {
  const { logout: authLogout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    isDefault: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [user, userAddresses] = await Promise.all([
        asyncgetusers(),
        asyncgetaddresses(),
      ]);

      setUserData(user);
      setAddresses(userAddresses || []);
    } catch (err) {
      setError("Failed to load profile data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    
    if (!formData.street || !formData.city || !formData.state || !formData.zip ||!formData.country) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const newAddress = await asyncaddaddress(formData);
      setAddresses((prev)=>{
        if(newAddress.isDefault){
          return[
            ...prev.map((addr)=>({
              ...addr,isDefault:false
            })),
            newAddress
          ]
        }
        return[...prev,newAddress]
      });
      
      // Reset form
      setFormData({
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "",
        isDefault: false,
      });
      setShowAddressForm(false);
    } catch (err) {
      alert("Failed to add address. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      const updatedAddresses = await asyncdeleteaddress(addressId);
      setAddresses(updatedAddresses);
    } catch (err) {
      alert("Failed to delete address. Please try again.");
      console.error(err);
    }
  };

  const handleLogout = async () => {
  try {
    setIsLoggingOut(true);
    await asynclogout();
    
    // Update auth context
    authLogout();
    
    // Clear local state
    setUserData(null);
    setAddresses([]);
    
    // Redirect to login page
    navigate('/login');
  } catch (err) {
    alert("Failed to logout. Please try again.");
    console.error(err);
  } finally {
    setIsLoggingOut(false);
    setShowLogoutModal(false);
  }
};

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-container">
        <div className="error-message">No user data found</div>
      </div>
    );
  }

  const { fullName, username, email, role } = userData;

  return (
    <div className="profile-container">
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
            </div>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-actions">
              <button 
                className="modal-btn cancel-btn" 
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
              >
                Cancel
              </button>
              <button 
                className="modal-btn logout-btn" 
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="profile-wrapper">
        <div className="profile-header">
          <div className="profile-avatar">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <h1 className="profile-name">
            {fullName.firstName} {fullName.lastName}
          </h1>
          <p className="profile-username">@{username}</p>
          <div className="profile-role-badge">{role}</div>
          
          <button className="logout-button" onClick={() => setShowLogoutModal(true)}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            Logout
          </button>
        </div>

        <div className="profile-content">
          <div className="info-section">
            <h2 className="section-title">Personal Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">First Name</span>
                <span className="info-value">{fullName.firstName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Name</span>
                <span className="info-value">{fullName.lastName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Username</span>
                <span className="info-value">{username}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{email}</span>
              </div>
            </div>
          </div>

          <div className="addresses-section">
            <div className="addresses-header">
              <h2 className="section-title">
                Addresses ({addresses.length})
              </h2>
              <button
                className="add-address-btn"
                onClick={() => setShowAddressForm(!showAddressForm)}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Add Address
              </button>
            </div>

            {showAddressForm && (
              <div className="address-form-container">
                <form className="address-form" onSubmit={handleAddAddress}>
                  <h3>Add New Address</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Street Address *</label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        placeholder="Enter street address"
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
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Enter city"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>State *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Enter state"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>PIN Code *</label>
                      <input
                        type="text"
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        placeholder="Enter ZIP code"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Country</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="Enter country"
                      />
                    </div>
                  </div>
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={formData.isDefault}
                        onChange={handleInputChange}
                      />
                      Set as default address
                    </label>
                  </div>
                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setShowAddressForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Adding..." : "Add Address"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {addresses.length > 0 ? (
              <div className="addresses-grid">
                {addresses.map((address) => (
                  <div key={address._id} className="address-card">
                    {address.isDefault && (
                      <div className="default-badge">Default</div>
                    )}
                    <button
                      className="delete-address-btn"
                      onClick={() => handleDeleteAddress(address._id)}
                      aria-label="Delete address"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                    <div className="address-icon">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                    </div>
                    <div className="address-details">
                      <p className="address-street">{address.street}</p>
                      <p className="address-city">
                        {address.city}, {address.state}
                      </p>
                      <p className="address-zip">PIN: {address.zip || address.pincode}</p>
                      {address.country && (
                        <p className="address-country">{address.country}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-addresses">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <p>No addresses added yet</p>
                <button
                  className="add-first-address-btn"
                  onClick={() => setShowAddressForm(true)}
                >
                  Add Your First Address
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;