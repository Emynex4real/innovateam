import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Support = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ visible: false, message: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Form submitted:', formData);
      setNotification({ visible: true, message: 'Message sent successfully!', type: 'success' });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setNotification({ visible: false, message: '', type: '' }), 3000);
    } catch (error) {
      setNotification({ visible: true, message: 'Failed to send message. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-nunito">
      {/* Notification */}
      {notification.visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white ${
            notification.type === 'success' ? 'bg-primary-color' : 'bg-red-500'
          }`}
        >
          {notification.message}
        </motion.div>
      )}

      {/* Main Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-xl shadow-lg w-full max-w-5xl flex flex-col lg:flex-row overflow-hidden"
      >
        {/* Contact Information */}
        <div className="bg-gradient-to-br from-primary-color to-green-600 text-white p-6 lg:w-1/3 flex flex-col gap-6">
          <h2 className="text-xl md:text-2xl font-semibold">Get in Touch</h2>

          {[
            { title: 'Address', content: '06, Opposite GGSS Bakori, Dutsen Rimt, Katsina.' },
            { title: 'Email Us', content: ['info@arewagate.com', 'arewagatecafe@gmail.com'] },
            { title: 'Call Us', content: '+234 703 837 4534' },
            { title: 'Links', content: [
              { text: 'Join Group', href: '#' },
              { text: 'Chat with Customer Care', href: '#' },
            ]},
          ].map((section, index) => (
            <div key={index} className="bg-green-700/50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold">{section.title}</h3>
              <div className="mt-2 text-sm">
                {Array.isArray(section.content) ? (
                  section.content.map((item, idx) => (
                    typeof item === 'string' ? (
                      <p key={idx}>{item}</p>
                    ) : (
                      <a key={idx} href={item.href} className="block underline hover:text-green-200 transition-all duration-200">
                        {item.text}
                      </a>
                    )
                  ))
                ) : (
                  <p>{section.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="p-6 lg:w-2/3">
          <h2 className="text-xl md:text-2xl font-semibold text-text-color mb-6">Send Us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {[
              { label: 'Your Name', name: 'name', type: 'text', placeholder: 'Full Name' },
              { label: 'Your Email', name: 'email', type: 'email', placeholder: 'Email address' },
              { label: 'Subject', name: 'subject', type: 'text', placeholder: 'Subject' },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={field.name}>
                  {field.label}
                </label>
                <input
                  id={field.name}
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className={`w-full p-3 border ${
                    errors[field.name] ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200`}
                  placeholder={field.placeholder}
                  required
                  disabled={isSubmitting}
                />
                {errors[field.name] && <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>}
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className={`w-full p-3 border ${
                  errors.message ? 'border-red-500' : 'border-gray-300'
                } rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200 h-32`}
                placeholder="Your message..."
                required
                disabled={isSubmitting}
              />
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-primary-color text-white py-2 px-6 rounded-md font-semibold hover:bg-green-600 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" />
                  </svg>
                )}
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Support;