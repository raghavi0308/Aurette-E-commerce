import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  console.log('Profile component render:', {
    loading,
    hasUser: !!user,
    userEmail: user?.email,
    userName: user?.name
  });

  const getAvatarUrl = useCallback((avatar) => {
    if (!avatar) return 'https://via.placeholder.com/150';
    if (avatar.startsWith('http')) return avatar;
    return `http://localhost:5000/${avatar.replace(/^\/+/, '')}?t=${Date.now()}`;
  }, []);

  const avatarUrl = useMemo(() => getAvatarUrl(user?.avatar), [getAvatarUrl, user?.avatar]);

  const handleAvatarChange = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await axios.post('http://localhost:5000/api/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.data.avatar) {
        const updatedUser = { ...user, avatar: response.data.avatar };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.location.reload(); // Reload to refresh the user data
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar. Please try again.');
    }
  }, [user]);

  if (loading) {
    console.log('Profile is loading');
    return (
      <div className="profile-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    console.log('No user data, redirecting to login');
    navigate('/login');
    return null;
  }

  console.log('Rendering profile with user data:', {
    name: user.name,
    email: user.email,
    avatar: user.avatar
  });

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile</h1>
      </div>
      <div className="profile-content">
        <div className="profile-avatar">
          <img
            src={avatarUrl}
            alt="Profile"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/150';
            }}
            crossOrigin="anonymous"
          />
          <input
            type="file"
            id="avatar-input"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />
          <label htmlFor="avatar-input" className="avatar-upload-btn">
            Change Avatar
          </label>
        </div>
        <div className="profile-details">
          <div className="profile-field">
            <label>Name:</label>
            <p>{user.name}</p>
          </div>
          <div className="profile-field">
            <label>Email:</label>
            <p>{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 