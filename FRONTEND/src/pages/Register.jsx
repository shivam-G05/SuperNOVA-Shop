import React, { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Register.css";
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user", // Default role
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) newErrors.username = "Username is required.";
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!formData.role) {
      newErrors.role = "Please select a role.";
    }

    if (!formData.street.trim()) newErrors.street = "Street is required.";
    if (!formData.city.trim()) newErrors.city = "City is required.";
    if (!formData.state.trim()) newErrors.state = "State is required.";
    if (!formData.zip.trim()) newErrors.zip = "ZIP code is required.";
    if (!formData.country.trim()) newErrors.country = "Country is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleRoleChange = (e) => {
    setFormData({ ...formData, role: e.target.value });
    setErrors({ ...errors, role: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!validate()) return;

    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/api/auth/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: {
          firstName: formData.firstName,
          lastName: formData.lastName,
        },
        role: formData.role,
        addresses: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
        },
      }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true
      });

      const data = response.data;
      login(data.user); // Update auth context
      setMessage("Registration successful 🎉 Redirecting...");
      setTimeout(() => navigate("/"), 1500);
      
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">Create Account</h1>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && <p className="error">{errors.username}</p>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
              />
              {errors.firstName && <p className="error">{errors.firstName}</p>}
            </div>

            <div className="form-group">
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
              />
              {errors.lastName && <p className="error">{errors.lastName}</p>}
            </div>
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>

          <div className="form-group password-group">
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="password-input"
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10.58 10.58A3 3 0 0113.42 13.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M17.94 17.94A10.07 10.07 0 0112 19C5 19 1 12 1 12a15.28 15.28 0 013.06-3.94" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="error">{errors.password}</p>}
          </div>

          {/* Role Selection */}
          <div className="form-group role-group">
            <label className="role-label">Select Role</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={formData.role === "user"}
                  onChange={handleRoleChange}
                />
                <span className="radio-custom"></span>
                <span className="radio-text">
                  <span className="radio-title">User</span>
                  <span className="radio-description">Browse and purchase products</span>
                </span>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="role"
                  value="seller"
                  checked={formData.role === "seller"}
                  onChange={handleRoleChange}
                />
                <span className="radio-custom"></span>
                <span className="radio-text">
                  <span className="radio-title">Seller</span>
                  <span className="radio-description">List and sell your products</span>
                </span>
              </label>
            </div>
            {errors.role && <p className="error">{errors.role}</p>}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="street"
              placeholder="Street Address"
              value={formData.street}
              onChange={handleChange}
            />
            {errors.street && <p className="error">{errors.street}</p>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
              />
              {errors.city && <p className="error">{errors.city}</p>}
            </div>

            <div className="form-group">
              <input
                type="text"
                name="state"
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
              />
              {errors.state && <p className="error">{errors.state}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="zip"
                placeholder="ZIP Code"
                value={formData.zip}
                onChange={handleChange}
              />
              {errors.zip && <p className="error">{errors.zip}</p>}
            </div>

            <div className="form-group">
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={formData.country}
                onChange={handleChange}
              />
              {errors.country && <p className="error">{errors.country}</p>}
            </div>
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {message && <p className={`register-message ${message.includes("error") || message.includes("Server") ? "error-message" : ""}`}>{message}</p>}

        <p className="login-redirect">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;