import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';

const GoogleSignIn = ({ onSuccess, onError }) => {
  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        // Get user info from Google
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${response.access_token}` }
        }).then(res => res.json());

        // Pass both the access token and user info
        onSuccess({
          access_token: response.access_token,
          user: userInfo
        });
      } catch (error) {
        console.error('Error fetching Google user info:', error);
        onError(error);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      onError(error);
    },
    flow: 'implicit',
    scope: 'email profile'
  });

  return (
    <button
      onClick={() => login()}
      className="google-sign-in-btn"
      style={{
        width: 'auto',
        minWidth: '200px',
        maxWidth: '100%',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        '&:hover': {
          backgroundColor: '#f5f5f5'
        }
      }}
    >
      <img
        src="https://www.google.com/favicon.ico"
        alt="Google"
        style={{ width: '18px', height: '18px' }}
      />
      Sign in with Google
    </button>
  );
};

export default GoogleSignIn; 