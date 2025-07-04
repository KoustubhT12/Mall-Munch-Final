import { Outlet, useLocation, NavLink, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import '../styles/FoodCartDash.css';

const FoodCartDashboard = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // Remove the authorization token
    localStorage.removeItem('authorization');
    // Navigate to login page
    navigate('/foodcartLogin');
  };

  // Check for token when component mounts
  useEffect(() => {
    const token = localStorage.getItem('authorization');
    if (!token) {
      navigate('/foodcartLogin');
    }
  }, [navigate]);

  const navItems = [
    { name: 'Current Orders', icon: '📦', path: '' }, // Empty path for index
    { name: 'Past Orders', icon: '🕒', path: 'past-orders' },
    { name: 'Profile', icon: '👤', path: 'profile' },
    { name: 'Add Food', icon: '➕', path: 'add-food' },
    { name: 'Logout', icon: '🚪', path: 'logout', onClick: handleLogout },
  ];

  const mobileNavItems = navItems.slice(0, 4);

  return (
    <div className="dashboard-container">
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <div className="sidebar-header">
          <h1>FoodCart Dashboard</h1>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => (
              <li key={item.path || 'index'}>
                {item.path === 'logout' ? (
                  <button onClick={handleLogout} className="logout-button">
                    <span className="icon">{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                ) : (
                  <NavLink
                    to={item.path}
                    end={item.path === ''}
                    className={({isActive}) => isActive ? 'active' : ''}
                  >
                    <span className="icon">{item.icon}</span>
                    <span>{item.name}</span>
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-bottom-nav">
        <ul>
          {mobileNavItems.map((item) => (
            <li key={item.path || 'index'}>
              <NavLink
                to={item.path}
                end={item.path === ''}
                className={({isActive}) => isActive ? 'active' : ''}
              >
                <span className="icon">{item.icon}</span>
                <span>{item.path === '' ? 'Current' : item.name.split(' ')[0]}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
};

export default FoodCartDashboard;