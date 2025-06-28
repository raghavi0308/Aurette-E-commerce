import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { cartService, wishlistService, productService } from '../services/api';

const ShopContext = createContext();

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

export const ShopProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { user } = useAuth();
  const [shopLoading, setShopLoading] = useState(true);
  const [shopError, setShopError] = useState(null);

  // Load cart and wishlist from localStorage on initial mount
  useEffect(() => {
    const loadLocalData = () => {
      try {
        const savedCart = localStorage.getItem('cartItems');
        const savedWishlist = localStorage.getItem('wishlistItems');
        const savedCategory = localStorage.getItem('selectedCategory');
        
        console.log('Loading from localStorage - savedCart:', savedCart);
        
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          if (parsedCart && parsedCart.length > 0) {
            console.log('Setting cart items from localStorage:', parsedCart);
            setCartItems(parsedCart);
          }
        }
        if (savedWishlist) {
          const parsedWishlist = JSON.parse(savedWishlist);
          if (parsedWishlist && parsedWishlist.length > 0) {
            setWishlistItems(parsedWishlist);
          }
        }
        if (savedCategory) {
          setSelectedCategory(JSON.parse(savedCategory));
        }
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    };

    loadLocalData();
  }, []);

  // Save cart and wishlist to localStorage when they change
  useEffect(() => {
    try {
      console.log('Saving cart items to localStorage:', cartItems);
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
      localStorage.setItem('selectedCategory', JSON.stringify(selectedCategory));
      const total = getCartTotal();
      localStorage.setItem('cartTotal', total.toString());
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [cartItems, wishlistItems, selectedCategory]);

  // Fetch data from backend when user is authenticated
  useEffect(() => {
    const fetchData = async () => {
      setShopLoading(true);
      setShopError(null);
      
      if (user) {
        try {
          const [cartResponse, wishlistResponse] = await Promise.all([
            cartService.getCart(),
            wishlistService.getWishlist()
          ]);
          
          if (cartResponse.data && cartResponse.data.length > 0) {
            const formattedCart = cartResponse.data.map(item => ({
              ...item,
              id: item.product?._id || item.product?.id || item._id || item.id,
              price: item.product?.price?.toString() || item.price?.toString() || 'N/A',
              image: item.product?.image || item.image,
              name: item.product?.name || item.name,
              category: item.product?.category || item.category
            }));
            console.log('Fetched cart from backend:', formattedCart);
            setCartItems(formattedCart);
          }
          
          if (wishlistResponse.data && wishlistResponse.data.length > 0) {
            setWishlistItems(wishlistResponse.data);
          }
        } catch (error) {
          console.error('Error fetching cart/wishlist from backend:', error);
          setShopError('Failed to load cart and wishlist.');
          // Keep existing items from localStorage if fetch fails
        }
      }
      
      setShopLoading(false);
    };

    fetchData();
  }, [user]);

  // Category functions
  const setCategory = (category) => {
    setSelectedCategory(category);
  };

  const clearCategory = () => {
    setSelectedCategory(null);
  };

  const getProductsByCategory = (categoryId) => {
    return wishlistItems.filter(item => item.category?._id === categoryId);
  };

  const addToCart = (product) => {
    try {
      const itemSlug = product.slug;
      if (!itemSlug) {
        return;
      }

      // Format the product data
      const formattedProduct = {
        ...product,
        slug: itemSlug,
        price: product.price?.toString() || 'N/A',
        image: product.image?.startsWith('http') 
          ? product.image 
          : `/images/products/${product.image.split('/').pop()}`
      };

      // Add to cart without removing from wishlist
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.slug === itemSlug);
        const newItems = existingItem
          ? prevItems.map(item =>
              item.slug === itemSlug
                ? { ...item, quantity: (item.quantity || 0) + 1 }
                : item
            )
          : [...prevItems, { ...formattedProduct, quantity: 1 }];
        
        return newItems;
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (productSlug) => {
    try {
      // Update frontend state first
      setCartItems(prevItems => {
        const newItems = prevItems.filter(item => item.slug !== productSlug);
        // Update localStorage immediately
        localStorage.setItem('cartItems', JSON.stringify(newItems));
        return newItems;
      });

      if (user) {
        await cartService.removeFromCart(productSlug);
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const updateCartItemQuantity = async (productSlug, quantity) => {
    try {
      if (quantity < 1) {
        removeFromCart(productSlug);
        return;
      }
      
      setCartItems(prevItems => {
        const newItems = prevItems.map(item =>
          item.slug === productSlug ? { ...item, quantity } : item
        );
        return newItems;
      });

      if (user) {
        await cartService.updateQuantity(productSlug, quantity);
      }
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    }
  };

  const addToWishlist = async (product) => {
    // Handle both backend and frontend product structures
    const formattedProduct = {
      ...product,
      slug: product.slug,
      id: product._id || product.id,
      image: product.image?.startsWith('http') 
        ? product.image 
        : `/images/products/${product.image.split('/').pop()}`
    };

    // Check if product is already in wishlist
    const isCurrentlyInWishlist = isInWishlist(formattedProduct.id);

    // Update backend first if user is logged in
    if (user) {
      try {
        // For JSON products, we'll use the slug as the identifier
        const productId = product._id || product.slug;
        if (!productId) {
          console.error('Product missing both _id and slug:', product);
          throw new Error('Product identifier is missing');
        }
        
        console.log('Attempting to update wishlist with product:', { 
          productId, 
          product,
          isCurrentlyInWishlist,
          user: user._id
        });

        // Only try to find in database if we have a MongoDB _id
        if (product._id) {
          try {
            
            if (isCurrentlyInWishlist) {
              await wishlistService.removeFromWishlist(product._id);
            }
            
            else {
              await wishlistService.addToWishlist(product._id);
            }
            
          } catch (error) {
            console.error('Error updating wishlist via backend:', error);
            setShopError(error.response?.data?.message || error.message || 'Failed to update wishlist.');
            return;
          }
        } else {
          // For JSON products, just update the frontend state
          console.log('JSON product detected, updating frontend state only');
        }
      } catch (error) {
        console.error('Error updating wishlist via backend:', {
          error: error,
          response: error.response?.data,
          status: error.response?.status,
          product: product,
          user: user._id
        });
        setShopError(error.response?.data?.message || error.message || 'Failed to update wishlist.');
        return; // Don't update frontend state if backend update fails
      }
    } else {
      // If user is not logged in, just update local storage
      console.log('User not logged in, updating local storage only');
    }

    // Update frontend state
    setWishlistItems(prevItems => {
      if (isCurrentlyInWishlist) {
        return prevItems.filter(item => 
          item.id !== formattedProduct.id && item.slug !== formattedProduct.slug
        );
      } else {
        return [...prevItems, formattedProduct];
      }
    });

    // Update localStorage
    try {
      const updatedWishlist = isCurrentlyInWishlist
        ? wishlistItems.filter(item => 
            item.id !== formattedProduct.id && item.slug !== formattedProduct.slug
          )
        : [...wishlistItems, formattedProduct];
      localStorage.setItem('wishlistItems', JSON.stringify(updatedWishlist));
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
  };

  const removeFromWishlist = async (productId) => {
    // Find the product in the wishlist
    const product = wishlistItems.find(
      item => item.id === productId || item.slug === productId
    );

    // Only call backend if product has a MongoDB _id
    if (user && product && product._id) {
      try {
        await wishlistService.removeFromWishlist(product._id);
      } catch (error) {
        console.error('Error removing item from wishlist via backend:', error);
        setShopError('Failed to remove item from wishlist.');
        return;
      }
    }

    // Remove only the specific item from frontend state
    setWishlistItems(prevItems =>
      prevItems.filter(item => item.id !== productId && item.slug !== productId)
    );

    // Update localStorage
    try {
      const updatedWishlist = wishlistItems.filter(
        item => item.id !== productId && item.slug !== productId
      );
      localStorage.setItem('wishlistItems', JSON.stringify(updatedWishlist));
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => 
      item.id === productId || item.slug === productId
    );
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseInt((item.product ? item.product.price : item.price).toString().replace(/[^0-9]/g, ''));
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const clearCart = async () => {
    // Clear frontend state first
    setCartItems([]);
    // Clear localStorage immediately
    localStorage.removeItem('cartItems');
    localStorage.removeItem('cartTotal');

    if (user) {
      try {
        await cartService.clearCart();
      } catch (error) {
        console.error('Error clearing cart via backend:', error);
        setShopError('Failed to clear cart.');
      }
    }
  };

  const value = {
    cartItems,
    wishlistItems,
    categories,
    selectedCategory,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getCartTotal,
    getCartItemCount,
    clearCart,
    setCategory,
    clearCategory,
    getProductsByCategory,
    shopLoading,
    shopError
  };

  return <ShopContext.Provider value={value}>{!shopLoading && children}</ShopContext.Provider>;
};

export default ShopContext; 