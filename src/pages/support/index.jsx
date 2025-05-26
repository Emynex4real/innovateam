import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaLink, FaArrowRight, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';

const Support = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [faqExpanded, setFaqExpanded] = useState(null);
  const { isDarkMode } = useDarkMode();

  const supportCategories = [
    { id: 'general', label: 'General Support' },
    { id: 'technical', label: 'Technical Issues' },
    { id: 'billing', label: 'Billing & Payments' },
    { id: 'feature', label: 'Feature Request' },
  ];

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'You can reset your password by clicking on the "Forgot Password" link on the login page. Follow the instructions sent to your email to create a new password.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept various payment methods including credit/debit cards, bank transfers, and mobile money. All transactions are secured and encrypted.'
    },
    {
      question: 'How can I track my transaction history?',
      answer: 'You can view your complete transaction history in the Transactions page of your dashboard. Filter and search options are available for easy tracking.'
    },
  ];

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
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
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
    <div className={`min-h-screen p-4 font-nunito transition-colors duration-200 ${
      isDarkMode ? 'bg-dark-surface text-dark-text-primary' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center mb-12 p-8 rounded-xl shadow-lg ${
            isDarkMode ? 'bg-dark-surface-secondary border border-dark-border' : 'bg-white'
          }`}
        >
          <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${
            isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
          }`}>How Can We Help You?</h1>
          <p className={`max-w-2xl mx-auto mb-8 ${
            isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
          }`}>Choose a category below or search for specific help. Our support team is here to assist you 24/7.</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {supportCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-lg transition-all duration-200 ${
                  selectedCategory === category.id
                    ? isDarkMode
                      ? 'bg-green-600 text-white shadow-lg scale-105'
                      : 'bg-primary-color text-white shadow-lg scale-105'
                    : isDarkMode
                      ? 'bg-dark-surface text-dark-text-secondary hover:bg-dark-border'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mb-12 p-8 rounded-xl shadow-lg ${
            isDarkMode ? 'bg-dark-surface-secondary border border-dark-border' : 'bg-white'
          }`}
        >
          <h2 className={`text-2xl font-bold mb-6 ${
            isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
          }`}>Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className={`border rounded-lg overflow-hidden ${
                  isDarkMode ? 'border-dark-border' : 'border-gray-200'
                }`}
                initial={false}
              >
                <button
                  className={`w-full p-4 text-left flex justify-between items-center transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-dark-surface hover:bg-dark-border' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setFaqExpanded(faqExpanded === index ? null : index)}
                >
                  <span className={`font-medium ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                  }`}>{faq.question}</span>
                  <FaArrowRight
                    className={`transform transition-transform duration-200 ${
                      faqExpanded === index ? 'rotate-90' : ''
                    } ${
                      isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {faqExpanded === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`border-t ${
                        isDarkMode ? 'border-dark-border' : 'border-gray-200'
                      }`}
                    >
                      <div className={`p-4 ${
                        isDarkMode ? 'bg-dark-surface text-dark-text-secondary' : 'bg-white text-gray-600'
                      }`}>
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Form Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`rounded-xl shadow-lg w-full flex flex-col lg:flex-row overflow-hidden ${
            isDarkMode ? 'bg-dark-surface-secondary' : 'bg-white'
          }`}
        >
          {/* Contact Information */}
          <div className="bg-gradient-to-br from-primary-color to-green-600 text-white p-8 lg:w-1/3 flex flex-col gap-8">
            <h2 className="text-2xl font-bold">Get in Touch</h2>
            <p className="text-green-100">Our support team is available 24/7 to help you with any questions or concerns.</p>

            <div className="space-y-6">
              <div className="flex items-center space-x-4 bg-green-700/30 p-4 rounded-lg hover:bg-green-700/40 transition-colors duration-200">
                <div className="bg-white/10 p-3 rounded-full">
                  <FaMapMarkerAlt size={20} />
                </div>
                <div>
                  <h3 className="font-medium">Visit Us</h3>
                  <p className="text-sm text-green-100">06, Opposite GGSS Bakori, Dutsen Rimt, Katsina.</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-green-700/30 p-4 rounded-lg hover:bg-green-700/40 transition-colors duration-200">
                <div className="bg-white/10 p-3 rounded-full">
                  <FaEnvelope size={20} />
                </div>
                <div>
                  <h3 className="font-medium">Email Us</h3>
                  <a href="mailto:info@arewagate.com" className="text-sm text-green-100 hover:text-white transition-colors duration-200">info@arewagate.com</a>
                  <a href="mailto:arewagatecafe@gmail.com" className="block text-sm text-green-100 hover:text-white transition-colors duration-200">arewagatecafe@gmail.com</a>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-green-700/30 p-4 rounded-lg hover:bg-green-700/40 transition-colors duration-200">
                <div className="bg-white/10 p-3 rounded-full">
                  <FaPhone size={20} />
                </div>
                <div>
                  <h3 className="font-medium">Call Us</h3>
                  <a href="tel:+2347038374534" className="text-sm text-green-100 hover:text-white transition-colors duration-200">+234 703 837 4534</a>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-green-700/30 p-4 rounded-lg hover:bg-green-700/40 transition-colors duration-200">
                <div className="bg-white/10 p-3 rounded-full">
                  <FaLink size={20} />
                </div>
                <div>
                  <h3 className="font-medium">Quick Links</h3>
                  <a href="https://chat.whatsapp.com/arewagate" className="block text-sm text-green-100 hover:text-white transition-colors duration-200">Join Support Group</a>
                  <a href="https://support.arewagate.com/chat" className="block text-sm text-green-100 hover:text-white transition-colors duration-200">Live Chat Support</a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className={`p-8 lg:w-2/3 ${
            isDarkMode ? 'bg-dark-surface' : 'bg-white'
          }`}>
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
            }`}>Send Us a Message</h2>
            <p className={`mb-6 ${
              isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
            }`}>Fill out the form below and we'll get back to you as soon as possible.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              {[
                { label: 'Your Name', name: 'name', type: 'text', placeholder: 'Full Name' },
                { label: 'Your Email', name: 'email', type: 'email', placeholder: 'Email address' },
                { label: 'Subject', name: 'subject', type: 'text', placeholder: 'Subject' },
              ].map((field) => (
                <div key={field.name}>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                  }`} htmlFor={field.name}>
                    {field.label}
                  </label>
                  <input
                    id={field.name}
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200 ${
                      errors[field.name]
                        ? 'border-red-500'
                        : isDarkMode
                          ? 'border-dark-border bg-dark-surface text-dark-text-primary'
                          : 'border-gray-300 bg-gray-50'
                    }`}
                    placeholder={field.placeholder}
                    required
                    disabled={isSubmitting}
                  />
                  {errors[field.name] && <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>}
                </div>
              ))}

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                }`} htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200 ${
                    errors.message
                      ? 'border-red-500'
                      : isDarkMode
                        ? 'border-dark-border bg-dark-surface text-dark-text-primary'
                        : 'border-gray-300 bg-gray-50'
                  }`}
                  rows={4}
                  placeholder="Your message"
                  required
                  disabled={isSubmitting}
                />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors duration-200 ${
                  isDarkMode
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-primary-color hover:bg-primary-color-dark text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Support;