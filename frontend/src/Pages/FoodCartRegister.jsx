import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../styles/Fregister.css';

const FoodCartRegister = () => {
  const [formData, setFormData] = useState({
    foodCartName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({
    foodCartName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Validation patterns
  const patterns = {
    foodCartName: /^[a-zA-Z0-9\s&'-]{3,50}$/,
    username: /^[a-zA-Z0-9_]{4,20}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  };

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

  const validateField = (name, value) => {
    let error = '';
    
    if (!value) {
      error = 'This field is required';
    } else {
      switch (name) {
        case 'foodCartName':
          if (!patterns.foodCartName.test(value)) {
            error = '3-50 characters (letters, numbers, spaces, &, \', -)';
          }
          break;
        case 'username':
          if (!patterns.username.test(value)) {
            error = '4-20 characters (letters, numbers, _)';
          }
          break;
        case 'email':
          if (!patterns.email.test(value)) {
            error = 'Please enter a valid email';
          }
          break;
        case 'password':
          if (!patterns.password.test(value)) {
            error = 'Min 8 chars with 1 upper, 1 lower, 1 number, 1 special';
          }
          break;
        case 'confirmPassword':
          if (value !== formData.password) {
            error = 'Passwords do not match';
          }
          break;
      }
    }
    
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    return !error;
  };

  const validateForm = () => {
    let isValid = true;
    
    Object.keys(formData).forEach(key => {
      if (!validateField(key, formData[key])) {
        isValid = false;
      }
    });
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const foodCart = {
        foodCartName: formData.foodCartName,
        username: formData.username,
        email: formData.email,
        password: formData.password
      };

      const response = await axios.post('http://localhost:8080/foodcart/register', foodCart, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response) {
        throw new Error('Server is not responding');
      }
      
      alert('Registration successful! Please login.');
      navigate('/foodcartLogin');
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Registration failed';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form-container">
        <div className="register-header">
          <h1 className="register-title">Welcome to Mall Munch</h1>
          <h2 className="register-subtitle">Food Cart Registration</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Food Cart Name */}
          <div className="form-group">
            <label htmlFor="foodCartName" className="form-label">
              Food Cart Name
            </label>
            <input
              type="text"
              id="foodCartName"
              name="foodCartName"
              value={formData.foodCartName}
              onChange={handleChange}
              onBlur={() => validateField('foodCartName', formData.foodCartName)}
              placeholder="Enter your food cart name"
              className={`form-input ${errors.foodCartName ? 'form-input-error' : ''}`}
              required
            />
            {errors.foodCartName && (
              <p className="error-message">{errors.foodCartName}</p>
            )}
          </div>

          {/* Username */}
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={() => validateField('username', formData.username)}
              placeholder="Enter username (4-20 characters)"
              className={`form-input ${errors.username ? 'form-input-error' : ''}`}
              required
              autoComplete="username"
            />
            {errors.username && (
              <p className="error-message">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => validateField('email', formData.email)}
              placeholder="Enter your email"
              className={`form-input ${errors.email ? 'form-input-error' : ''}`}
              required
              autoComplete="email"
            />
            {errors.email && (
              <p className="error-message">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => validateField('password', formData.password)}
                placeholder="Enter password (min 8 characters)"
                className={`form-input password-input ${errors.password ? 'form-input-error' : ''}`}
                required
                autoComplete="new-password"
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p className="error-message">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => validateField('confirmPassword', formData.confirmPassword)}
                placeholder="Confirm your password"
                className={`form-input password-input ${errors.confirmPassword ? 'form-input-error' : ''}`}
                required
                autoComplete="new-password"
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="error-message">{errors.confirmPassword}</p>
            )}
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="register-footer">
          Already have an account?{' '}
          <Link to="/foodcartLogin" className="register-link">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default FoodCartRegister;