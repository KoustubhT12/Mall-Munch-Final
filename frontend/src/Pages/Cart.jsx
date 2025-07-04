import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Cart.css';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadCart = () => {
      try {
        const cartData = JSON.parse(localStorage.getItem('cart')) || {};
        if (Object.keys(cartData).length > 0) {
          setCart(cartData);
          
          let cartTotal = 0;
          Object.values(cartData).forEach(foodCart => {
            Object.values(foodCart.items).forEach(item => {
              cartTotal += item.price * item.quantity;
            });
          });
          setTotal(cartTotal);
        } else {
          setCart(null);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        toast.error('Failed to load cart data');
        setCart(null);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  const updateQuantity = (foodCartId, itemId, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCart = { ...cart };
    updatedCart[foodCartId].items[itemId].quantity = newQuantity;
    
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setCart(updatedCart);
    
    let cartTotal = 0;
    Object.values(updatedCart).forEach(foodCart => {
      Object.values(foodCart.items).forEach(item => {
        cartTotal += item.price * item.quantity;
      });
    });
    setTotal(cartTotal);
  };

  const removeItem = (foodCartId, itemId) => {
    const updatedCart = { ...cart };
    delete updatedCart[foodCartId].items[itemId];
    
    if (Object.keys(updatedCart[foodCartId].items).length === 0) {
      delete updatedCart[foodCartId];
    }
    
    localStorage.setItem('cart', Object.keys(updatedCart).length > 0 ? JSON.stringify(updatedCart) : null);
    setCart(Object.keys(updatedCart).length > 0 ? updatedCart : null);
    
    toast.success('Item removed from cart');
    
    let cartTotal = 0;
    Object.values(updatedCart).forEach(foodCart => {
      Object.values(foodCart.items).forEach(item => {
        cartTotal += item.price * item.quantity;
      });
    });
    setTotal(cartTotal);
  };

  const validateItemIds = (cartData) => {
    const invalidItems = [];
    
    Object.entries(cartData).forEach(([foodCartId, foodCart]) => {
      Object.values(foodCart.items).forEach(item => {
        if (!/^[0-9a-fA-F]{24}$/.test(item.id)) {
          invalidItems.push({
            name: item.name,
            id: item.id
          });
        }
      });
    });
    
    return invalidItems;
  };

  const handleCheckout = async () => {
  if (isCheckingOut || !cart) return;
  
  setIsCheckingOut(true);
  try {
    // Prepare order data with complete item details
    const orderData = {
      orders: Object.entries(cart).map(([foodCartId, foodCart]) => ({
        foodCartId,
        items: Object.values(foodCart.items).map(item => ({
          itemId: item.id,        // original item ID
          name: item.name,        // added
          price: item.price,      // added
          veg: item.veg,          // added
          quantity: item.quantity // added
        }))
      }))
    };

    const token = localStorage.getItem('authorization');
    if (!token) {
      throw new Error('Please login to place an order');
    }

    const response = await fetch('http://localhost:8080/mall/placeOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to place order');
    }

    // Clear the cart on success
    localStorage.removeItem('cart');
    setCart(null);
    setTotal(0);
    
    toast.success('Order placed successfully!');
    navigate('/Foodcart/orders');
    
  } catch (error) {
    console.error('Order error:', error);
    toast.error(error.message || 'Failed to place order. Please try again.');
  } finally {
    setIsCheckingOut(false);
  }
};

  if (loading) return <div className="cart-loading">Loading cart...</div>;
  if (!cart) return <div className="cart-empty">Your cart is empty</div>;

  return (
    <div className="cart-container">
      <h1>Your Cart</h1>
      
      {Object.entries(cart).map(([foodCartId, foodCart]) => (
        <div key={foodCartId} className="foodcart-cart">
          <h2>{foodCart.foodCartName || `Food Cart ${foodCartId.substring(0, 4)}`}</h2>
          
          <ul className="cart-items">
            {Object.values(foodCart.items).map(item => (
              <li key={item.id} className="cart-item">
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <div className="item-meta">
                    <p className="item-price">₹{item.price.toFixed(2)} each</p>
                    <span className={`veg-indicator ${item.veg ? 'veg' : 'nonveg'}`}>
                      {item.veg ? '🟢 Veg' : '🔴 Non-Veg'}
                    </span>
                  </div>
                </div>
                
                <div className="item-controls">
                  <div className="quantity-controls">
                    <button 
                      onClick={() => updateQuantity(foodCartId, item.id, item.quantity - 1)}
                      className="quantity-btn minus"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    
                    <span className="quantity">{item.quantity}</span>
                    
                    <button 
                      onClick={() => updateQuantity(foodCartId, item.id, item.quantity + 1)}
                      className="quantity-btn plus"
                    >
                      +
                    </button>
                  </div>
                  
                  {!isMobile && (
                    <div className="item-total">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  )}
                  
                  <button 
                    onClick={() => removeItem(foodCartId, item.id)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                </div>

                {isMobile && (
                  <div className="mobile-item-total">
                    Total: ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
      
      <div className="cart-summary">
        <div className="total-amount">
          <span>Total:</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
        
        <button 
          onClick={handleCheckout}
          className="checkout-btn"
          disabled={!cart || total === 0 || isCheckingOut}
        >
          {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
        </button>
      </div>
      
      <ToastContainer
        position={isMobile ? "top-center" : "bottom-right"}
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
         toastStyle={{ 
    backgroundColor: '#4a4a4a',
    color: '#fff'
  }}
      />
    </div>
  );
};

export default Cart;