import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { 
  MapPin, Mail, Phone, Link, ChevronRight, Loader2, 
  MessageCircle, HelpCircle, Search, FileText, CreditCard 
} from 'lucide-react';
import toast from 'react-hot-toast';

const Support = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [faqExpanded, setFaqExpanded] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const supportCategories = [
    { id: 'general', label: 'General Inquiries', icon: HelpCircle, desc: 'Account & basic questions' },
    { id: 'technical', label: 'Technical Support', icon: MessageCircle, desc: 'Platform errors & bugs' },
    { id: 'billing', label: 'Billing & Wallet', icon: CreditCard, desc: 'Payments & refunds' },
    { id: 'feature', label: 'Feature Requests', icon: FileText, desc: 'Suggest improvements' },
  ];

  const faqs = [
    {
      question: 'How do I fund my wallet?',
      answer: 'Go to the Wallet page and click "Fund Wallet". You can use your debit card via our secure Paystack integration.'
    },
    {
      question: 'How can I reset my password?',
      answer: 'Click "Forgot Password" on the login screen. You will receive an email with instructions to reset it safely.'
    },
    {
      question: 'Are my transactions secure?',
      answer: 'Yes. We use industry-standard encryption and do not store your card details directly. All payments are processed by regulated partners.'
    },
    {
      question: 'Can I track my learning progress?',
      answer: 'Absolutely. Visit the "Analytics" tab to see your quiz scores, accuracy trends, and study streaks over time.'
    },
  ];

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
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
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) { toast.error('Failed to send message.'); } 
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-green-600 p-8 md:p-12 text-center text-white shadow-xl">
           {/* Background Pattern */}
           <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
           
           <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold">How can we help you?</h1>
              
              {/* Search Bar */}
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                 <input 
                   type="text" 
                   placeholder="Search for answers..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 placeholder:text-gray-400 border-none shadow-lg focus:ring-2 focus:ring-green-300 outline-none"
                 />
              </div>
           </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {supportCategories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <Card 
                key={cat.id} 
                onClick={() => setSelectedCategory(cat.id)}
                className={`cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md border ${
                  isSelected ? 'border-green-500 ring-1 ring-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                <CardContent className="p-6 text-center space-y-3">
                   <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                      <Icon className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className={`font-bold ${isSelected ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>{cat.label}</h3>
                      <p className="text-xs text-gray-500">{cat.desc}</p>
                   </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           
           {/* Left: Contact Info & FAQ */}
           <div className="space-y-8">
              
              {/* FAQ Accordion */}
              <Card className="border border-gray-100 dark:border-gray-800 shadow-sm">
                 <CardHeader>
                    <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
                 </CardHeader>
                 <CardContent className="p-0">
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                       {filteredFaqs.length > 0 ? filteredFaqs.map((faq, idx) => (
                          <div key={idx} className="group">
                             <button 
                               onClick={() => setFaqExpanded(faqExpanded === idx ? null : idx)}
                               className="w-full flex justify-between items-center p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                             >
                                <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-green-600 transition-colors">{faq.question}</span>
                                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${faqExpanded === idx ? 'rotate-90 text-green-500' : ''}`} />
                             </button>
                             <AnimatePresence>
                                {faqExpanded === idx && (
                                   <motion.div 
                                     initial={{ height: 0, opacity: 0 }} 
                                     animate={{ height: "auto", opacity: 1 }} 
                                     exit={{ height: 0, opacity: 0 }}
                                     className="overflow-hidden"
                                   >
                                      <div className="p-5 pt-0 text-sm text-gray-500 leading-relaxed">
                                         {faq.answer}
                                      </div>
                                   </motion.div>
                                )}
                             </AnimatePresence>
                          </div>
                       )) : (
                          <div className="p-8 text-center text-gray-400">No results found for "{searchQuery}"</div>
                       )}
                    </div>
                 </CardContent>
              </Card>

              {/* Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-start gap-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                       <Mail className="w-5 h-5" />
                    </div>
                    <div>
                       <h4 className="font-bold text-sm">Email Support</h4>
                       <a href="mailto:support@innovateam.com" className="text-xs text-gray-500 hover:text-green-600 transition-colors">support@innovateam.com</a>
                    </div>
                 </div>
                 <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-start gap-4">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg">
                       <Phone className="w-5 h-5" />
                    </div>
                    <div>
                       <h4 className="font-bold text-sm">Phone Line</h4>
                       <a href="tel:+234700000000" className="text-xs text-gray-500 hover:text-green-600 transition-colors">+234 700 000 0000</a>
                    </div>
                 </div>
              </div>
           </div>

           {/* Right: Contact Form */}
           <Card className="border border-gray-100 dark:border-gray-800 shadow-lg h-fit">
              <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                 <CardTitle className="text-lg flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-green-500" /> Send us a Message
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                 <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input 
                            id="name" name="name" 
                            value={formData.name} onChange={handleChange} 
                            placeholder="John Doe" 
                            className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                          />
                          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                       </div>
                       <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" name="email" type="email"
                            value={formData.email} onChange={handleChange} 
                            placeholder="john@example.com" 
                            className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
                          />
                          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                       </div>
                    </div>

                    <div className="space-y-2">
                       <Label htmlFor="subject">Subject</Label>
                       <Input 
                         id="subject" name="subject" 
                         value={formData.subject} onChange={handleChange} 
                         placeholder="How can we help?" 
                         className={errors.subject ? 'border-red-500 focus-visible:ring-red-500' : ''}
                       />
                       {errors.subject && <p className="text-xs text-red-500">{errors.subject}</p>}
                    </div>

                    <div className="space-y-2">
                       <Label htmlFor="message">Message</Label>
                       <Textarea 
                         id="message" name="message" rows={5}
                         value={formData.message} onChange={handleChange} 
                         placeholder="Describe your issue in detail..." 
                         className={`resize-none ${errors.message ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                       />
                       {errors.message && <p className="text-xs text-red-500">{errors.message}</p>}
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-11 rounded-lg">
                       {isSubmitting ? (
                          <>
                             <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...
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