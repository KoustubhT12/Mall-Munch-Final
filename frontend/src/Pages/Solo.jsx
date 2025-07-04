import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/Solo.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Solo = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [vegFilter, setVegFilter] = useState('all');
  const [cartQuantities, setCartQuantities] = useState({});
  const [foodCartName, setFoodCartName] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem('authorization');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`https://mall-munch-backend.onrender.com/mall/foodcarts/${id}/items`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        setFoodCartName(response.data.foodCartName);
        
        if (response.data.items && Array.isArray(response.data.items)) {
          setItems(response.data.items);
          setFilteredItems(response.data.items);
        } else {
          throw new Error('Invalid data format from server');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch items');
        
        if (err.response?.status === 401) {
          localStorage.removeItem('authorization');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
    loadCartQuantities();
  }, [id, navigate]);

  useEffect(() => {
    let result = items;
    
    if (vegFilter !== 'all') {
      result = result.filter(item => item.veg === (vegFilter === 'veg'));
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(term) || 
        (item.description && item.description.toLowerCase().includes(term))
      );
    }
    
    setFilteredItems(result);
  }, [items, searchTerm, vegFilter]);

  const loadCartQuantities = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || {};
    const quantities = {};
    
    if (cart[id] && cart[id].items) {
      Object.keys(cart[id].items).forEach(itemId => {
        quantities[itemId] = cart[id].items[itemId].quantity;
      });
    }
    
    setCartQuantities(quantities);
  };

  const addToCart = (item) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart')) || {};
      
      // Check if trying to add from different food cart
      const cartKeys = Object.keys(cart);
      if (cartKeys.length > 0 && !cartKeys.includes(id)) {
        toast.error(
          <div>
            You can only order from one food cart at a time.<br/>
            <button 
              onClick={() => {
                const newCart = {
                  [id]: {
                    foodCartId: id,
                    foodCartName: foodCartName || `Food Cart ${id}`,
                    items: {
                      [item._id]: {
                        id: item._id,
                        name: item.name,
                        price: item.price,
                        veg: item.veg,
                        quantity: 1,
                        description: item.description,
                        IRating: item.IRating
                      }
                    }
                  }
                };
                localStorage.setItem('cart', JSON.stringify(newCart));
                loadCartQuantities();
                toast.dismiss();
              }}
              className="toast-confirm-button"
            >
              Start new order from this cart
            </button>
          </div>,
          {
            position: "bottom-right",
            autoClose: 5000,
            closeButton: false,
          }
        );
        return;
      }

      if (!cart[id]) {
        cart[id] = {
          foodCartId: id,
          foodCartName: foodCartName || `Food Cart ${id}`,
          items: {}
        };
      }
      
      if (cart[id].items[item._id]) {
        cart[id].items[item._id].quantity += 1;
      } else {
        cart[id].items[item._id] = {
          id: item._id,
          name: item.name,
          price: item.price,
          veg: item.veg,
          quantity: 1,
          description: item.description,
          IRating: item.IRating
        };
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      loadCartQuantities();
      
      toast.success(`${item.name} added to cart! (Quantity: ${cart[id].items[item._id].quantity})`, {
        position: "bottom-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const removeFromCart = (item) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart')) || {};
      
      if (cart[id] && cart[id].items[item._id]) {
        if (cart[id].items[item._id].quantity > 1) {
          cart[id].items[item._id].quantity -= 1;
          toast.info(`${item.name} quantity decreased to ${cart[id].items[item._id].quantity}`, {
            position: "bottom-right",
            autoClose: 3000,
          });
        } else {
          delete cart[id].items[item._id];
          toast.warn(`${item.name} removed from cart`, {
            position: "bottom-right",
            autoClose: 3000,
          });
          
          if (Object.keys(cart[id].items).length === 0) {
            delete cart[id];
          }
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCartQuantities();
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="star full">★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">★</span>);
      }
    }
    
    return (
      <div className="item-rating">
        {stars}
        <span className="rating-value">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (loading) return <div className="solo-loading">Loading items...</div>;
  if (error) return <div className="solo-error">Error: {error}</div>;

  return (
    <div className="solo-foodcart">
      <h1>{foodCartName || `Food Cart ${id}`}</h1>
      
      <div className="solo-filters-container">
        <div className="solo-search-bar">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search food items"
          />
          <button className="solo-search-button">
            <i className="fas fa-search"></i> Search
          </button>
        </div>
        
        <div className="solo-veg-filter">
          <button 
            className={`solo-filter-btn ${vegFilter === 'all' ? 'active' : ''}`}
            onClick={() => setVegFilter('all')}
            aria-label="Show all items"
          >
            All
          </button>
          <button 
            className={`solo-filter-btn ${vegFilter === 'veg' ? 'active' : ''}`}
            onClick={() => setVegFilter('veg')}
            aria-label="Show only vegetarian items"
          >
            Veg
          </button>
          <button 
            className={`solo-filter-btn ${vegFilter === 'nonveg' ? 'active' : ''}`}
            onClick={() => setVegFilter('nonveg')}
            aria-label="Show only non-vegetarian items"
          >
            Non-Veg
          </button>
        </div>
      </div>
      
      <div className="solo-items-count">
        {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
      </div>
      
      {filteredItems.length === 0 ? (
        <div className="solo-no-items">No items match your search criteria</div>
      ) : (
        <ul className="solo-food-items">
          {filteredItems.map((item) => (
            <li key={item._id} className={`solo-food-item ${item.veg ? 'veg' : 'nonveg'}`}>
              <div className="solo-item-info">
                <div className="solo-item-header">
                  <h3>{item.name}</h3>
                  <span className={`solo-veg-indicator ${item.veg ? 'veg' : 'nonveg'}`}>
                    {item.veg ? '🟢 Veg' : '🔴 Non-Veg'}
                  </span>
                </div>
                {item.description && <p className="solo-item-description">{item.description}</p>}
                {item.IRating && renderRating(item.IRating)}
                <span className="solo-price">{item.price.toFixed(2)} Rs</span>
              </div>
              <div className="solo-quantity-controls">
                {cartQuantities[item._id] > 0 && (
                  <>
                    <button 
                      className="solo-quantity-btn solo-minus-btn"
                      onClick={() => removeFromCart(item)}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      -
                    </button>
                    <span className="solo-item-quantity">
                      {cartQuantities[item._id]}
                    </span>
                  </>
                )}
                <button 
                  className="solo-quantity-btn solo-plus-btn"
                  onClick={() => addToCart(item)}
                  aria-label={`Add ${item.name} to cart`}
                >
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
         toastStyle={{ 
    backgroundColor: '#fff',
    color: '#000'
  }}
      />
    </div>
  );
};

export default Solo;