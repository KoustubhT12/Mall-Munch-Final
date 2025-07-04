import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/AddFood.css';
import { useNavigate } from 'react-router-dom';

const AddFood = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    veg: true
  });
  const [addForm, setAddForm] = useState({
    name: '',
    price: '',
    veg: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authorization');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('https://mall-munch-backend.onrender.com/foodcart/additem', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setItems(response.data);
    } catch (err) {
      console.error('Error fetching items:', err);
      toast.error(err.response?.data?.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item) => {
    setEditingItem(item._id);
    setEditForm({
      name: item.name,
      price: item.price,
      veg: item.veg
    });
  };

  const handleAddClick = () => {
    setShowAddForm(true);
    setAddForm({
      name: '',
      price: '',
      veg: true
    });
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    if (editingItem) {
      setEditForm(prev => ({
        ...prev,
        [name]: val
      }));
    } else {
      setAddForm(prev => ({
        ...prev,
        [name]: val
      }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Updating item...');
    
    try {
      const token = localStorage.getItem('authorization');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.post(
        'https://mall-munch-backend.onrender.com/foodcart/item-edit',
        {
          id: editingItem,
          name: editForm.name,
          price: editForm.price,
          isVeg: editForm.veg
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.update(toastId, {
        render: 'Item updated successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });
      
      setEditingItem(null);
      fetchItems();
    } catch (err) {
      console.error('Error updating item:', err);
      toast.update(toastId, {
        render: err.response?.data?.message || 'Failed to update item',
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Adding new item...');
    
    try {
      const token = localStorage.getItem('authorization');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.post(
        'https://mall-munch-backend.onrender.com/foodcart/newitem',
        {
          name: addForm.name,
          price: addForm.price,
          veg: addForm.veg
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.update(toastId, {
        render: 'Item added successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });
      
      setShowAddForm(false);
      fetchItems();
    } catch (err) {
      console.error('Error adding item:', err);
      toast.update(toastId, {
        render: err.response?.data?.message || 'Failed to add item',
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
    }
  };

  const handleDelete = async (itemId) => {
    const toastId = toast.loading('Deleting item...');
    
    try {
      const token = localStorage.getItem('authorization');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.delete(`https://mall-munch-backend.onrender.com/foodcart/items/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      toast.update(toastId, {
        render: 'Item deleted successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });
      
      fetchItems();
    } catch (err) {
      console.error('Error deleting item:', err);
      toast.update(toastId, {
        render: err.response?.data?.message || 'Failed to delete item',
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
    }
  };

  if (loading) {
    return <div className="loading">Loading items...</div>;
  }

  return (
    <div className="add-food-container">
      <h2>Manage Menu Items</h2>
      
      <button onClick={handleAddClick} className="add-new-btn">
        Add New Item
      </button>
      
      <div className="items-list">
        {items.map(item => (
          <div key={item._id} className="item-card">
            <div className="item-info">
              <h3>{item.name}</h3>
              <p>${item.price.toFixed(2)}</p>
              <span className={`veg-indicator ${item.veg ? 'veg' : 'non-veg'}`}>
                {item.veg ? 'Veg' : 'Non-Veg'}
              </span>
            </div>
            <div className="item-actions">
              <button 
                onClick={() => handleEditClick(item)}
                className="edit-btn"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(item._id)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <h3>Edit Item</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price:</label>
                <input
                  type="number"
                  name="price"
                  value={editForm.price}
                  onChange={handleFormChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="veg"
                    checked={editForm.veg}
                    onChange={handleFormChange}
                  />
                  Vegetarian
                </label>
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn">Save</button>
                <button 
                  type="button" 
                  onClick={() => setEditingItem(null)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Item Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <h3>Add New Item</h3>
            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={addForm.name}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price:</label>
                <input
                  type="number"
                  name="price"
                  value={addForm.price}
                  onChange={handleFormChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="veg"
                    checked={addForm.veg}
                    onChange={handleFormChange}
                  />
                  Vegetarian
                </label>
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn">Add Item</button>
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFood;