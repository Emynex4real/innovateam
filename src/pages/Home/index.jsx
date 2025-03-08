import whatsapp from "../../images/whatsapp-removebg-preview.png";
import image from "../../images/pexels-cottonbro-6344238.jpg";
import OurServices from "./our services";
import Data from "./../accordion/data";
import { Link, useNavigate } from "react-router-dom"; // Changed from Link to useNavigate
import { useState } from "react";
import { useAuth } from "../../components/auth";

const Home = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail("");
    }
  };

  const handleProceed = () => {
    if (isAuthenticated) {
      navigate("/homepage"); // Direct to dashboard if logged in
    } else {
      navigate("/login"); // Direct to login if not logged in
    }
  };

  return (
    <main className="min-h-screen font-nunito">
      <section className="background-color py-16 md:py-24 overflow-hidden">
        <div className="container-box mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 animate-fade-in">
            <div className="lg:w-1/2 content-text space-y-6 text-center lg:text-left">
              <h1 className="header text-3xl md:text-4xl lg:text-5xl font-bold text-text-color">
                Empowering Your Future with Quality Education
              </h1>
              <p className="text-lg md:text-xl text-gray-600">
                Join thousands of students who have achieved their dreams with our comprehensive learning resources and expert guidance.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start items-center">
              <Link to={'/signup'}>
                <button className="animated-button">
                  <svg className="arr-2" viewBox="0 0 24 24">
                    <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                  </svg>
                  <span className="text">Sign Up</span>
                  <span className="circle" />
                  <svg className="arr-1" viewBox="0 0 24 24">
                    <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                  </svg>
                </button>
              
              </Link>
                <div className="tooltip-container">
                  <div className="button-content">
                    <svg className="share-icon" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10z"/>
                    </svg>
                  </div>
                  <div className="tooltip-content">
                    <div className="social-icons">
                      {[
                        { platform: 'twitter', path: 'M23.953 4.57...' },
                        { platform: 'facebook', path: 'M24 12.073...' },
                        { platform: 'linkedin', path: 'M20.447 20.452...' }
                      ].map(({ platform, path }) => (
                        <a key={platform} href="#" className={`social-icon ${platform}`}>
                          <svg viewBox="0 0 24 24">
                            <path d={path} />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 space-y-8">
              <img src={image} alt="Education" className="image mx-auto shadow-2xl" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {[
                  { num: "2800+", text: "Students Reached" },
                  { num: "1.5K+", text: "Active Users" },
                  { num: "850+", text: "Secured Admission" },
                  { num: "2K+", text: "Satisfied Students" },
                ].map((stat) => (
                  <div key={stat.text} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="text-xl md:text-2xl font-bold text-primary-color">{stat.num}</h3>
                    <p className="text-sm text-gray-600">{stat.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-background-color">
        <div className="container-box mx-auto px-4">
          <OurServices />
        </div>
      </section>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Data />
        </div>
      </section>
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-primary-color bg-green-500 text-white p-8 rounded-2xl shadow-xl animate-fade-in-up">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Subscribe Our Newsletter</h2>
              <p className="mb-6 text-white/90">
                Stay updated with our latest resources and educational content
              </p>
              <form onSubmit={handleSubscribe} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your Email Address"
                  className="w-full px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-white text-green-500 text-primary-color px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-all duration-300"
                >
                  {subscribed ? "Subscribed!" : "Subscribe"}
                </button>
              </form>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center animate-fade-in-up">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-text-color">Quick Contact</h2>
              <p className="text-gray-600 mb-6">
                Reach out for inquiries or support anytime
              </p>
              <div className="flex items-center justify-center gap-3">
                <img src={whatsapp} alt="WhatsApp" className="w-8 h-8" />
                <p className="text-2xl md:text-3xl font-bold text-primary-color">
                  +234 803 377 2750
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;