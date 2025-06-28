import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaStar } from 'react-icons/fa';
import './ReviewForm.css';

const ReviewForm = ({ productId, onReviewSubmit }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to submit a review');
      return;
    }

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewData = {
        productId,
        userId: user.id,
        rating,
        comment,
        images,
        userName: user.name,
        date: new Date().toISOString()
      };

      // Here you would typically make an API call to save the review
      // For now, we'll just call the callback
      await onReviewSubmit(reviewData);
      
      // Reset form
      setRating(0);
      setComment('');
      setImages([]);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 3) {
      alert('You can only upload up to 3 images');
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <div className="rating-container">
        {[...Array(5)].map((_, index) => {
          const ratingValue = index + 1;
          return (
            <label key={index}>
              <input
                type="radio"
                name="rating"
                value={ratingValue}
                onClick={() => setRating(ratingValue)}
              />
              <FaStar
                className="star"
                color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                size={24}
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(0)}
              />
            </label>
          );
        })}
      </div>

      <textarea
        className="review-comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your review here..."
        rows="4"
        required
      />

      <div className="image-upload-container">
        <label className="image-upload-label">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={images.length >= 3}
          />
          <span>Upload Images (Max 3)</span>
        </label>
        
        <div className="image-preview-container">
          {images.map((image, index) => (
            <div key={index} className="image-preview">
              <img src={image.preview} alt={`Preview ${index + 1}`} />
              <button
                type="button"
                className="remove-image"
                onClick={() => removeImage(index)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="submit-review"
        disabled={isSubmitting || !user}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm; 