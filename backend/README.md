# Backend API for My App

This is the backend API for the My App e-commerce application. It provides endpoints for user authentication, product management, shopping cart, wishlist, and product customization.

## Features

- User authentication (register, login)
- Product management (CRUD operations)
- Shopping cart functionality
- Wishlist management
- Product customization options
- Rating and review system

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/my-app
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Products
- GET `/api/products` - Get all products
- GET `/api/products/:slug` - Get product by slug
- POST `/api/products` - Create new product (admin only)
- PUT `/api/products/:id` - Update product (admin only)
- DELETE `/api/products/:id` - Delete product (admin only)
- POST `/api/products/:id/ratings` - Add rating to product

### Cart
- GET `/api/cart` - Get user's cart
- POST `/api/cart/add` - Add item to cart
- PUT `/api/cart/update/:productId` - Update cart item quantity
- DELETE `/api/cart/remove/:productId` - Remove item from cart
- DELETE `/api/cart/clear` - Clear cart

### Wishlist
- GET `/api/wishlist` - Get user's wishlist
- POST `/api/wishlist/add/:productId` - Add item to wishlist
- DELETE `/api/wishlist/remove/:productId` - Remove item from wishlist
- DELETE `/api/wishlist/clear` - Clear wishlist

### Customization
- GET `/api/customization/:productId` - Get customization options
- PUT `/api/customization/:productId` - Update customization options (admin only)
- POST `/api/customization/validate/:productId` - Validate customization options

## Error Handling

The API uses standard HTTP status codes and returns error messages in the following format:
```json
{
  "message": "Error message",
  "error": "Detailed error information (in development)"
}
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer your-jwt-token
```

## Development

To start the development server with hot reloading:
```bash
npm run dev
```

## Production

To start the production server:
```bash
npm start
``` 