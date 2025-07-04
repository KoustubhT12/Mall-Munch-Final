// src/Pages/Foodcarts.jsx
import React, { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import '../styles/Foodcart.css';
import axios from 'axios';

const Foodcarts = () => {
  const [foodcarts, setFoodcarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 });
  const isDesktop = !isMobile && !isTablet;

  const handleLogout = () => {
    localStorage.removeItem('authorization');
    navigate('/login');
  };

  const handleAddToCart = (item) => {
    setCartItems(prev => [...prev, item]);
  };

  const handleRemoveFromCart = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleFoodcartClick = (id) => {
    const token = localStorage.getItem('authorization');
    if (!token) {
      navigate('/login');
      return;
    }
    navigate(`/Foodcart/solo/${id}`);
  };

  useEffect(() => {
    const fetchFoodcarts = async () => {
      try {
        const token = localStorage.getItem('authorization');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:8080/mall/foodcarts', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data && Array.isArray(response.data)) {
          setFoodcarts(response.data);
        } else {
          throw new Error('Invalid data format from server');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch food carts');
        
        if (err.response?.status === 401) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFoodcarts();
  }, [navigate]);

  // Navigation items
  const navItems = [
    { id: 'foodcarts', path: '', icon: '🍔', label: 'Food Carts' },
    { id: 'profile', path: 'profile', icon: '👤', label: 'Profile' },
    { id: 'orders', path: 'orders', icon: '📦', label: 'My Orders' },
    { id: 'cart', path: 'cart', icon: '🛒', label: `Cart` }
  ];

  const isActive = (path) => {
    if (path === '') {
      return location.pathname === '/Foodcart' || location.pathname === '/Foodcart/';
    }
    return location.pathname.startsWith(`/Foodcart/${path}`);
  };

  return (
    <div className={`app-container ${isMobile || isTablet ? 'mobile-view' : ''}`}>
      <nav className={`main-nav ${isMobile || isTablet ? 'bottom-nav' : 'side-nav'}`}>
        <ul>
          {navItems.map((item) => (
            <li 
              key={item.id}
              className={isActive(item.path) ? 'active' : ''}
            >
              <Link to={`/Foodcart/${item.path}`} className="nav-link">
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            </li>
          ))}
          {isDesktop && (
            <li className="logout-button" onClick={handleLogout}>
              <span className="nav-icon">🚪</span>
              <span className="nav-label">Logout</span>
            </li>
          )}
        </ul>
      </nav>

      <main className="content-area">
        <Outlet context={{ 
          foodcarts, 
          loading, 
          error, 
          cartItems, 
          handleAddToCart, 
          handleRemoveFromCart,
          handleFoodcartClick
        }} />
      </main>
    </div>
  );
};

export default Foodcarts;