import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaLink, FaArrowRight, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

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
    <div className="min-h-screen bg-gray-50 p-4 font-nunito">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 p-8 bg-white rounded-xl shadow-lg"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">How Can We Help You?</h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">Choose a category below or search for specific help. Our support team is here to assist you 24/7.</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {supportCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-lg transition-all duration-200 ${selectedCategory === category.id
                  ? 'bg-primary-color text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
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
          className="mb-12 bg-white rounded-xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
                initial={false}
              >
                <button
                  className="w-full p-4 text-left flex justify-between items-center bg-gray-50 hover:bg-gray-100"
                  onClick={() => setFaqExpanded(faqExpanded === index ? null : index)}
                >
                  <span className="font-medium text-gray-700">{faq.question}</span>
                  <FaArrowRight
                    className={`transform transition-transform duration-200 ${faqExpanded === index ? 'rotate-90' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {faqExpanded === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-200"
                    >
                      <div className="p-4 bg-white text-gray-600">
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
          className="bg-white rounded-xl shadow-lg w-full flex flex-col lg:flex-row overflow-hidden"
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
                  <a href="#" className="block text-sm text-green-100 hover:text-white transition-colors duration-200">Join Support Group</a>
                  <a href="#" className="block text-sm text-green-100 hover:text-white transition-colors duration-200">Live Chat Support</a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="p-8 lg:w-2/3">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Send Us a Message</h2>
            <p className="text-gray-600 mb-6">Fill out the form below and we'll get back to you as soon as possible.</p>
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
                    className={`w-full p-4 border ${
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
                  className={`w-full p-4 border ${
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
                  className="bg-primary-color text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-600 transform hover:scale-105 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 shadow-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <FaSpinner className="animate-spin h-5 w-5" />
                  )}
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Support;