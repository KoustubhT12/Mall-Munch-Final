// src/Pages/FoodcartsContent.jsx
import React from 'react';
import { useOutletContext } from 'react-router-dom';

const FoodcartsContent = () => {
  const { 
    foodcarts, 
    loading, 
    error, 
    handleFoodcartClick 
  } = useOutletContext();

  if (loading) return <div className="loading">Loading food carts...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  
  return (
    <>
      <h1>Food Carts</h1>
      <div className="foodcarts-grid">
        {foodcarts.map((cart) => (
          <div 
            key={cart._id} 
            className="foodcart-card clickable"
            onClick={() => handleFoodcartClick(cart._id)}
          >
            <div className="foodcart-image-container">
              {cart.Image ? (
                <img 
                  src={cart.Image} 
                  alt={cart.Fname} 
                  className="foodcart-image"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23f5f5f5"><rect width="100" height="100"/><text x="50%" y="50%" font-family="Arial" font-size="10" text-anchor="middle" dominant-baseline="middle" fill="%23666">No Image</text></svg>';
                  }}
                />
              ) : (
                <div className="no-image-placeholder">No Image</div>
              )}
            </div>
            <div className="foodcart-info">
              <h3>{cart.Fname}</h3>
              <div className="rating">
                {typeof cart.Rating === 'number' ? (
                  <>
                    <span className="rating-stars">
                      {'★'.repeat(Math.floor(cart.Rating))}
                      {'☆'.repeat(5 - Math.floor(cart.Rating))}
                    </span>
                    <span className="rating-value">({cart.Rating.toFixed(1)})</span>
                  </>
                ) : (
                  <span className="no-rating">No ratings yet</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default FoodcartsContent;