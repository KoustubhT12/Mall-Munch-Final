import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Fcurrent.css';

const FCurrentOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statusOptions = [
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready for Pickup' },
    { value: 'picked up', label: 'Picked Up' }
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('authorization');
        if (!token) throw new Error('Please login to view orders');

        const response = await axios.get('http://localhost:8080/foodcart/getcurrentorders', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setOrders(response.data.map(order => ({
          ...order,
          orderId: order._id,
          status: order.order_status || 'preparing'
        })));
        
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('authorization');
      if (!token) throw new Error('Please login to update orders');

      setOrders(prev => prev.map(order => 
        order.orderId === orderId ? { ...order, status: newStatus } : order
      ));

      await axios.put(
        `http://localhost:8080/foodcart/updateorderstatus/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Order status updated to ${newStatus}`,{style: { 
        backgroundColor: '#4a4a4a', // Dark gray
        color: '#fff'
      }});
      
      if (newStatus === 'picked up') {
        setOrders(prev => prev.filter(order => order.orderId !== orderId));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setOrders(prev => prev.map(order => 
        order.orderId === orderId 
          ? { ...order, status: orders.find(o => o.orderId === orderId).status } 
          : order
      ));
    }
  };

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
      <p className="empty-message">No current orders available</p>
    </div>
  );

  return (
    <div className="current-orders-container">
      <h1 className="page-title">Current Orders</h1>

      {/* Desktop Table View */}
      <div className="desktop-table">
        <table className="orders-table">
          <thead className="table-header">
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.orderId} className="table-row">
                <td>#{order.orderId.slice(-6)}</td>
                <td>{order.user?.username || 'Customer'}</td>
                <td>
                  <ul className="table-items-list">
                    {order.items.map((item, i) => (
                      <li key={i}>
                        {item.name} × {item.quantity} (₹{item.price})
                      </li>
                    ))}
                  </ul>
                </td>
                <td>₹{order.order_total}</td>
                <td>
                  <span className={`status-badge ${
                    order.status === 'preparing' ? 'status-preparing' :
                    order.status === 'ready' ? 'status-ready' :
                    'status-picked-up'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                    className="status-select-desktop"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-cards">
        {orders.map(order => (
          <div key={order.orderId} className="order-card">
            <div className="order-header">
              <span>Order #{order.orderId.slice(-6)}</span>
              <span>{order.user?.username || 'Customer'}</span>
            </div>
            
            <div className="order-items">
              <h3>Items:</h3>
              <ul className="order-items-list">
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.name} × {item.quantity} (₹{item.price})
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="order-footer">
              <span className="order-total">₹{order.order_total}</span>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                className="status-select"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FCurrentOrders;