import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Profile.css';

const Profile = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    phone: '',
    joined: '',
    profilePic: ''
  });
  const [originalData, setOriginalData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    toast[type](message, {
      position: window.innerWidth <= 768 ? 'top-center' : 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      className: 'custom-toast',
    });
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authorization');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:8080/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const formattedData = {
          username: response.data.data.username,
          email: response.data.data.email,
          phone: response.data.data.phoneNumber || response.data.data.phone || '',
          joined: formatDate(response.data.data.joined),
          profilePic: response.data.data.profilePic || ''
        };

        setUserData(formattedData);
        setOriginalData(formattedData);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch profile');
        
        if (err.response?.status === 401) {
          localStorage.removeItem('authorization');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const validateForm = () => {
    const errors = {};
    
    if (!userData.username.trim()) {
      errors.username = 'Username is required';
    } else if (userData.username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!userData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (userData.phone && userData.phone.length < 10) {
      errors.phone = 'Phone number must be at least 10 digits';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditClick = () => {
    setOriginalData(userData);
    setIsEditing(true);
    setFormErrors({});
  };

  const handleCancel = () => {
    setUserData(originalData);
    setIsEditing(false);
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem('authorization');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.post(
        'http://localhost:8080/user/changer', 
        {
          username: userData.username,
          email: userData.email,
          phone: userData.phone
        }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setUserData(prev => ({
        ...prev,
        username: response.data.user?.username || userData.username,
        email: response.data.user?.email || userData.email,
        phone: response.data.user?.phone || userData.phone
      }));
      
      setIsEditing(false);
      setError(null);
      showToast(response.data.message || 'Profile updated successfully!');
    } catch (err) {
      console.error('Update error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update profile';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size should be less than 2MB', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'Mall_pro_pics');

    try {
      setUploading(true);
      const token = localStorage.getItem('authorization');
      
      const cloudinaryResponse = await axios.post(
        'https://api.cloudinary.com/v1_1/dmlwxgzq5/image/upload',
        formData
      );

      const backendResponse = await axios.post(
        'http://localhost:8080/user/updatepic',
        { 
          profilePic: cloudinaryResponse.data.secure_url,
          oldProfilePic: userData.profilePic
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setUserData(prev => ({
        ...prev,
        profilePic: backendResponse.data.profilePic
      }));
      
      showToast('Profile picture updated successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      showToast('Failed to upload profile picture', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authorization');
    navigate('/login');
    showToast('Logged out successfully');
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="profile-container">
      <ToastContainer
        position={window.innerWidth <= 768 ? 'top-center' : 'top-right'}
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
      
      <h1>Your Profile</h1>
      
      <div className="profile-picture-section">
        <label className="avatar-upload-label">
          <div className="avatar-container">
            {userData.profilePic ? (
              <img 
                src={userData.profilePic} 
                alt="Profile" 
                className="profile-picture"
              />
            ) : (
              <div className="default-avatar">
                <FaUser className="user-icon" />
              </div>
            )}
            {uploading && (
              <div className="uploading-overlay">
                Uploading...
              </div>
            )}
          </div>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileUpload}
            disabled={uploading}
            className="file-input"
          />
        </label>
        <p className="upload-hint">Click photo to change</p>
      </div>
      
      {isEditing ? (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={userData.username}
              onChange={handleInputChange}
              required
              className={formErrors.username ? 'error-input' : ''}
            />
            {formErrors.username && <span className="error-text">{formErrors.username}</span>}
          </div>
          
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleInputChange}
              required
              className={formErrors.email ? 'error-input' : ''}
            />
            {formErrors.email && <span className="error-text">{formErrors.email}</span>}
          </div>
          
          <div className="form-group">
            <label>Phone Number:</label>
            <input
              type="tel"
              name="phone"
              value={userData.phone}
              onChange={handleInputChange}
              className={formErrors.phone ? 'error-input' : ''}
            />
            {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
          </div>
          
          <div className="form-group">
            <label>Member Since:</label>
            <p>{userData.joined}</p>
          </div>
          
          <div className="button-group">
            <button type="submit" className="submit-btn">Save Changes</button>
            <button 
              type="button" 
              className="cancel-btn"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-info">
          <div className="info-item">
            <span className="info-label">Username:</span>
            <span className="info-value">{userData.username}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Email:</span>
            <span className="info-value">{userData.email}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Phone Number:</span>
            <span className="info-value">{userData.phone || 'Not provided'}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Member Since:</span>
            <span className="info-value">{userData.joined}</span>
          </div>
          
          <div className="profile-actions">
            <button 
              onClick={handleEditClick}
              className="edit-btn"
            >
              Edit Profile
            </button>
            <button 
              onClick={handleLogout}
              className="logout-btn"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;