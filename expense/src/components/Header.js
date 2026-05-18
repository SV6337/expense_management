import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import './Header.css';

export default function Header({ onNavigate }) {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    if (onNavigate) onNavigate('dashboard');
  };

  const handleEditProfile = () => {
    setShowDropdown(false);
    if (onNavigate) onNavigate('profile');
  };

  // Get user avatar initials
  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-logo">E &gt; P Expense Tracker</h1>
      </div>

      <div className="header-right">
        {user ? (
          <div className="user-nav" ref={dropdownRef}>
            <button
              className="user-trigger"
              onClick={() => setShowDropdown(!showDropdown)}
              aria-label="User menu"
            >
              <div className="avatar">{getInitials(user.name)}</div>
              <span className="user-name">{user.name}</span>
            </button>

            {showDropdown && (
              <div className="dropdown-menu glass">
                <button className="dropdown-item" onClick={handleEditProfile}>
                  ✎ Edit Profile
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  ⎋ Logout
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}
