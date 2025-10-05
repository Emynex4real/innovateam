import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { MapPin, Mail, Phone, Link, ChevronRight, Loader2, MessageCircle, HelpCircle } from 'lucide-react';
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
  const { isDarkMode } = useDarkMode();

  const supportCategories = [
    { id: 'general', label: 'General Support', icon: HelpCircle },
    { id: 'technical', label: 'Technical Issues', icon: MessageCircle },
    { id: 'billing', label: 'Billing & Payments', icon: Phone },
    { id: 'feature', label: 'Feature Request', icon: Mail },
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <HelpCircle className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">How Can We Help You?</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose a category below or contact us directly. Our support team is here to assist you 24/7.
          </p>
        </motion.div>

        {/* Support Categories */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {supportCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedCategory === category.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-6 text-center">
                  <IconComponent className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold">{category.label}</h3>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <button
                    className="w-full p-4 text-left flex justify-between items-center hover:bg-muted/50 transition-colors"
                    onClick={() => setFaqExpanded(faqExpanded === index ? null : index)}
                  >
                    <span className="font-medium">{faq.question}</span>
                    <ChevronRight
                      className={`h-4 w-4 transition-transform duration-200 ${
                        faqExpanded === index ? 'rotate-90' : ''
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
                        className="border-t"
                      >
                        <div className="p-4 text-muted-foreground">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <Card className="bg-gradient-to-br from-primary to-green-600 text-white border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
              <p className="text-green-100 mb-8">
                Our support team is available 24/7 to help you with any questions or concerns.
              </p>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 bg-white/10 p-4 rounded-lg">
                  <div className="bg-white/20 p-3 rounded-full">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Visit Us</h3>
                    <p className="text-sm text-green-100">06, Opposite GGSS Bakori, Dutsen Rimt, Katsina.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-white/10 p-4 rounded-lg">
                  <div className="bg-white/20 p-3 rounded-full">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Email Us</h3>
                    <a href="mailto:info@arewagate.com" className="text-sm text-green-100 hover:text-white block">
                      info@arewagate.com
                    </a>
                    <a href="mailto:arewagatecafe@gmail.com" className="text-sm text-green-100 hover:text-white block">
                      arewagatecafe@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-white/10 p-4 rounded-lg">
                  <div className="bg-white/20 p-3 rounded-full">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Call Us</h3>
                    <a href="tel:+2347038374534" className="text-sm text-green-100 hover:text-white">
                      +234 703 837 4534
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-white/10 p-4 rounded-lg">
                  <div className="bg-white/20 p-3 rounded-full">
                    <Link className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Quick Links</h3>
                    <a href="#" className="text-sm text-green-100 hover:text-white block">
                      Join Support Group
                    </a>
                    <a href="#" className="text-sm text-green-100 hover:text-white block">
                      Live Chat Support
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send Us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Full Name"
                      disabled={isSubmitting}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Your Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email address"
                      disabled={isSubmitting}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Subject"
                    disabled={isSubmitting}
                    className={errors.subject ? 'border-red-500' : ''}
                  />
                  {errors.subject && <p className="text-red-500 text-xs">{errors.subject}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message"
                    rows={4}
                    disabled={isSubmitting}
                    className={errors.message ? 'border-red-500' : ''}
                  />
                  {errors.message && <p className="text-red-500 text-xs">{errors.message}</p>}
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Support;