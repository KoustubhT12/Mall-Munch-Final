import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiEye, FiEyeOff } from 'react-icons/fi';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

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
      
      toast.success('Registration successful! Please login.', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      navigate('/login');
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Registration failed';
      toast.error(`Error: ${errorMessage}`, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-screen">
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-app-title">Welcome to Mall Munch</h1>
          <h2 className="register-form-title">Create Account</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="register-form">
          {/* Username Field */}
          <div className="form-field">
            <label htmlFor="username" className="input-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={() => validateField('username', formData.username)}
              placeholder="e.g. foodlover123"
              className={`text-input ${errors.username ? 'input-error' : ''}`}
              required
              autoComplete="username"
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          {/* Email Field */}
          <div className="form-field">
            <label htmlFor="email" className="input-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => validateField('email', formData.email)}
              placeholder="your@email.com"
              className={`text-input ${errors.email ? 'input-error' : ''}`}
              required
              autoComplete="email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* Phone Field */}
          <div className="form-field">
            <label htmlFor="phone" className="input-label">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={() => validateField('phone', formData.phone)}
              placeholder="1234567890"
              className={`text-input ${errors.phone ? 'input-error' : ''}`}
              required
              autoComplete="tel"
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          {/* Password Field */}
          <div className="form-field">
            <label htmlFor="password" className="input-label">
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
                placeholder="••••••••"
                className={`text-input ${errors.password ? 'input-error' : ''}`}
                required
                autoComplete="new-password"
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {/* Confirm Password Field */}
          <div className="form-field">
            <label htmlFor="confirmPassword" className="input-label">
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
                placeholder="••••••••"
                className={`text-input ${errors.confirmPassword ? 'input-error' : ''}`}
                required
                autoComplete="new-password"
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={toggleConfirmPasswordVisibility}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-redirect">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;