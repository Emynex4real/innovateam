import React from "react";
import ServicesSection from './services/servicesSection';

// Service data
const servicesData = [
  {
    id: 1,
    title: "WAEC Result Checker",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=500&h=300",
    price: 3400,
    category: "Exam Scratch Cards",
  },
  {
    id: 2,
    title: "NECO Result Checker",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=500&h=300",
    price: 1300,
    category: "Exam Scratch Cards",
  },
  {
    id: 3,
    title: "NABTEB Result Checker",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=500&h=300",
    price: 900,
    category: "Exam Scratch Cards",
  },
  {
    id: 4,
    title: "WAEC Verification",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=500&h=300",
    price: 5000,
    category: "Other Services",
  },
  {
    id: 5,
    title: "NIN Registration",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=500&h=300",
    price: 2000,
    category: "Other Services",
  },
  {
    id: 6,
    title: "BVN Verification",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=500&h=300",
    price: 1500,
    category: "Other Services",
  },
  {
    id: 7,
    title: "Data Subscription",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=500&h=300",
    price: 200,
    category: "Data Subscription",
  },
  {
    id: 8,
    title: "O-Level Upload",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=500&h=300",
    price: 1000,
    category: "Other Services",
  },
];

const Index = ({ isAuthenticated }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <ServicesSection services={servicesData} isAuthenticated={isAuthenticated} />
    </div>
  );
};

export default Index;