import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  BarChart3,
  PiggyBank,
  User,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/expenses', label: 'Expenses', icon: Receipt },
  { path: '/add-expense', label: 'Add Expense', icon: PlusCircle },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/budget', label: 'Budget', icon: PiggyBank },
  { path: '/profile', label: 'Profile', icon: User },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose}></div>}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-logo-wrap">
              <img src={logoImg} alt="CoinOrbit Logo" className="brand-logo-image" />
            </div>
            <div className="brand-text">
              <h2 className="brand-name">CoinOrbit</h2>
              <span className="brand-tagline">Smart Expense Tracker</span>
            </div>
          </div>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close Sidebar">
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-user-preview">
          <div className="user-avatar-initial">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-preview-info">
            <span className="user-preview-name">{user?.name || 'User'}</span>
            <span className="user-preview-email">{user?.email || 'user@example.com'}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path} className="nav-item">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <Icon size={20} className="nav-icon" />
                    <span className="nav-text">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={logout} className="logout-button">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
