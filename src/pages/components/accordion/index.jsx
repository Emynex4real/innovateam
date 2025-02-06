import React, { useState } from "react";

const Accordion = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleClick = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-[600px] mx-auto">
      {items.map((item, index) => (
        <div key={item.title} className="border border-gray-300 rounded-lg mb-3">
          <button
            className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            onClick={() => handleClick(index)}
            aria-expanded={activeIndex === index}
            aria-controls={`accordion-content-${index}`}
          >
            <span className="text-lg font-medium">{item.title}</span>
            <span className="text-xl">
              {activeIndex === index ? "-" : "+"}
            </span>
          </button>
          {activeIndex === index && (
            <div
              id={`accordion-content-${index}`}
              className="p-4 bg-white border-t border-gray-200"
              aria-hidden={activeIndex !== index}
            >
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Accordion;