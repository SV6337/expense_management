import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import './Profile.css';

export default function Profile({ onNavigate }) {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [errors, setErrors] = useState({});

  // Initialize form with current user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  // Password verification state
  const [passwordVerification, setPasswordVerification] = useState({ status: null, isVerifying: false });

  // Debounced password verification effect
  useEffect(() => {
    if (!formData.oldPassword.trim()) {
      setPasswordVerification({ status: null, isVerifying: false });
      return;
    }

    const timer = setTimeout(async () => {
      setPasswordVerification(prev => ({ ...prev, isVerifying: true }));
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/v1/auth/verify-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ password: formData.oldPassword })
        });
        const data = await response.json();

        if (!response.ok) {
          setPasswordVerification({ status: 'error', isVerifying: false });
          return;
        }

        setPasswordVerification({
          status: data.isCorrect ? 'correct' : 'incorrect',
          isVerifying: false
        });
      } catch (err) {
        setPasswordVerification({ status: 'error', isVerifying: false });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [formData.oldPassword]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const wantsPasswordChange = Boolean(
      formData.oldPassword.trim() ||
      formData.newPassword.trim() ||
      formData.confirmPassword.trim()
    );

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Only validate password fields when the user is actually changing the password.
    if (wantsPasswordChange && (formData.newPassword.trim() || formData.confirmPassword.trim())) {
      if (!formData.oldPassword.trim()) {
        newErrors.oldPassword = 'Old password is required to set a new password';
      } else if (passwordVerification.status !== 'correct') {
        newErrors.oldPassword = 'Please verify your current password first';
      }

      if (!formData.newPassword.trim()) {
        newErrors.newPassword = 'New password is required';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'New password must be at least 6 characters';
      }

      if (!formData.confirmPassword.trim()) {
        newErrors.confirmPassword = 'Please confirm your new password';
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        name: formData.name,
        email: formData.email
      };

      // Include password fields if user is changing password
      if (formData.newPassword.trim()) {
        updateData.oldPassword = formData.oldPassword;
        updateData.newPassword = formData.newPassword;
      }

      const result = await updateProfile(updateData);

      if (result.success) {
        showToast('Profile updated successfully!', 'success');
        setFormData(prev => ({ ...prev, oldPassword: '', newPassword: '', confirmPassword: '' }));
      } else {
        showToast(result.error || 'Failed to update profile', 'error');
      }
    } catch (err) {
      showToast(err.message || 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card glass">
        <h2 className="profile-title">Edit Profile</h2>

        {toast.show && (
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' && '✓'} {toast.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={`form-input ${errors.name ? 'error' : ''}`}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={`form-input ${errors.email ? 'error' : ''}`}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="oldPassword">Current Password</label>
            <input
              type="password"
              id="oldPassword"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              placeholder="Enter your current password"
              className={`form-input ${errors.oldPassword ? 'error' : ''}`}
            />

            <div className="password-status">
              {passwordVerification.isVerifying && (
                <span className="status-verifying">⟳ Verifying...</span>
              )}
              {passwordVerification.status === 'correct' && (
                <span className="status-correct">✓ Password correct</span>
              )}
              {passwordVerification.status === 'incorrect' && (
                <span className="status-incorrect">✗ Password incorrect</span>
              )}
              {passwordVerification.status === 'error' && (
                <span className="status-error">⚠ Verification error</span>
              )}
            </div>
            {errors.oldPassword && <span className="error-text">{errors.oldPassword}</span>}
          </div>

          {/* Only show new password fields if old password is verified */}
          {passwordVerification.status === 'correct' && (
            <>
              {/* New Password Field */}
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter your new password"
                  className={`form-input ${errors.newPassword ? 'error' : ''}`}
                />
                {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
                <small className="password-hint">Minimum 6 characters</small>
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onNavigate && onNavigate('dashboard')}
              disabled={loading}
            >
              Back to Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
