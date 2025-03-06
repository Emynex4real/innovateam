import { useState } from "react";
import waecchecker from "../../../images/waec-result-checker.jpg";
import necochecker from "../../../images/neco-result-checker.jpg";
import nabtebchecker from "../../../images/nabteb-result-checker.jpg";
import waecverification from "../../../images/waec-verification.jpg";
import nin from "../../../images/nin.jpg";
import bvn from "../../../images/bvn.jpg";
import datasubscription from "../../../images/data-subscription.jpg";
import olevelupload from "../../../images/olevel-upload.jpg";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useAuth } from "../../../components/auth";

const servicesData = [
  { id: 1, title: "WAEC Result Checker", image: waecchecker, price: 3400, category: "Exam Scratch Cards" },
  { id: 2, title: "NECO Result Checker", image: necochecker, price: 1300, category: "Exam Scratch Cards" },
  { id: 3, title: "NABTEB Result Checker", image: nabtebchecker, price: 900, category: "Exam Scratch Cards" },
  { id: 4, title: "WAEC Verification", image: waecverification, price: 5000, category: "Other Services" },
  { id: 5, title: "NIN Registration", image: nin, price: 2000, category: "Other Services" },
  { id: 6, title: "BVN Verification", image: bvn, price: 1500, category: "Other Services" },
  { id: 7, title: "Data Subscription", image: datasubscription, price: 200, category: "Data Subscription" },
  { id: 8, title: "O-Level Upload", image: olevelupload, price: 1000, category: "Other Services" },
];

const OurServices = () => {
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate(); // Add useNavigate
  const { isAuthenticated } = useAuth(); // Add useAuth to check auth status

  const filteredServices = filter === "All"
    ? servicesData
    : servicesData.filter((service) => service.category === filter);

  const categories = ["All", "Exam Scratch Cards", "Data Subscription", "Other Services"];

  const handleProceed = (title) => {
    if (isAuthenticated) {
      // Navigate to dashboard for logged-in users
      navigate("/homepage", { state: { service: title } }); // Optional: pass service title
    } else {
      // Navigate to login for non-logged-in users
      navigate("/login", { state: { service: title } }); // Optional: pass service title
    }
  };

  return (
    <section className="py-12 px-4 font-nunito bg-background-color">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-center text-text-color mb-8">
          Our Services
        </h1>

        {/* Filter Tabs */}
        <div className="mb-10 flex justify-center">
          <ul className="flex flex-wrap gap-4 justify-center items-center">
            {categories.map((category) => (
              <li
                key={category}
                className={`px-4 py-2 rounded-md cursor-pointer transition-colors duration-200 text-sm md:text-base font-medium
                  ${filter === category
                    ? "bg-primary-color text-white bg-green-500"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"}`}
                onClick={() => setFilter(category)}
              >
                {category}
              </li>
            ))}
          </ul>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 services-box">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="flex flex-col bg-white rounded-lg border border-gray-200 transition-shadow duration-200 hover:shadow-md"
            >
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-40 object-cover rounded-t-lg"
                loading="lazy"
              />
              <div className="p-4 flex flex-col gap-3">
                <h2 className="text-lg font-semibold text-text-color line-clamp-1">
                  {service.title}
                </h2>
                <p className="text-base font-medium text-gray-800">
                  ₦ {service.price.toLocaleString()}.00
                </p>
                <button
                  className="bg-green-500 w-full py-2 bg-primary-color text-white rounded-md font-medium hover:bg-green-600 transition-colors duration-200"
                  onClick={() => handleProceed(service.title)}
                >
                  Proceed
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-600 text-base">No services available in this category.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default OurServices;