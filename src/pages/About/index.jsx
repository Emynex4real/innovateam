import React from 'react';
import { Award, Shield, Clock, Zap, Users, Target, BookOpen, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import NavBar from '../Home/navBar/index';
import aboutus from '../../images/arewa_gate_about-2.jpg';
import { Link } from 'react-router-dom';

const About = () => {
  const qualities = [
    { 
      icon: <Award className="w-8 h-8" />, 
      title: 'Professional Excellence', 
      description: 'Expert team delivering top-notch educational services with proven track record' 
    },
    { 
      icon: <Shield className="w-8 h-8" />, 
      title: 'Licensed & Certified', 
      description: 'Fully accredited and recognized by educational authorities' 
    },
    { 
      icon: <Clock className="w-8 h-8" />, 
      title: '24/7 Support', 
      description: 'Round-the-clock assistance for all your educational needs' 
    },
    { 
      icon: <Zap className="w-8 h-8" />, 
      title: 'Fast & Secure', 
      description: 'Swift processing with enterprise-grade security measures' 
    },
  ];

  const stats = [
    { number: '2,800+', label: 'Students Helped' },
    { number: '850+', label: 'Admissions Secured' },
    { number: '95%', label: 'Success Rate' },
    { number: '5+', label: 'Years Experience' }
  ];

  const values = [
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Our Mission',
      description: 'To democratize access to quality education and empower every Nigerian student to achieve their academic dreams through innovative technology and personalized guidance.'
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Our Vision',
      description: 'To become Nigeria\'s leading educational technology platform, transforming how students navigate their academic journey from secondary school to university.'
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: 'Our Values',
      description: 'Excellence, Innovation, Integrity, and Student-centricity guide everything we do. We believe every student deserves the best possible chance at success.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-primary/10 border border-primary/20 text-primary">
              <Users className="w-4 h-4 mr-2" />
              About InnovaTeam
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Empowering <span className="bg-gradient-to-r from-primary to-green-500 bg-clip-text text-transparent">Education</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We're dedicated to transforming the educational landscape in Nigeria through innovative technology and personalized guidance.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Bridging Dreams and Reality
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                InnovaTeam was founded with a simple yet powerful vision: to ensure that every Nigerian student has access to the guidance and resources they need to succeed academically.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Through our AI-powered course advisor, comprehensive JAMB services, and dedicated support team, we've helped thousands of students navigate their educational journey and secure admissions to their dream institutions.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>AI-Powered Recommendations</span>
                </Badge>
                <Badge variant="secondary" className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Comprehensive Services</span>
                </Badge>
                <Badge variant="secondary" className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Expert Support</span>
                </Badge>
              </div>
              <Button asChild size="lg">
                <Link to="/course-advisor">
                  Try Course Advisor
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <Card className="overflow-hidden">
                <img 
                  src={aboutus} 
                  alt="About InnovaTeam" 
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
          <div className="grid md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              Our Mission, Vision & Values
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide our commitment to educational excellence
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-6">
                    <div className="text-primary">{value.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              Why Choose InnovaTeam?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover what makes us the preferred choice for thousands of students
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {qualities.map((quality, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                    <div className="text-primary">{quality.icon}</div>
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{quality.title}</h3>
                  <p className="text-muted-foreground text-sm">{quality.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of successful students and discover your perfect academic path today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/register">
                Get Started Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;