import { useEffect } from 'react';
import aboutus from '../../images/arewa_gate_about-2.jpg';
import NavBar from '../Home/navBar/index';

const About = () => {
  const qualities = [
    { id: 1, title: 'We are Professional', icon: 'flaticon-reward', description: 'Expert team delivering top-notch services' },
    { id: 2, title: 'Licensed and Certified', icon: 'flaticon-certificate', description: 'Fully accredited and recognized' },
    { id: 3, title: '24/7 Customer Support', icon: 'flaticon-enterprise', description: 'Round-the-clock assistance' },
    { id: 4, title: 'Fast & Secured', icon: 'flaticon-working-team', description: 'Swift and safe operations' },
  ];

  useEffect(() => {
    // Optional: Add animation trigger on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.quality-card').forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background-color">
      <NavBar />
      <main className="py-12 px-4 font-nunito">
        {/* About Section */}
        <section className="max-w-6xl mx-auto py-16 flex flex-col lg:flex-row gap-10 items-center justify-center">
          <div className="lg:w-1/2 flex justify-center">
            <img 
              src={aboutus} 
              alt="About Us" 
              className="w-full max-w-md rounded-2xl shadow-lg object-cover"
              loading="lazy"
            />
          </div>
          <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-text-color">About Us</h1>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed">
              We are a dedicated team committed to empowering individuals through quality education and reliable services. 
              With years of experience, we provide comprehensive solutions tailored to your needs, ensuring excellence 
              and satisfaction in every step. Our mission is to bridge the gap between opportunity and achievement, 
              offering innovative and secure services that make a difference.
            </p>
            <button className="bg-primary-color text-white px-6 py-2 rounded-md font-medium hover:bg-green-600 transition-colors duration-200">
              Learn More
            </button>
          </div>
        </section>

        {/* Qualities Section */}
        <section id="qualities" className="py-16 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-text-color mb-12">Why Choose Us</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {qualities.map((quality) => (
                <div 
                  key={quality.id} 
                  className="quality-card flex flex-col items-center text-center p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
                >
                  <div className="mb-4">
                    <i className={`flat ${quality.icon} text-4xl text-primary-color`}></i>
                  </div>
                  <h5 className="text-lg font-semibold text-text-color mb-2">{quality.title}</h5>
                  <p className="text-gray-600 text-sm">{quality.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;