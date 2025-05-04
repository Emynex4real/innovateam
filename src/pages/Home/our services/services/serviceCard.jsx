import React from "react";
import { ChevronRight } from "lucide-react";

const ServiceCard = ({ id, title, image, price, category, onProceed }) => {
  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-lg transition-all">
      <div className="relative overflow-hidden rounded-t-2xl">
        <img
          src={image}
          alt={title}
          className="w-full h-40 sm:h-48 object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-block px-2 py-1 bg-white/80 text-gray-800 text-xs font-medium rounded-md">
            {category}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-2">{title}</h3>

        <div className="flex justify-between items-center mt-2 sm:mt-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm text-gray-500">Price:</span>
            <span className="font-bold text-green-600">₦{price.toLocaleString()}</span>
          </div>

          <button
            on onClick={() => onProceed(title)}
            className="flex items-center gap-1 text-green-600 font-medium hover:underline transition-all"
          >
            Get Access
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={() => onProceed(title)}
          className="mt-3 sm:mt-4 w-full py-2 sm:py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all flex items-center justify-center gap-2"
        >
          Proceed Now
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;