import React, { useState } from 'react';
import './ForgotPassword.css';

const ForgotPassword = ({ onClose }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // TODO: Replace with actual API call
    try {
      // Simulate API call to send OTP
      console.log('Sending OTP to:', email);
      // In real implementation, call your backend API here
      setStep(2);
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // TODO: Replace with actual API call
    try {
      // Simulate OTP verification
      console.log('Verifying OTP:', otp);
      // In real implementation, verify OTP with your backend
      setStep(3);
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // TODO: Replace with actual API call
    try {
      // Simulate password reset
      console.log('Resetting password for:', email);
      // In real implementation, call your backend API to reset password
      onClose(); // Close the modal after successful password reset
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    }
  };

  return (
    <div className="forgot-password-modal">
      <div className="forgot-password-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <h2>Reset Password</h2>
        
        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            <button type="submit" className="submit-btn">Send OTP</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit}>
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="Enter the OTP sent to your email"
                maxLength="6"
              />
            </div>
            <button type="submit" className="submit-btn">Verify OTP</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
              />
            </div>
            <button type="submit" className="submit-btn">Reset Password</button>
          </form>
        )}

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword; 