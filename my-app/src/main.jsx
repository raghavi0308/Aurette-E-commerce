// import { BrowserRouter } from "react-router-dom";
// import App from "./App";
// <BrowserRouter>
//   <App />
// </BrowserRouter>


// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
// import './index.css'; // optional global styling

// Replace these with your actual credentials
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const AUTH0_DOMAIN = 'YOUR_AUTH0_DOMAIN';
const AUTH0_CLIENT_ID = 'YOUR_AUTH0_CLIENT_ID';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    >
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </Auth0Provider>
  </React.StrictMode>
);
