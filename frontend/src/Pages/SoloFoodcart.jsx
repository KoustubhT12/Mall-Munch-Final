import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/Foodcart.css';

const SoloFoodcart = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

        const response = await axios.get(`http://localhost:8080/mall/foodcarts/${id}/items`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data && Array.isArray(response.data)) {
          setItems(response.data);
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
  }, [id, navigate]);

  if (loading) return <div className="loading">Loading items...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="solo-foodcart">
      <h1>Food Cart Items</h1>
      {items.length === 0 ? (
        <div className="no-items">No items present in this food cart</div>
      ) : (
        <ul className="food-items">
          {items.map((item, index) => (
            <li key={index} className="food-item">
              <div className="item-info">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <span className="price">${item.price.toFixed(2)}</span>
              </div>
              <button 
                className="add-to-cart"
                onClick={() => {
                  // You'll need to implement this function in your parent component
                  // and pass it down or use a state management solution
                  console.log('Add to cart:', item);
                }}
              >
                +
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SoloFoodcart;