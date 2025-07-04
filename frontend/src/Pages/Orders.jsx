import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../styles/Orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const statusDisplay = {
    'preparing': 'PREPARING',
    'ready': 'READY',
    'picked up': 'PICKED UP'
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('authorization');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('https://mall-munch-backend.onrender.com/user/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setOrders(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
      if (err.response?.status === 401) {
        localStorage.removeItem('authorization');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };
const handleRateOrder = async (orderId, rating) => {
  try {
    const token = localStorage.getItem('authorization');
    if (!token) return navigate('/login');

    console.log('Submitting rating for order:', orderId, 'Rating:', rating);
    
    const response = await axios.post(
      `https://mall-munch-backend.onrender.com/user/${orderId}/rate`,
      { rating },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Rating response:', response.data);
    
    if (response.data && response.data._id) {
      setOrders(orders.map(order => 
        order._id === response.data._id ? response.data : order
      ));
      toast.success('Rating submitted successfully!');
      
      // Optional: Refetch orders to ensure complete sync
      await fetchOrders();
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (err) {
    console.error('Full rating error:', err);
    console.error('Error response:', err.response?.data);
    
    const msg = err.response?.data?.message || 
               err.message || 
               'Failed to submit rating';
    toast.error(msg);
  }
};

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canRateOrder = (order) => {
    return order.order_status === 'picked up' && !order.order_rating;
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div className="loading">Loading your orders...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="orders-container">
      <ToastContainer position="top-right" autoClose={3000}  />
      <h1>Your Orders</h1>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <p>No orders found</p>
          <button onClick={() => navigate('/Foodcart')}>Order something</button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order._id.slice(-6).toUpperCase()}</h3>
                  <p className="order-date">{formatDate(order.createdAt)}</p>
                </div>
                <div className={`order-status ${order.order_status.replace(' ', '-')}`}>
                  {statusDisplay[order.order_status]}
                </div>
              </div>

              <div className="order-details">
                <div className="restaurant">From: {order.foodcart}</div>
                
                <div className="items-list">
                  {order.items.map((item, i) => (
                    <div key={i} className="item">
                      {item.image && <img src={item.image} alt={item.name} />}
                      <div>
                        <p>{item.name}</p>
                        <span>{item.price} Rs × {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <span>Total:</span>
                    <span>{order.order_total?.toFixed(2)} Rs</span>
                  </div>

                  {order.order_status === 'picked up' && (
                    <div className="rating-section">
                      <p>Rate your order:</p>
                      <div className={`stars ${!canRateOrder(order) ? 'disabled' : ''}`}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            className={star <= (order.order_rating || 0) ? 'active' : ''}
                            onClick={() => canRateOrder(order) && handleRateOrder(order._id, star)}
                            disabled={!canRateOrder(order)}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      {order.order_rating ? (
                        <p className="rated-message">You rated this order: {order.order_rating} stars</p>
                      ) : (
                        <p className="rated-message">
                          {canRateOrder(order) ? 'Click stars to rate' : 'Rating not available'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;