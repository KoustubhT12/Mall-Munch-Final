import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import "../styles/Landing.css"; 

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authorization');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="app-title">MALL MUNCH</h1>
          <p className="app-slogan">Streamlined food ordering for modern malls</p>
          
          <div className="cta-buttons">
            <button 
              className="cta-btn explore-btn"
              onClick={() => document.getElementById('options-section').scrollIntoView({ behavior: 'smooth' })}
            >
              EXPLORE PLATFORM
            </button>
          </div>
        </div>
        <div className="hero-image"></div>
      </section>

      {/* Options Section */}
      <section id="options-section" className="options-section">
        <div className="section-header">
          <h2>GET STARTED</h2>
          <div className="header-divider"></div>
        </div>
        
        <div className="user-options">
          <div className="option-card">
            <div className="option-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <h3>PATRONS</h3>
            <p>Browse and order from food vendors with our seamless platform</p>
            <div className="option-buttons">
              <button onClick={() => navigate('/register')} className="option-btn signup-btn">
                REGISTER
              </button>
              <button onClick={() => navigate('/login')} className="option-btn login-btn">
                LOGIN
              </button>
            </div>
          </div>

          <div className="option-card">
            <div className="option-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3v18h18V3H3zm8 16H5v-6h6v6zm0-8H5V5h6v6zm8 8h-6v-6h6v6zm0-8h-6V5h6v6z"/>
              </svg>
            </div>
            <h3>VENDORS</h3>
            <p>Manage your food business and reach more customers</p>
            <div className="option-buttons">
              <button onClick={() => navigate('/FoodcartRegister')} className="option-btn signup-btn">
                REGISTER
              </button>
              <button onClick={() => navigate('/FoodcartLogin')} className="option-btn login-btn">
                LOGIN
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>PLATFORM ADVANTAGES</h2>
          <div className="header-divider"></div>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
              </svg>
            </div>
            <h3>EFFICIENCY</h3>
            <p>Reduce wait times with our optimized ordering system</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                <path d="M12 17c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2s-2 .9-2 2v6c0 1.1.9 2 2 2zm-1-8h2v6h-2z"/>
              </svg>
            </div>
            <h3>ANALYTICS</h3>
            <p>Real-time data insights for better business decisions</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"/>
              </svg>
            </div>
            <h3>RELIABILITY</h3>
            <p>Enterprise-grade infrastructure with 99.9% uptime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">MALL MUNCH</div>
          <div className="footer-info">
            <p>A modern food ordering platform for shopping malls</p>
            <p>Developed by Koustubh Thakare</p>
            <p>MCA, Sardar Patel Institute of Technology</p>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} MALL MUNCH. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;