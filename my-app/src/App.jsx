import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import './App.css';
import Carousel from './components/Carousel';
import NewArrivals from './components/NewArrivals';
import FeaturedCollections from './components/FeaturedCollections';
import Loved from './components/Loved';
import About from './components/About';
import TrustBanner from './components/TrustBanner';
import Footer from './components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import AppRoutes from './routes';

// Lazy load components
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const Tassels = lazy(() => import('./components/Tassels'));
const OversizedPockets = lazy(() => import('./components/OversizedPockets'));
const Customisation = lazy(() => import('./pages/Customisation'));
const ProductDescription = lazy(() => import('./pages/ProductDescription'));
const Cart = lazy(() => import('./pages/Cart'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Payment = lazy(() => import('./pages/Payment'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const Profile = lazy(() => import('./pages/Profile'));
const Orders = lazy(() => import('./pages/Orders'));
const Teeva = lazy(() => import('./pages/Teeva'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminOrdersView = lazy(() => import('./pages/AdminOrdersView'));

// Loading component
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const userRole = localStorage.getItem('userRole');
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  
  if (userRole !== 'admin' || !isAuthenticated) {
    return <Navigate to="/admin/login" />;
  }
  
  return children;
};

// Public Route Component (only accessible when logged out)
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/" />;
  }
  
  return children;
};

const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || 
                    location.pathname === '/register' || 
                    location.pathname === '/admin/login';

  // If not logged in and not on an auth page, redirect to login
  if (!user && !isAuthPage) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      {!isAuthPage && <Navbar />}
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes (Login/Register) */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Protected Routes (Require Login) */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/shop" element={<ProtectedRoute><Shop /></ProtectedRoute>} />
          <Route path="/tassels" element={<ProtectedRoute><Tassels /></ProtectedRoute>} />
          <Route path="/oversized-pockets" element={<ProtectedRoute><OversizedPockets /></ProtectedRoute>} />
          <Route path="/customisation" element={<ProtectedRoute><Customisation /></ProtectedRoute>} />
          <Route path="/product/:slug" element={<ProtectedRoute><ProductDescription /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/teeva" element={<ProtectedRoute><Teeva /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminOrdersView />
              </AdminRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
      {!isAuthPage && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ShopProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="app-container">
              <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                style={{ zIndex: 999999 }}
              />
              <AppContent />
            </div>
          </WishlistProvider>
        </CartProvider>
      </ShopProvider>
    </AuthProvider>
  );
};

export default App;