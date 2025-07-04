import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Validation patterns
  const patterns = {
    username: /^[a-zA-Z0-9_]{4,20}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[0-9]{10}$/,
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
        case 'phone':
          if (!patterns.phone.test(value)) {
            error = '10 digit phone number';
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
      const user = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      };

      const response = await axios.post('http://localhost:8080/user/register', user, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response) {
        throw new Error('Server is not responding');
      }
      
      alert('Registration successful! Please login.');
      navigate('/login');
      
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
      <div className="register-box">
        <h1 className="register-title">Welcome to Mall Munch</h1>
        <h2 className="register-subtitle">Register</h2>
        
        <form onSubmit={handleSubmit}>
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
              className={`form-input ${errors.username ? 'input-error' : ''}`}
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
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              required
              autoComplete="email"
            />
            {errors.email && (
              <p className="error-message">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={() => validateField('phone', formData.phone)}
              placeholder="Enter 10-digit phone number"
              className={`form-input ${errors.phone ? 'input-error' : ''}`}
              required
              autoComplete="tel"
            />
            {errors.phone && (
              <p className="error-message">{errors.phone}</p>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => validateField('password', formData.password)}
              placeholder="Enter password (min 8 characters)"
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              required
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="error-message">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={() => validateField('confirmPassword', formData.confirmPassword)}
              placeholder="Confirm your password"
              className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
              required
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="error-message">{errors.confirmPassword}</p>
            )}
          </div>

          <button 
            type="submit" 
            className="register-button"
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="login-redirect">
          Already have an account?{' '}
          <Link to="/login" className="login-link">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;