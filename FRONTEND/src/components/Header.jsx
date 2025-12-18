import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Header.css"; 

const Header = () => {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  if (loading) {
    return (
      <header className="header">     
        <nav className="nav">   
          <Link to="/" className="nav-link">Home</Link>
        </nav>    
      </header>
    );
  }

  return (
    <header className="header">
      {/* Hamburger Menu Button - Only visible on mobile */}
      <button 
        className="hamburger-btn" 
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
      </button>

      <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>   
        <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
        
        {/* Show Login/Register only if NOT logged in */}
        {!user && (
          <>
            <Link to="/login" className="nav-link" onClick={closeMenu}>Login</Link>
            <Link to="/register" className="nav-link" onClick={closeMenu}>Register</Link>
          </>
        )}
        
        <Link to="/cart" className="nav-link" onClick={closeMenu}>Cart</Link>
        <Link to="/order" className="nav-link" onClick={closeMenu}>Orders</Link>
        
        {user && (
          <>
            <Link to="/seller/dashboard" className="nav-link" onClick={closeMenu}>Seller Dashboard</Link>
            <Link to="/sell" className="nav-link" onClick={closeMenu}>Sell Products</Link>
          </>
        )}
      </nav>

      {/* Profile icon - Always visible on the right when logged in */}
      {user && (
        <Link to="/profile" className="profile-icon-link" aria-label="Profile">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </Link>
      )}

      {/* Overlay for mobile menu */}
      {menuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
    </header>
  );
}

export default Header;