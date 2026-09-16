import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Mic, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const greeting = getGreeting();
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <button
          className="mobile-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={24} />
        </button>
        <div className="navbar-greeting">
          <h2 className="greeting-text">
            {greeting}, <span className="greeting-user">{user?.name || 'Friend'}</span>
          </h2>
          <span className="current-date-badge">{todayFormatted}</span>
        </div>
      </div>

      <div className="navbar-right">
        <Link to="/add-expense?mode=voice" className="quick-action-btn voice-btn" title="Voice Expense Entry">
          <Mic size={18} />
          <span className="btn-text-desktop">Voice Add</span>
        </Link>
        <Link to="/add-expense" className="quick-action-btn primary-btn" title="Add Expense">
          <Plus size={18} />
          <span className="btn-text-desktop">Add Expense</span>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
