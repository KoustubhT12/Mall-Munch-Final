import { useState } from 'react';
import '../styles/ForgotPassword.css'; 
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Simple email validation
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Make GET request to check if email exists
      const response = await fetch(`http://localhost:8080/user/emailcheck?email=${encodeURIComponent(email)}`);
      
      if (response.ok) {
        // If email exists (200 response), navigate to /code
        navigate('/code', { state: { email } });
      } else {
        // If email doesn't exist, show alert
        alert('This email is not registered');
      }
    } catch (err) {
      console.error('Error checking email:', err);
      setError('An error occurred while checking your email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2 className="forgot-password-title">Forgot Password</h2>
        
        <p className="forgot-password-instructions">
          Enter your email address and we'll send you a One-Time Password (OTP) to reset your password.
        </p>
        
        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="Enter your registered email"
              disabled={isLoading}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className="send-otp-button"
            disabled={isLoading}
          >
            {isLoading ? 'Checking...' : 'Send OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;