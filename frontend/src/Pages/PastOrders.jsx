import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import '../styles/pastorders.css';

const PastOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPastOrders = async () => {
      try {
        const token = localStorage.getItem('authorization');
        if (!token) throw new Error('No authorization token found');

        const response = await axios.get(
          'https://mall-munch-backend.onrender.com/foodcart/pastorders',
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const formattedOrders = response.data.map(order => {
          const items = Array.isArray(order.items) 
            ? order.items.map(item => ({
                name: item?.name || 'Item',
                price: item?.price || 0,
                quantity: item?.quantity || 1
              }))
            : [];

          return {
            id: order._id,
            username: order.user?.username || 'Customer',
            items,
            total: order.order_total || 0,
            rating: order.order_rating || null,
            date: order.updatedAt || order.createdAt
          };
        });

        setOrders(formattedOrders);
        
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to load past orders');
      } finally {
        setLoading(false);
      }
    };

    fetchPastOrders();
  }, []);

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner"></div>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <p>Error: {error}</p>
      <button 
        onClick={() => window.location.reload()}
        className="error-button"
      >
        Retry
      </button>
    </div>
  );

  if (orders.length === 0) return (
    <div className="empty-orders">
      <p className="empty-message">No past orders available</p>
    </div>
  );

  return (
    <div className="past-orders-container">
      <h2 className="page-title">Past Orders</h2>
      
      {/* Mobile View - Cards */}
      <div className="mobile-cards">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <span>Order #{order.id.slice(-6)}</span>
              <span>{order.username}</span>
            </div>
            
            <div className="order-items">
              <h3>Items:</h3>
              <ul className="order-items-list">
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.name} (x{item.quantity}) - ₹{item.price}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="order-details-grid">
              <div>
                <p className="order-detail-label">Total:</p>
                <p>₹{order.total}</p>
              </div>
              <div>
                <p className="order-detail-label">Rating:</p>
                <p>{order.rating ? `${order.rating}/5` : 'Not rated yet'}</p>
              </div>
              <div>
                <p className="order-detail-label">Date:</p>
                <p>{format(new Date(order.date), 'dd MMM yyyy')}</p>
              </div>
              <div>
                <p className="order-detail-label">Time:</p>
                <p>{format(new Date(order.date), 'hh:mm a')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="desktop-table">
        <table className="orders-table">
          <thead className="table-header">
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Rating</th>
              <th>Date</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="table-row">
                <td>{order.id.slice(-6)}</td>
                <td>{order.username}</td>
                <td>
                  <ul className="table-items-list">
                    {order.items.map((item, i) => (
                      <li key={i}>
                        {item.name} (x{item.quantity}) - ₹{item.price}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>₹{order.total}</td>
                <td>
                  {order.rating ? `${order.rating}/5` : 'Not rated yet'}
                </td>
                <td>
                  {format(new Date(order.date), 'dd MMM yyyy')}
                </td>
                <td>
                  {format(new Date(order.date), 'hh:mm a')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PastOrders;