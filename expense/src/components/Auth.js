import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import './Auth.css';

export default function Auth({ onNavigate }) {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
          setError('All fields are required');
          return;
        }
        const result = await signup(formData.name, formData.email, formData.password);
        if (result.success) {
          showToast('Signup successful! Welcome!');
          setTimeout(() => onNavigate && onNavigate('dashboard'), 1500);
        } else {
          setError(result.error);
        }
      } else {
        if (!formData.email.trim() || !formData.password.trim()) {
          setError('Email and password are required');
          return;
        }
        const result = await login(formData.email, formData.password);
        if (result.success) {
          showToast('Login successful!');
          setTimeout(() => onNavigate && onNavigate('dashboard'), 1500);
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass">
        <h2 className="auth-title">{isSignup ? 'Create Account' : 'Welcome Back'}</h2>

        {toast.show && <div className="toast toast-success">✓ {toast.message}</div>}
        {error && <div className="toast toast-error">✕ {error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignup && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="form-input"
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              className="form-input"
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (isSignup ? 'Creating Account...' : 'Logging in...') : (isSignup ? 'Sign Up' : 'Login')}
          </button>
        </form>

        <div className="auth-toggle">
          <span>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button
            type="button"
            className="toggle-btn"
            onClick={() => {
              setIsSignup(!isSignup);
              setFormData({ name: '', email: '', password: '' });
              setError('');
            }}
            disabled={loading}
          >
            {isSignup ? 'Login' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}
