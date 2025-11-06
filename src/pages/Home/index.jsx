import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Star, Users, Award, Zap, Target, BookOpen, MessageCircle, Play, TrendingUp, Brain, Sparkles, Sun, Moon, Menu, X, Search, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import Logo from '../../components/ui/logo';
import image from '../../images/pexels-cottonbro-6344238.jpg';
import whatsapp from '../../images/whatsapp-removebg-preview.png';
import heroImage from '../../images/pexels-cottonbro-7439130.jpg';
import featureImage from '../../images/pexels-divinetechygirl-1181450.jpg';
import testimonialBg from '../../images/pexels-mart-production-7550298.jpg';

// Integrated NavBar Component
const NavBar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const sidebarRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated, user, signOut } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target)
      ) {
        setIsSidebarOpen(false);
      }

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSidebarOpen(false);
    }
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/course-advisor', label: 'Course Advisor' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? isDarkMode 
            ? 'bg-black/95 backdrop-blur-md border-b border-gray-800/50 shadow-lg' 
            : 'bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg'
          : isDarkMode
            ? 'bg-transparent'
            : 'bg-white shadow-sm'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center group">
              <Logo 
                size="md" 
                textColor={isDarkMode ? "white" : "dark"} 
                className="transition-all duration-300 group-hover:scale-105" 
              />
            </Link>

            <div className="hidden lg:flex items-center space-x-8">
              <ul className="flex items-center space-x-8">
                {navItems.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.path}
                      className={`text-sm font-bold transition-all duration-300 relative group ${
                        isDarkMode 
                          ? 'text-gray-100 hover:text-green-400' 
                          : isScrolled 
                            ? 'text-gray-900 hover:text-green-600' 
                            : 'text-gray-900 hover:text-green-600'
                      }`}
                    >
                      {item.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="relative">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-48 px-4 py-2 pl-10 rounded-full border transition-all duration-300 text-sm font-semibold ${
                      isDarkMode 
                        ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-200 focus:bg-gray-800 focus:border-green-500' 
                        : isScrolled
                          ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-700 focus:border-green-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-700 focus:border-green-500'
                    } focus:outline-none focus:ring-2 focus:ring-green-500/20`}
                  />
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isDarkMode 
                      ? 'text-gray-200' 
                      : isScrolled 
                        ? 'text-gray-700' 
                        : 'text-gray-700'
                  }`} />
                </form>
              </div>

              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full transition-all duration-300 ${
                  isDarkMode 
                    ? 'text-gray-200 hover:text-yellow-400 hover:bg-gray-800' 
                    : isScrolled
                      ? 'text-gray-800 hover:text-gray-900 hover:bg-gray-100'
                      : 'text-gray-800 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-label="Toggle theme"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-full transition-all duration-300 ${
                      isDarkMode 
                        ? 'hover:bg-gray-800' 
                        : isScrolled
                          ? 'hover:bg-gray-100'
                          : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">
                        {user?.email?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  </button>

                  {isDropdownOpen && (
                    <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-xl border backdrop-blur-md ${
                      isDarkMode 
                        ? 'bg-gray-900/95 border-gray-700' 
                        : 'bg-white/95 border-gray-200'
                    } overflow-hidden`}>
                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          className={`block px-4 py-2 text-sm font-semibold transition-colors ${
                            isDarkMode 
                              ? 'text-gray-100 hover:bg-gray-800 hover:text-white' 
                              : 'text-gray-900 hover:bg-gray-100'
                          }`}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            signOut();
                            setIsDropdownOpen(false);
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm font-semibold text-red-500 transition-colors ${
                            isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-red-50'
                          }`}
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button 
                    asChild 
                    variant="ghost" 
                    size="sm"
                    className={`transition-all duration-300 font-bold ${
                      isDarkMode 
                        ? 'text-gray-100 hover:text-white hover:bg-gray-800' 
                        : isScrolled
                          ? 'text-gray-900 hover:text-gray-900 hover:bg-gray-100'
                          : 'text-gray-900 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button 
                    asChild 
                    size="sm"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-lg hover:shadow-green-500/25 transition-all duration-300"
                  >
                    <Link to="/register">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>

            <button
              ref={toggleButtonRef}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`lg:hidden p-2 rounded-lg transition-all duration-300 ${
                isDarkMode 
                  ? 'text-gray-100 hover:text-white hover:bg-gray-800' 
                  : isScrolled
                    ? 'text-gray-900 hover:text-gray-900 hover:bg-gray-100'
                    : 'text-gray-900 hover:text-gray-900 hover:bg-gray-100'
              }`}
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 right-0 w-80 transform transition-transform duration-300 ease-in-out lg:hidden z-50 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } ${
          isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'
        } backdrop-blur-md border-l ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <Logo 
              size="md" 
              textColor={isDarkMode ? "white" : "dark"} 
            />
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-2 mb-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`block px-4 py-3 rounded-xl transition-all duration-300 ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-4 py-3 pl-10 rounded-xl border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-green-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500'
                } focus:outline-none focus:ring-2 focus:ring-green-500/20`}
              />
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
            </div>
          </form>

          <button
            onClick={toggleDarkMode}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors mb-8 ${
              isDarkMode 
                ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>Theme</span>
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <div className={`p-4 rounded-xl border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {user?.email?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {user?.name || user?.email?.split('@')[0]}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Link
                  to="/dashboard"
                  className={`block w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                    isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsSidebarOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 transition-colors ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-red-50'
                  }`}
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Button 
                asChild 
                variant="outline" 
                className={`w-full ${
                  isDarkMode 
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-800' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Link to="/login">Sign In</Link>
              </Button>
              <Button 
                asChild 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                onClick={() => setIsSidebarOpen(false)}
              >
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

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
      image: heroImage
    },
    {
      name: "Fatima Abdullahi",
      course: "Medicine, University of Ibadan",
      text: "The platform guided me through every step. From JAMB registration to final admission - incredible support!",
      image: featureImage
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
    <div className="min-h-screen bg-background text-foreground font-inter">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="animate-fade-in">
                <Badge className="mb-6 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-base px-4 py-1.5 font-semibold">
                  <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                  AI-Powered Education Platform
                </Badge>
                
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
                  <span className="text-foreground">Unlock Your</span>
                  <span className="block bg-gradient-to-r from-primary via-green-500 to-emerald-500 bg-clip-text text-transparent">
                    Academic Potential
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
                  Join over <span className="text-primary font-semibold">2,800+ students</span> who've secured their dream admissions with our cutting-edge AI-powered course recommendations.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 mb-12">
                <Badge variant="secondary" className="flex items-center space-x-2 px-4 py-2 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>850+ Secured Admissions</span>
                </Badge>
                <Badge variant="secondary" className="flex items-center space-x-2 px-4 py-2 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>95% Success Rate</span>
                </Badge>
                <Badge variant="secondary" className="flex items-center space-x-2 px-4 py-2 text-sm">
                  <Brain className="w-4 h-4" />
                  <span>Intelligent Matching</span>
                </Badge>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="px-8 py-4 text-lg font-semibold">
                  <Link to="/register">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold">
                  <Link to="/course-advisor">
                    <Play className="w-5 h-5 mr-2" />
                    Try Course Advisor
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <Card className="overflow-hidden">
                <img 
                  src={featureImage} 
                  alt="Students studying" 
                  className="w-full h-auto object-cover"
                />
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <div className="text-primary">{stat.icon}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.text}</p>
                      <p className="text-2xl font-bold text-primary">{stat.num}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Why Choose InnovaTeam?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of educational guidance with our comprehensive platform designed for Nigerian students.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="text-primary mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Our Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive educational services to support your academic journey from start to finish.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary">{service.badge}</Badge>
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to={service.link}>
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Success Stories
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Hear from students who achieved their dreams with InnovaTeam's guidance.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <img 
                    src={testimonials[currentTestimonial].image} 
                    alt={testimonials[currentTestimonial].name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                  />
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-lg mb-4 italic text-muted-foreground">
                      "{testimonials[currentTestimonial].text}"
                    </p>
                    <div className="font-semibold text-foreground">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-primary font-medium">
                      {testimonials[currentTestimonial].course}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-primary scale-125' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of successful students and discover your perfect academic path today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="px-8 py-4 text-lg">
              <Link to="/register">
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 py-4 text-lg">
              <Link to="/course-advisor">
                Try Course Advisor
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Logo size="md" />
              <p className="text-sm text-muted-foreground">
                Join thousands of students who have achieved their dreams with our comprehensive learning resources and expert guidance.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/course-advisor" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Course Advisor
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    JAMB Services
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Result Checkers
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    AI Examiner
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Newsletter</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Subscribe to our newsletter for updates
              </p>
              <form onSubmit={handleSubscribe} className="space-y-3">
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button type="submit" className="w-full" size="sm">
                  {subscribed ? 'Subscribed!' : 'Subscribe'}
                </Button>
              </form>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} InnovaTeam. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 space-x-4">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;