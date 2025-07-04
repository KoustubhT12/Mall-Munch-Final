import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Flogin.css';

const FoodCartLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({
    username: '',
    password: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setFormData({
      username: '',
      password: ''
    });
    
    const clearInputs = () => {
      const usernameInput = document.getElementById('username');
      const passwordInput = document.getElementById('password');
      
      if (usernameInput) usernameInput.value = '';
      if (passwordInput) passwordInput.value = '';
    };

    clearInputs();
    const timer = setTimeout(clearInputs, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      username: '',
      password: ''
    };
    let isValid = true;
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await axios.post('https://mall-munch-backend.onrender.com/foodcart/login', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response) {
        throw new Error('Server is not responding');
      }
      
      localStorage.setItem('authorization', response.data.token);
      navigate('/foodcart-dashboard');
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Login failed';
      setErrors({
        username: 'Invalid credentials',
        password: 'Invalid credentials'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Welcome to Mall Munch</h1>
          <h2 className="login-subtitle">Food Cart Login</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
          <div className="form-group">
            <label htmlFor="username" className="input-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className={`text-input ${errors.username ? 'input-error' : ''}`}
              required
              autoComplete="new-username"
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="input-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={`text-input ${errors.password ? 'input-error' : ''}`}
              required
              autoComplete="new-password"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="register-link">
          Don't have an account?{' '}
          <Link to="/foodcartRegister" className="text-orange-500 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FoodCartLogin;