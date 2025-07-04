import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Fprofile.css';

const Fprofile = () => {
  const [foodcartData, setFoodcartData] = useState({
    name: '',
    username: '',
    email: '',
    image: ''
  });
  const [originalData, setOriginalData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authorization');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('https://mall-munch-backend.onrender.com/foodcart/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const profileData = {
        name: response.data.name,
        username: response.data.username,
        email: response.data.email,
        image: response.data.image || ''
      };

      setFoodcartData(profileData);
      setOriginalData(profileData);
    } catch (err) {
      console.error('Profile fetch error:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('authorization');
        navigate('/login');
      }
      toast.error('Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  const validateForm = () => {
    const errors = {};
    
    if (!foodcartData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!foodcartData.username.trim()) {
      errors.username = 'Username is required';
    }

    if (!foodcartData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(foodcartData.email)) {
      errors.email = 'Invalid email format';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFoodcartData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setFoodcartData(originalData);
      setFormErrors({});
    } else {
      setOriginalData(foodcartData);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('authorization');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.put(
        'https://mall-munch-backend.onrender.com/foodcart/update-profile',
        {
          name: foodcartData.name,
          username: foodcartData.username,
          email: foodcartData.email
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const updatedData = {
        ...foodcartData,
        name: response.data.name,
        username: response.data.username,
        email: response.data.email
      };

      setFoodcartData(updatedData);
      setOriginalData(updatedData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Update error:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const extractPublicId = (url) => {
    if (!url) return null;
    try {
      // Remove version number if present (v1234567/)
      const withoutVersion = url.replace(/\/v\d+\//, '/');
      const parts = withoutVersion.split('/');
      // Get the last part (filename without extension)
      const filename = parts[parts.length - 1];
      // Remove file extension
      return filename.split('.')[0];
    } catch (e) {
      console.error("Error parsing URL:", e);
      return null;
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const token = localStorage.getItem('authorization');
      if (!token) {
        navigate('/login');
        return;
      }

      // Show uploading toast
      const toastId = toast.loading('Uploading image...');

      // 1. First delete old image if exists
      if (foodcartData.image) {
        const oldPublicId = extractPublicId(foodcartData.image);
        if (oldPublicId) {
          try {
            await axios.post(
              'https://mall-munch-backend.onrender.com/foodcart/deleteimage',
              { publicId: oldPublicId },
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );
          } catch (deleteError) {
            console.error('Error deleting old image:', deleteError);
            // Continue with upload even if delete fails
          }
        }
      }

      // 2. Upload new image
      const uploadForm = new FormData();
      uploadForm.append('file', file);
      uploadForm.append('upload_preset', 'foodcart_covers');

      const cloudinaryResponse = await axios.post(
        'https://api.cloudinary.com/v1_1/dmlwxgzq5/image/upload',
        uploadForm
      );

      // 3. Update backend with new image URL
      await axios.put(
        'https://mall-munch-backend.onrender.com/foodcart/update-image',
        { image: cloudinaryResponse.data.secure_url },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // 4. Refetch profile to get updated data
      await fetchProfile();
      
      toast.update(toastId, {
        render: 'Cover image updated successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to upload cover image');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;

  return (
    <div className="fprofile-container">
      <h1>Foodcart Profile</h1>
      
      <div className="cover-section">
        <div className="cover-image-container">
          {foodcartData.image ? (
            <img 
              src={foodcartData.image} 
              alt="Cover" 
              className="cover-image"
            />
          ) : (
            <div className="default-cover">
              <span>No cover image</span>
            </div>
          )}
          <label className="upload-btn">
            {uploading ? 'Uploading...' : 'Change Cover Image'}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleCoverUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>
      
      <div className="profile-info">
        <div className="info-item">
          <span className="info-label">Name:</span>
          {isEditing ? (
            <div className="edit-field">
              <input
                type="text"
                name="name"
                value={foodcartData.name}
                onChange={handleInputChange}
                className={formErrors.name ? 'error' : ''}
              />
              {formErrors.name && <span className="error-message">{formErrors.name}</span>}
            </div>
          ) : (
            <span className="info-value">{foodcartData.name}</span>
          )}
        </div>
        
        <div className="info-item">
          <span className="info-label">Username:</span>
          {isEditing ? (
            <div className="edit-field">
              <input
                type="text"
                name="username"
                value={foodcartData.username}
                onChange={handleInputChange}
                className={formErrors.username ? 'error' : ''}
              />
              {formErrors.username && <span className="error-message">{formErrors.username}</span>}
            </div>
          ) : (
            <span className="info-value">{foodcartData.username}</span>
          )}
        </div>
        
        <div className="info-item">
          <span className="info-label">Email:</span>
          {isEditing ? (
            <div className="edit-field">
              <input
                type="email"
                name="email"
                value={foodcartData.email}
                onChange={handleInputChange}
                className={formErrors.email ? 'error' : ''}
              />
              {formErrors.email && <span className="error-message">{formErrors.email}</span>}
            </div>
          ) : (
            <span className="info-value">{foodcartData.email}</span>
          )}
        </div>
      </div>

      <div className="action-buttons">
        {isEditing ? (
          <>
            <button onClick={handleSave} className="save-btn">Save Changes</button>
            <button onClick={handleEditToggle} className="cancel-btn">Cancel</button>
          </>
        ) : (
          <button onClick={handleEditToggle} className="edit-btn">Edit Profile</button>
        )}
      </div>
    </div>
  );
};

export default Fprofile;