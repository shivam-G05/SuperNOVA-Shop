import { useEffect, useState } from "react";
import "./Home.css";
import { asyncgetproducts } from "../store/actions/productsAction";
import { asyncgetusers } from "../store/actions/userAction";
import ProductCard from '../components/ProductCard';

function Home() {
  const [welcomeText, setWelcomeText] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
   useEffect(() => {
    console.log('=== COOKIE DEBUG ===');
    console.log('All cookies:', document.cookie);
    
    // Parse cookies
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    
    console.log('Parsed cookies:', cookies);
    console.log('Token cookie:', cookies.token || 'NOT FOUND');
    
    // Test API call with credentials
    fetch('https://api.shivamg.me/api/auth/me', {
      credentials: 'include'
    })
    .then(r => r.json())
    .then(data => {
      console.log('✅ API call successful:', data);
    })
    .catch(err => {
      console.error('❌ API call failed:', err);
    });
  }, []);

  const categories = [
    'All',
    'Electronics',
    'Fashion',
    'Home',
    'Books',
    'Beauty',
    'Sports',
    'Toys',
    'Grocery'
  ];

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await asyncgetproducts();
        setProducts(res);
        setFilteredProducts(res);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    asyncgetusers();
  }, []);

  // Filter products when search or category changes
  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  // Close filter popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Only close if clicking outside the entire search section
      const searchSection = document.querySelector('.search-section');
      if (searchSection && !searchSection.contains(e.target)) {
        setShowFilters(false);
      }
    };

    // Only add listener when filters are shown
    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);

  // Welcome text animation
  useEffect(() => {
    const text = "Welcome to SuperNOVA Shop.";
    let i = 0;
    const interval = setInterval(() => {
      setWelcomeText(text.substring(0, i + 1));
      i++;
      if (i === text.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const filterProducts = () => {
    let filtered = [...products];

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(
        product => product.category === selectedCategory
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.title?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );

      // Sort by relevance - exact matches first
      filtered.sort((a, b) => {
        const aTitle = a.title?.toLowerCase() || '';
        const bTitle = b.title?.toLowerCase() || '';
        const aExact = aTitle === query;
        const bExact = bTitle === query;
        const aStarts = aTitle.startsWith(query);
        const bStarts = bTitle.startsWith(query);

        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return 0;
      });
    }

    setFilteredProducts(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setShowFilters(false); // Close popup after selecting
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setShowFilters(false);
  };

  const toggleFilters = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setShowFilters(!showFilters);
  };

  return (
    <div className='home-container'>
      <div className='home-page-heading'>
        <h1 className='welcome'>{welcomeText}</h1>
        <p className="products-count">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
        </p>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-bar">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>

          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />

          {searchQuery && (
            <button 
              className="clear-search-btn" 
              onClick={handleClearSearch}
              type="button"
            >
              ×
            </button>
          )}

          {/* FILTER ICON BUTTON */}
          <button 
            className="filter-toggle-btn" 
            onClick={toggleFilters}
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 4h18M6 12h12M10 20h4" />
            </svg>
          </button>
        </div>

        {/* FILTER POPUP */}
        {showFilters && (
          <div className="filter-popup">
            <h4>Categories</h4>
            <div className="category-chips">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`category-chip ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(category)}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {(searchQuery || selectedCategory !== 'All') && (
        <div className="active-filters">
          <span className="filter-label">Active filters:</span>
          {searchQuery && (
            <span className="filter-tag">
              Search: "{searchQuery}"
              <button onClick={handleClearSearch} className="remove-filter" type="button">×</button>
            </span>
          )}
          {selectedCategory !== 'All' && (
            <span className="filter-tag">
              Category: {selectedCategory}
              <button onClick={() => handleCategoryChange('All')} className="remove-filter" type="button">×</button>
            </span>
          )}
          <button className="clear-all-filters" onClick={handleClearAllFilters} type="button">
            Clear all
          </button>
        </div>
      )}

      {/* Products Grid */}
      <div className='home-page-product-container'>
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <h3>No Products Found</h3>
            <p>
              {searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your filters or search query'
                : 'No products available at the moment'}
            </p>
            {(searchQuery || selectedCategory !== 'All') && (
              <button className="clear-filters-btn" onClick={handleClearAllFilters} type="button">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className='home-page-products'>
            {filteredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;