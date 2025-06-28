import React from 'react';
import { FaStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './ReviewList.css';

const ReviewList = ({ reviews, onDeleteReview }) => {
  const { user } = useAuth();

  if (!reviews || reviews.length === 0) {
    return (
      <div className="no-reviews">
        <p>No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="review-list">
      {reviews.map((review) => (
        <div key={review.id} className="review-card">
          <div className="review-header">
            <div className="review-rating">
              {[...Array(5)].map((_, index) => (
                <FaStar
                  key={index}
                  className={`star ${index < review.rating ? 'filled' : ''}`}
                  size={18}
                />
              ))}
            </div>
            <div className="review-meta">
              <span className="reviewer-name">{review.userName}</span>
              <span className="review-date">
                {new Date(review.date).toLocaleDateString()}
              </span>
            </div>
            {user && (user.id === review.userId || user.isAdmin) && (
              <button
                className="delete-review-btn"
                onClick={() => onDeleteReview(review.id)}
              >
                ×
              </button>
            )}
          </div>
          
          <div className="review-content">
            {review.comment}
          </div>
          
          {review.images && review.images.length > 0 && (
            <div className="review-images">
              {review.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Review image ${index + 1}`}
                  className="review-image"
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewList; 