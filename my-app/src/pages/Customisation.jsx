import React, { useState } from 'react';
import { customisationService } from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Customisation.css';

const Customisation = () => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    size: '',
    message: '',
    file: null
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('phone', form.phone);
      formData.append('email', form.email);
      formData.append('size', form.size);
      formData.append('message', form.message);
      if (form.file) {
        formData.append('file', form.file);
      }

      await customisationService.submitRequest(formData);
      setSubmitted(true);
      toast.success('Form submitted successfully! Please check your email for confirmation.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setForm({
        name: '',
        phone: '',
        email: '',
        size: '',
        message: '',
        file: null
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting customization request');
      toast.error('Error submitting form. Please try again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customisation-bg">
      <ToastContainer />
      <div className="customisation-breadcrumb">
        <span>Home</span> <span className="breadcrumb-sep">/</span> <span className="breadcrumb-current">Customise Your Tee</span>
      </div>
      <h1 className="customisation-title">CUSTOMISE YOUR TEE</h1>
      <form className="customisation-form" onSubmit={handleSubmit}>
        <div className="customisation-row">
          <div className="customisation-field">
            <label>Full Name<span className="required">*</span></label>
            <input 
              type="text" 
              name="name" 
              placeholder="Full Name" 
              value={form.name} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="customisation-field">
            <label>Phone Number<span className="required">*</span></label>
            <input 
              type="tel" 
              name="phone" 
              placeholder="Phone Number" 
              value={form.phone} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>
        <div className="customisation-row">
          <div className="customisation-field">
            <label>Email<span className="required">*</span></label>
            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              value={form.email} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>
        <div className="customisation-row">
          <div className="customisation-field">
            <label>Size | Colour<span className="required">*</span></label>
            <input 
              type="text" 
              name="size" 
              placeholder="Size | Colour" 
              value={form.size} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>
        <div className="customisation-row">
          <div className="customisation-field">
            <label>Your Message</label>
            <textarea 
              name="message" 
              placeholder="Message" 
              value={form.message} 
              onChange={handleChange} 
            />
          </div>
        </div>
        <div className="customisation-row">
          <div className="customisation-field">
            <label>Tee Style / Reference - Please Upload Image</label>
            <input 
              type="file" 
              name="file" 
              onChange={handleChange} 
              accept="image/*"
            />
          </div>
        </div>
        <button 
          className="customisation-submit" 
          type="submit"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
        {error && (
          <div className="customisation-error">
            {error}
          </div>
        )}
        {submitted && (
          <div className="customisation-success">
            Your customization request has been submitted successfully! We'll get back to you soon.
          </div>
        )}
      </form>
    </div>
  );
};

export default Customisation; 