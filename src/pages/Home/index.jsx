import React, { useState, Suspense } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Star, Search, Users, Award } from 'lucide-react';
import { useAuth } from "../../contexts/AuthContext";
import { useDarkMode } from "../../contexts/DarkModeContext";
import whatsapp from "../../images/whatsapp-removebg-preview.png";
import image from "../../images/pexels-cottonbro-6344238.jpg";
import ShareButton from "../../layouts/sharebtn";
import NavBar from "./navBar";
import RecommendedServices from "../../components/RecommendedServices";
import { servicesData } from "./our services";

// Lazy loaded components
const OurServices = React.lazy(() => import("./our services"));
const TeacherSection = React.lazy(() => import('./TeacherSection'));

const Home = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [category, setCategory] = useState('All Resources');
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail("");
    }
  };

  const resourceCategories = [
    { name: 'All Resources', icon: <BookOpen className="w-4 h-4" /> },
    { name: 'Courses', icon: <Users className="w-4 h-4" /> },
    { name: 'Guides', icon: <Star className="w-4 h-4" /> },
  ];

  const mockResources = [
    { id: 1, title: 'Introduction to Programming', category: 'Courses', rating: 4.5 },
    { id: 2, title: 'Study Guide for Exams', category: 'Guides', rating: 4.8 },
    { id: 3, title: 'Web Development Bootcamp', category: 'Courses', rating: 4.9 },
  ];

  const filteredResources = mockResources.filter(
    (resource) =>
      (category === 'All Resources' || resource.category === category) &&
      resource.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { num: "2800+", text: "Students Reached", icon: <Users className="w-6 h-6 text-green-600" /> },
    { num: "850+", text: "Secured Admissions", icon: <Award className="w-6 h-6 text-green-600" /> },
    { num: "2K+", text: "Satisfied Students", icon: <Star className="w-6 h-6 text-green-600" /> },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}>
      <NavBar />
      <main className={`min-h-screen font-nunito ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'} sm:px-10 lg:px-16`}>
        {/* Hero Section */}
        <section className={`py-12 sm:py-16 lg:py-24 ${
          isDarkMode ? 'bg-gradient-to-b from-dark-surface to-dark-bg' : 'bg-gradient-to-b from-white to-gray-100'
        }`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="space-y-6 text-center md:text-left">
                <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight ${
                  isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'
                }`}>
                  Empowering Your Future with <br />
                  <span className="text-green-600">Quality Education</span>
                </h1>
                <p className={`text-base sm:text-lg ${
                  isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
                } font-light`}>
                  Join thousands of students who have achieved their dreams with our comprehensive learning resources.
                </p>

                {/* Resource Category Selector */}
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 justify-center md:justify-start">
                  {resourceCategories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setCategory(cat.name)}
                      className={`flex items-center px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        category === cat.name
                          ? 'bg-green-600 text-white shadow-md'
                          : isDarkMode
                            ? 'bg-dark-surface text-dark-text-secondary hover:bg-dark-border'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {cat.icon}
                      <span className="ml-2">{cat.name}</span>
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative mb-4 max-w-md mx-auto md:mx-0">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a resource..."
                    className={`w-full px-4 py-3 pl-10 rounded-lg border ${
                      isDarkMode
                        ? 'bg-dark-surface border-dark-border text-dark-text-primary placeholder-dark-text-secondary focus:border-primary-500'
                        : 'border-gray-300 focus:ring-2 focus:ring-green-600 text-gray-800'
                    }`}
                    aria-label="Search for a resource"
                  />
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'
                  } w-5 h-5`} />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center md:justify-start">
                  <Link
                    to="/register"
                    className={`flex items-center justify-center px-6 py-3 rounded-full font-semibold shadow-sm transition-all ${
                      isDarkMode
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    } hover:scale-105`}
                    aria-label="Sign up"
                  >
                    Sign Up
                    <ArrowRight size={16} className="ml-2" />
                  </Link>
                  <ShareButton />
                </div>
              </div>

              {/* Updated Teacher Section */}
              <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading...</div>}>
                <TeacherSection />
              </Suspense>
            </div>
          </div>
        </section>

        {/* Resource List */}
        <section className={`py-12 sm:py-16 ${isDarkMode ? 'bg-dark-surface' : 'bg-white'}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className={`text-2xl sm:text-3xl font-bold mb-6 text-center ${
              isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'
            }`}>
              {category} ({filteredResources.length})
            </h2>
            {filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredResources.map((resource) => (
                  <div
                    key={resource.id}
                    className={`p-4 rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 ${
                      isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'
                    }`}
                  >
                    <h3 className={`text-lg font-semibold ${
                      isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                    }`}>{resource.title}</h3>
                    <p className={isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'}>{resource.category}</p>
                    <div className="flex items-center mt-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className={`ml-1 text-sm ${
                        isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
                      }`}>{resource.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-center ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'}`}>
                No resources found for "{searchQuery}" in {category}.
              </p>
            )}
          </div>
        </section>

        {/* Statistics Section */}
        <section className={`py-12 sm:py-16 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.text}
                  className={`${
                    isDarkMode 
                      ? 'bg-dark-surface border border-dark-border' 
                      : 'bg-white'
                  } p-4 rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 text-center`}
                >
                  {stat.icon}
                  <h3 className="text-xl sm:text-2xl font-bold text-green-600 mt-2">{stat.num}</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'}`}>{stat.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Services Section */}
        <section className={`py-12 sm:py-16 ${isDarkMode ? 'bg-dark-surface' : 'bg-white'}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Suspense fallback={
              <div className={`h-96 flex items-center justify-center ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'}`}>
                Loading services...
              </div>
            }>
              <OurServices isAuthenticated={isAuthenticated} />
            </Suspense>
          </div>
        </section>

        {/* Recommended Services Section */}
        {isAuthenticated && (
          <section className={`py-12 sm:py-16 ${isDarkMode ? 'bg-dark-surface' : 'bg-white'}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <RecommendedServices 
                userId={isAuthenticated.id} 
                services={servicesData.map(service => ({
                  ...service,
                  id: service.title.toLowerCase().replace(/\s+/g, '-')
                }))} 
              />
            </div>
          </section>
        )}

        {/* Success Stories Section */}
        <section className={`py-12 sm:py-16 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className={`text-2xl sm:text-3xl font-bold text-center mb-8 ${
              isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'
            }`}>
              Success Stories
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className={`flex flex-col items-center ${
                isDarkMode ? 'bg-dark-surface' : 'bg-white'
              } p-6 rounded-lg shadow-xl`}>
                <img
                  src={image}
                  alt="Success Stories"
                  className="w-full max-w-xs sm:max-w-sm rounded-lg shadow-xl mb-4"
                />
                <p className={`text-xl font-semibold ${
                  isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                }`}>850+ Admissions Secured</p>
                <p className={`text-sm text-center mt-2 ${
                  isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
                }`}>
                  Our platform has helped students gain admission to top schools worldwide.
                </p>
              </div>
              <div className={`flex flex-col items-center ${
                isDarkMode ? 'bg-dark-surface' : 'bg-white'
              } p-6 rounded-lg shadow-xl`}>
                <img
                  src={image}
                  alt="Student Achievements"
                  className="w-full max-w-xs sm:max-w-sm rounded-lg shadow-xl mb-4"
                />
                <p className={`text-xl font-semibold ${
                  isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                }`}>95% Success Rate</p>
                <p className={`text-sm text-center mt-2 ${
                  isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
                }`}>
                  Most of our students achieve their academic goals with our support.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter and Contact Section */}
        <section className={`py-12 sm:py-16 ${isDarkMode ? 'bg-dark-surface' : 'bg-gray-100'}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
              <div className={`${
                isDarkMode 
                  ? 'bg-green-800 border border-green-700' 
                  : 'bg-green-600'
              } text-white p-6 sm:p-8 rounded-2xl shadow-xl`}>
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
                <p className="mb-4 text-white/90 text-sm sm:text-base">
                  Stay updated with the latest educational resources and updates.
                </p>
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your Email Address"
                    className="w-full px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all"
                  >
                    {subscribed ? "Subscribed!" : "Subscribe"}
                  </button>
                </form>
              </div>
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl text-center">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">Quick Contact</h2>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  Reach out for inquiries or support anytime.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <img src={whatsapp} alt="WhatsApp" className="w-8 h-8" />
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    +234 803 377 2750
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;