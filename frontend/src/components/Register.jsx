import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleSignIn from './GoogleSignIn';

const Register = () => {
  const navigate = useNavigate();
  const { register, googleLogin } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setErrors({
        confirmPassword: 'Passwords do not match'
      });
      setLoading(false);
      return;
    }

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registrationData } = formData;
      await register(registrationData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.data?.details) {
        setErrors(err.response.data.details);
      } else {
        setErrors({
          general: err.response?.data?.message || 'Registration failed. Please try again.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      await googleLogin(response);
      navigate('/dashboard');
    } catch (err) {
      console.error('Google login error:', err);
      setErrors({
        general: err.response?.data?.message || 'Google login failed. Please try again.'
      });
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google sign-in error:', error);
    setErrors({
      general: 'Google sign-in failed. Please try again.'
    });
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Register</h2>
        {errors.general && (
          <div className="error-message">{errors.general}</div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter your full name"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && (
              <div className="field-error">{errors.name}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter your email"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && (
              <div className="field-error">{errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter your password"
              minLength="6"
              className={errors.password ? 'error' : ''}
            />
            {errors.password && (
              <div className="field-error">{errors.password}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Confirm your password"
              minLength="6"
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && (
              <div className="field-error">{errors.confirmPassword}</div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <GoogleSignIn
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />

        <div className="register-footer">
          <p>
            Already have an account?{' '}
            <a href="/login" className="link">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 