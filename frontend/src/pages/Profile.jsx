import React from 'react';
import { User, Mail, Calendar, ShieldCheck, LogOut, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();

  const formattedJoinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div className="profile-page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">User Profile</h1>
          <p className="page-subtitle">Manage your account details and security settings</p>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-banner">
          <div className="profile-avatar-large">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-title-row">
            <div>
              <h2 className="profile-name">{user?.name}</h2>
              <span className="profile-badge">
                <ShieldCheck size={14} /> Verified Account
              </span>
            </div>
            <button onClick={logout} className="btn btn-outline text-danger">
              <LogOut size={16} /> Logout
            </button>
          </div>

          <div className="profile-info-grid">
            <div className="info-item">
              <span className="info-label">
                <User size={16} /> Full Name
              </span>
              <span className="info-value">{user?.name}</span>
            </div>

            <div className="info-item">
              <span className="info-label">
                <Mail size={16} /> Email Address
              </span>
              <span className="info-value">{user?.email}</span>
            </div>

            <div className="info-item">
              <span className="info-label">
                <Calendar size={16} /> Account Created
              </span>
              <span className="info-value">{formattedJoinDate}</span>
            </div>

            <div className="info-item">
              <span className="info-label">
                <Award size={16} /> Security Status
              </span>
              <span className="info-value text-success">
                JWT Protected • Bcrypt Encrypted
              </span>
            </div>
          </div>

          <div className="profile-security-notice">
            <ShieldCheck size={20} className="text-primary" />
            <div>
              <h4>Security Notice</h4>
              <p>
                Your passwords are never stored in plain text. All records are secured using industry-standard salted bcryptjs hashes and JSON Web Tokens.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
