import React from "react";
import ServicesSection from './services/servicesSection';
import waecResultChecker from '../../../images/waec-result-checker.jpg';
import necoResultChecker from '../../../images/neco-result-checker.jpg';
import nabtebResultChecker from '../../../images/nabteb-result-checker.jpg';
import nbaisResultChecker from '../../../images/nbais-result-checker.jpg';
import bvn from '../../../images/bvn.jpg';
import waecGce from '../../../images/waec-gce.jpg';
import nin from '../../../images/nin.jpg';
import dataSubscription from '../../../images/data-subscription.jpg';
import olevelUpload from '../../../images/olevel-upload.jpg';
import { useState } from "react";
import { useEffect } from "react";
import { data, useNavigate } from "react-router-dom";


// Service data
const servicesData = [
  {
    id: 1,
    title: "WAEC Result Checker",
    image: waecResultChecker,
    price: 3400,
    category: "Exam Scratch Cards",
  },
  {
    id: 2,
    title: "NECO Result Checker",
    image: necoResultChecker,
    price: 1300,
    category: "Exam Scratch Cards",
  },
  {
    id: 3,
    title: "NABTEB Result Checker",
    image: nabtebResultChecker,
    price: 900,
    category: "Exam Scratch Cards",
  },
  {
    id: 4,
    title: "WAEC Verification",
    image: waecGce,
    price: 5000,
    category: "Other Services",
  },
  {
    id: 5,
    title: "NIN Registration",
    image: nin,
    price: 2000,
    category: "Other Services",
  },
  {
    id: 6,
    title: "BVN Verification",
    image: bvn,
    price: 1500,
    category: "Other Services",
  },
  {
    id: 7,
    title: "Data Subscription",
    image: dataSubscription,
    price: 200,
    category: "Data Subscription",
  },
  {
    id: 8,
    title: "O-Level Upload",
    image: olevelUpload,
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