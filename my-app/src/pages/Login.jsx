import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth0 } from '@auth0/auth0-react';
// import TasselsNavbar from '../components/TasselsNavbar';
import ForgotPassword from '../components/ForgotPassword';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithRedirect } = useAuth0();
  const { login, register, error: authError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    // lastName: '' // Remove lastName from state
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load saved credentials on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('savedCredentials');
    if (savedCredentials) {
      const { email, password } = JSON.parse(savedCredentials);
      setFormData(prev => ({
        ...prev,
        email,
        password
      }));
      setRememberMe(true);
    }
  }, []);

  // Update error state when authError changes
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit triggered', { isLogin });
    setError('');
    setLoading(true);

    // Frontend validation checks (add more specific logs here if needed)
    if (!isLogin) { // Registration form validation
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        console.log('Frontend validation failed: Passwords do not match');
        return;
      }
      // Add other registration specific validations here if needed
      if (!formData.firstName.trim()) {
        setError('Please enter your first name.');
        setLoading(false);
        return;
      }

    }

    try {
      console.log('Attempting API call...', { endpoint: isLogin ? '/api/auth/login' : '/api/auth/register' });
      const user = isLogin
        ? await login(formData.email, formData.password)
        // Pass only firstName, email, password for registration
        : await register(formData.firstName, formData.email, formData.password);
      if (rememberMe) {
        localStorage.setItem('savedCredentials', JSON.stringify({
          email: formData.email,
          password: formData.password
        }));
      } else {
        localStorage.removeItem('savedCredentials');
      }
      
      // Get the return path from location state or default to home
      const returnPath = location.state?.from || '/';
      navigate(returnPath);
    } catch (err) {
      console.error('Caught error in handleSubmit:', err);
      setError(err.response?.data?.message || 'An unexpected error occurred.');
      // Clear password field on failed login
      setFormData(prev => ({
        ...prev,
        password: ''
      }));
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      // lastName: '' // Remove lastName from state reset
    });
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log('Google login successful:', credentialResponse);
      navigate('/');
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
  };

  const handleFacebookLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        connection: 'facebook'
      }
    });
  };

  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    setShowForgotPassword(true);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-content">
          <div className="login-header">
            <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
            <p>{isLogin ? 'Sign in to your account' : 'Join us and start shopping'}</p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="login-form">
            {!isLogin && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Enter your first name"
                  />
                </div>
                {/* Remove Last Name field */}
                {/* <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div> */}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
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
                required
                placeholder="Enter your password"
                minLength="6"
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {isLogin && (
              <div className="form-options">
                <label className="remember-me">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={handleRememberMeChange}
                  />
                  <span>Remember me</span>
                </label>
                <a href="#" className="forgot-password" onClick={handleForgotPasswordClick}>
                  Forgot Password?
                </a>
              </div>
            )}
            
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Logging in...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>

            <div className="form-footer">
              <p>
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <button type="button" className="toggle-form-btn" onClick={toggleForm}>
                  {isLogin ? 'Create Account' : 'Sign In'}
                </button>
              </p>
            </div>
          </form>
          
          <div className="social-login">
            <p>Or continue with</p>
            <div className="social-buttons">
              <button 
                className="social-btn google"
                onClick={() => {
                  const googleButton = document.querySelector('.google-btn');
                  if (googleButton) {
                    googleButton.click();
                  }
                }}
              >
                <i className="fab fa-google"></i>
                Google
              </button>
              <button 
                className="social-btn facebook"
                onClick={handleFacebookLogin}
              >
                <i className="fab fa-facebook-f"></i>
                Facebook
              </button>
            </div>
            <div style={{ display: 'none' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="filled_blue"
                shape="rectangular"
                text="continue_with"
                locale="en"
                width="100%"
                type="standard"
                size="large"
                logo_alignment="left"
                context="signin"
                ux_mode="popup"
              />
            </div>
          </div>
        </div>
      </div>
      {showForgotPassword && (
        <ForgotPassword onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
};

export default Login; 