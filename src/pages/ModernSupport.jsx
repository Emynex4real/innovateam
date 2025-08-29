import React, { useState } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';
import { toast } from 'react-toastify';
import {
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  QuestionMarkCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

const ModernSupport = () => {
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState('contact');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate ticket submission
    setTimeout(() => {
      toast.success('Support ticket submitted successfully! We will get back to you within 24 hours.');
      setContactForm({
        name: '',
        email: '',
        subject: '',
        message: '',
        priority: 'medium'
      });
      setIsSubmitting(false);
    }, 1500);
  };

  const faqs = [
    {
      question: 'How do I fund my wallet?',
      answer: 'You can fund your wallet by going to the Wallet page and clicking on "Add Funds". We accept bank transfers, debit/credit cards, and USSD payments.'
    },
    {
      question: 'What should I do if my transaction failed?',
      answer: 'If your transaction failed, please check your wallet balance first. If the amount was deducted but the service was not delivered, contact our support team with your transaction ID.'
    },
    {
      question: 'How accurate are the AI Examiner results?',
      answer: 'Our AI Examiner uses advanced algorithms trained on past examination papers. The accuracy rate is over 95%, but we recommend using it as a practice tool alongside your regular studies.'
    },
    {
      question: 'Can I get a refund for unused services?',
      answer: 'Refunds are processed on a case-by-case basis. Please contact our support team with your request and transaction details for review.'
    },
    {
      question: 'How long does it take to check WAEC results?',
      answer: 'WAEC result checking is instant. Once you provide the correct examination number and scratch card PIN, results are displayed immediately.'
    },
    {
      question: 'Is my personal information secure?',
      answer: 'Yes, we use industry-standard encryption to protect your personal information. We do not share your data with third parties without your consent.'
    }
  ];

  const contactMethods = [
    {
      icon: PhoneIcon,
      title: 'Phone Support',
      description: 'Call us for immediate assistance',
      contact: '+234 800 123 4567',
      availability: 'Mon - Fri, 9AM - 6PM'
    },
    {
      icon: EnvelopeIcon,
      title: 'Email Support',
      description: 'Send us an email for detailed inquiries',
      contact: 'support@arewagate.com',
      availability: 'Response within 24 hours'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Live Chat',
      description: 'Chat with our support team',
      contact: 'Available on website',
      availability: 'Mon - Fri, 9AM - 6PM'
    }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <QuestionMarkCircleIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Support Center</h1>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Get help and find answers to your questions</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('contact')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'contact'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Contact Support
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'faq'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                FAQ
              </button>
              <button
                onClick={() => setActiveTab('status')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'status'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                System Status
              </button>
            </nav>
          </div>
        </div>

        {/* Contact Support Tab */}
        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Submit a Support Ticket</h2>
                
                <form onSubmit={handleSubmitTicket} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={contactForm.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={contactForm.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={contactForm.subject}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                      Priority Level
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={contactForm.priority}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low - General inquiry</option>
                      <option value="medium">Medium - Service issue</option>
                      <option value="high">High - Payment problem</option>
                      <option value="urgent">Urgent - Account access issue</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={contactForm.message}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Please provide detailed information about your issue..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                        Submit Ticket
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Methods */}
            <div className="space-y-6">
              {contactMethods.map((method, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <method.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{method.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                  <p className="font-medium text-gray-900 mb-2">{method.contact}</p>
                  <p className="text-xs text-gray-500">{method.availability}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">{faq.question}</h3>
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Status Tab */}
        {activeTab === 'status' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { service: 'WAEC Result Checker', status: 'operational' },
                    { service: 'JAMB Services', status: 'operational' },
                    { service: 'AI Examiner', status: 'operational' },
                    { service: 'Wallet System', status: 'operational' },
                    { service: 'Payment Gateway', status: 'maintenance' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{item.service}</span>
                      <div className="flex items-center">
                        {item.status === 'operational' ? (
                          <>
                            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-600">Operational</span>
                          </>
                        ) : item.status === 'maintenance' ? (
                          <>
                            <ClockIcon className="h-5 w-5 text-yellow-600 mr-2" />
                            <span className="text-sm font-medium text-yellow-600">Maintenance</span>
                          </>
                        ) : (
                          <>
                            <ExclamationCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                            <span className="text-sm font-medium text-red-600">Down</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernSupport;