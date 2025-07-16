import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft } from 'react-icons/fi';
import '../styles/login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const passwordRef = useRef(null);

  useEffect(() => {
    // Reset form state
    setFormData({
      username: '',
      password: ''
    });

    // Clear the password input directly using the ref
    if (passwordRef.current) {
      passwordRef.current.value = '';
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        'https://mall-munch-backend.onrender.com/user/login',
        {
          username: formData.username,
          password: formData.password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      localStorage.setItem('authorization', response.data.token);
      navigate('/Foodcart');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Login failed';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <button 
        onClick={() => navigate('/')}
        className="home-button"
        aria-label="Go back to home"
      >
        <FiArrowLeft className="arrow-icon" />
        <span className="sr-only">Home</span>
      </button>
      
      <div className="login-box">
        <h1 className="login-title">Welcome to Mall Munch</h1>
        <h2 className="login-subtitle">Login</h2>
        
        <form onSubmit={handleSubmit}>
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
              placeholder="Enter your username"
              className="form-input"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              ref={passwordRef}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="form-input"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="forgot-password">
            <Link 
              to="/forgot-password" 
              className="forgot-password-link"
            >
              Forgot Password?
            </Link>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                <span>Logging in...</span>
              </>
            ) : 'Login'}
          </button>
        </form>

        <p className="register-text">
          Haven't registered yet?{' '}
          <Link to="/register" className="register-link">
            Click here to register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;