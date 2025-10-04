import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Star, Users, Award, Zap, Target, BookOpen, MessageCircle, Play, TrendingUp, Brain, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import NavBar from './navBar';
import image from '../../images/pexels-cottonbro-6344238.jpg';
import whatsapp from '../../images/whatsapp-removebg-preview.png';

const Home = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useDarkMode();

  const testimonials = [
    {
      name: "Adebayo Johnson",
      course: "Computer Science, FUTA",
      text: "InnovaTeam's AI course advisor helped me discover my perfect match. I got admission with a 280 JAMB score!",
      image: image
    },
    {
      name: "Fatima Abdullahi",
      course: "Medicine, University of Ibadan",
      text: "The platform guided me through every step. From JAMB registration to final admission - incredible support!",
      image: image
    },
    {
      name: "Chinedu Okafor",
      course: "Engineering, UNILAG",
      text: "95% success rate isn't just a number - it's real. I'm proof that InnovaTeam delivers on their promises.",
      image: image
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting
          }));
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[id]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };

  const stats = [
    { num: '2,800+', text: 'Students Reached', icon: <Users className="w-6 h-6" /> },
    { num: '850+', text: 'Secured Admissions', icon: <Award className="w-6 h-6" /> },
    { num: '95%', text: 'Success Rate', icon: <Star className="w-6 h-6" /> },
  ];

  const features = [
    {
      icon: <Target className="w-8 h-8" />,
      title: 'AI-Powered Matching',
      description: 'Advanced algorithms analyze your profile to recommend perfect courses for your goals.',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Expert Guidance',
      description: 'Get personalized support from education experts throughout your journey.',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Instant Results',
      description: 'Get immediate access to course recommendations and educational resources.',
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: 'Comprehensive Services',
      description: 'From JAMB services to result checkers, all your educational needs covered.',
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Quality Resources',
      description: 'Access premium educational content and study materials.',
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: 'Proven Success',
      description: 'Join thousands of successful students who achieved their dreams.',
    },
  ];

  const services = [
    {
      title: 'Course Advisor',
      description: 'AI-powered course recommendations based on your academic profile',
      link: '/course-advisor',
      badge: 'Popular'
    },
    {
      title: 'JAMB Services',
      description: 'Complete JAMB registration, result checking, and related services',
      link: '/dashboard',
      badge: 'Essential'
    },
    {
      title: 'Result Checkers',
      description: 'Check WAEC, NECO, NABTEB results instantly',
      link: '/dashboard',
      badge: 'Quick'
    },
    {
      title: 'AI Examiner',
      description: 'Practice with AI-generated questions and get instant feedback',
      link: '/dashboard',
      badge: 'New'
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-black text-white' : 'bg-white text-gray-900'
    }`}>
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-black to-green-900/20"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="animate-fade-in">
                <Badge className="mb-6 bg-green-600/20 border border-green-500/30 text-green-400 hover:bg-green-600/30">
                  <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                  AI-Powered Education Platform
                </Badge>
                
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                  Transform Your
                  <span className="block bg-gradient-to-r from-green-400 via-green-500 to-emerald-400 bg-clip-text text-transparent animate-gradient">
                    Academic Future
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                  Join over <span className="text-green-400 font-semibold">2,800+ students</span> who've secured their dream admissions with our AI-powered course recommendations.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-6 mb-12">
                <div className="flex items-center space-x-2 text-green-400 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">850+ Secured Admissions</span>
                </div>
                <div className="flex items-center space-x-2 text-green-400 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
                  <Target className="w-5 h-5" />
                  <span className="font-medium">95% Success Rate</span>
                </div>
                <div className="flex items-center space-x-2 text-green-400 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
                  <Brain className="w-5 h-5" />
                  <span className="font-medium">AI-Powered Matching</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-green-500/25 transition-all duration-300 group">
                  <Link to="/register">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-green-500/50 text-green-400 hover:bg-green-600 hover:text-white px-8 py-4 text-lg backdrop-blur-sm bg-green-500/5 group">
                  <Link to="/course-advisor">
                    <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Try Course Advisor
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10">
                <img
                  src={image}
                  alt="Students Success"
                  className="rounded-2xl shadow-2xl w-full max-w-lg mx-auto transform hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute -top-4 -right-4 bg-green-600 text-white p-4 rounded-xl shadow-lg animate-bounce">
                  <div className="text-2xl font-bold">95%</div>
                  <div className="text-sm">Success Rate</div>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-black/80 backdrop-blur-sm text-white p-4 rounded-xl shadow-lg border border-green-500/30">
                  <div className="text-lg font-semibold text-green-400">850+</div>
                  <div className="text-sm">Admissions Secured</div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-transparent rounded-2xl blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className={`py-20 backdrop-blur-sm ${
        isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'
      }`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent' 
                : 'text-gray-900'
            }`}>Trusted by Thousands</h2>
            <p className={`text-xl ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Real results from real students across Nigeria</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className={`text-center hover:border-green-500/50 transition-all duration-500 group backdrop-blur-sm ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50' 
                  : 'bg-white border-gray-200 shadow-lg'
              } ${
                isVisible.stats ? 'animate-fade-in-up' : 'opacity-0'
              }`} style={{ animationDelay: `${index * 200}ms` }}>
                <CardContent className="pt-8">
                  <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-green-600/20 to-emerald-600/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                    {React.cloneElement(stat.icon, { className: 'w-8 h-8 text-green-400' })}
                  </div>
                  <h3 className={`text-4xl font-bold mb-2 group-hover:scale-105 transition-transform ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent' 
                      : 'text-green-600'
                  }`}>{stat.num}</h3>
                  <p className={`text-lg ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>{stat.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/10 via-transparent to-green-900/10"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Success Stories</h2>
            <p className="text-xl text-gray-400">Hear from students who transformed their futures</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <img
                    src={testimonials[currentTestimonial].image}
                    alt={testimonials[currentTestimonial].name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-green-500/30"
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <blockquote className="text-xl md:text-2xl text-gray-300 mb-6 italic leading-relaxed">
                    "{testimonials[currentTestimonial].text}"
                  </blockquote>
                  <div>
                    <div className="text-lg font-semibold text-green-400">{testimonials[currentTestimonial].name}</div>
                    <div className="text-gray-400">{testimonials[currentTestimonial].course}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center mt-8 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonial ? 'bg-green-500 scale-125' : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-600/20 border border-green-500/30 text-green-400">
              <BookOpen className="w-4 h-4 mr-2" />
              Our Services
            </Badge>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Everything You Need</h2>
            <p className="text-xl text-gray-400">Comprehensive educational services for your success</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className={`bg-gradient-to-br from-gray-800/40 to-gray-900/40 border-gray-700/50 hover:border-green-500/50 transition-all duration-500 group backdrop-blur-sm hover:transform hover:scale-105 ${
                isVisible.services ? 'animate-fade-in-up' : 'opacity-0'
              }`} style={{ animationDelay: `${index * 150}ms` }}>
                <CardHeader className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-transparent rounded-full transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <CardTitle className="text-white group-hover:text-green-400 transition-colors duration-300">
                      {service.title}
                    </CardTitle>
                    <Badge className={`${
                      service.badge === 'Popular' ? 'bg-green-600' :
                      service.badge === 'New' ? 'bg-blue-600' :
                      service.badge === 'Essential' ? 'bg-purple-600' :
                      'bg-orange-600'
                    } text-white animate-pulse`}>
                      {service.badge}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full border-green-600/50 text-green-400 hover:bg-green-600 hover:text-white hover:border-green-500 transition-all duration-300 group/btn">
                    <Link to={service.link}>
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose InnovaTeam?</h2>
            <p className="text-xl text-gray-400">Experience the future of education</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700 hover:border-green-600 transition-all duration-300 group">
                <CardContent className="pt-6">
                  <div className="inline-flex p-3 rounded-lg bg-green-600/20 mb-4">
                    {React.cloneElement(feature.icon, { className: 'w-8 h-8 text-green-400' })}
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-green-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">See InnovaTeam in Action</h2>
              <p className="text-xl text-gray-400">Experience our AI-powered course matching</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                  <h3 className="text-xl font-semibold mb-4 text-green-400">Quick Course Match</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-gray-300">JAMB Score</span>
                      <span className="text-green-400 font-semibold">280</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-gray-300">O-Level Grades</span>
                      <span className="text-green-400 font-semibold">5 Credits</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-gray-300">Interest</span>
                      <span className="text-green-400 font-semibold">Technology</span>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                      <Brain className="w-4 h-4 mr-2" />
                      Find My Perfect Course
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="w-6 h-6 text-green-400 mr-3" />
                    <span className="text-lg font-semibold text-green-400">Perfect Match Found!</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-white font-semibold">Computer Science - FUTA</div>
                    <div className="text-gray-300 text-sm">95% compatibility • High admission chance</div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>• Cut-off: 250</span>
                      <span>• Duration: 4 years</span>
                      <span>• Career prospects: Excellent</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <img
                  src={image}
                  alt="Student using InnovaTeam platform"
                  className="rounded-2xl shadow-2xl w-full transform hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-2xl"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-black/80 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-green-400 font-semibold">Live Demo Available</div>
                        <div className="text-gray-300 text-sm">Try our course advisor now</div>
                      </div>
                      <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                        <Link to="/course-advisor">
                          <Play className="w-4 h-4 mr-2" />
                          Try Now
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/30 via-black to-green-900/30"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-green-100 to-white bg-clip-text text-transparent">
            Ready to Transform Your Future?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of students who've already started their journey to academic success with InnovaTeam.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-green-500/25 transition-all duration-300 group">
              <Link to="/register">
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <div className="flex items-center space-x-3 text-gray-300 bg-gray-800/50 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-700/50">
              <img src={whatsapp} alt="WhatsApp" className="w-6 h-6" />
              <span className="font-medium">+234 803 377 2750</span>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className={`py-16 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="container mx-auto px-4">
          <Card className={`max-w-2xl mx-auto ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <CardHeader className="text-center">
              <CardTitle className={`text-2xl ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Stay Updated</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Get the latest educational resources and updates delivered to your inbox.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className={`flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  required
                />
                <Button type="submit" className="bg-green-600 hover:bg-green-700 px-6 py-3">
                  {subscribed ? 'Subscribed!' : 'Subscribe'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 border-t ${
        isDarkMode ? 'border-gray-800' : 'border-gray-200'
      }`}>
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">I</span>
            </div>
            <span className={`text-2xl font-bold ${
              isDarkMode ? 'text-green-400' : 'text-green-600'
            }`}>InnovaTeam</span>
          </div>
          <p className={`mb-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Empowering students to achieve their academic dreams through innovative technology.
          </p>
          <div className={`flex justify-center space-x-6 text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <Link to="/about" className={`transition-colors ${
              isDarkMode ? 'hover:text-green-400' : 'hover:text-green-600'
            }`}>About</Link>
            <Link to="/contact" className={`transition-colors ${
              isDarkMode ? 'hover:text-green-400' : 'hover:text-green-600'
            }`}>Contact</Link>
            <Link to="/privacy" className={`transition-colors ${
              isDarkMode ? 'hover:text-green-400' : 'hover:text-green-600'
            }`}>Privacy</Link>
            <Link to="/terms" className={`transition-colors ${
              isDarkMode ? 'hover:text-green-400' : 'hover:text-green-600'
            }`}>Terms</Link>
          </div>
          <p className={`text-sm mt-4 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            © 2024 InnovaTeam. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;