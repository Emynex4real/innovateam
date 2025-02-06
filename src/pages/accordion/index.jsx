import React, { useState } from "react";

const Accordion = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleClick = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="w-5/6 mx-auto">
      {items.map((item, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-lg mb-4 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <button
            className="w-full flex justify-between items-center p-5 bg-white hover:bg-gray-50 rounded-lg transition-colors duration-200 focus:outline-none"
            onClick={() => handleClick(index)}
            aria-expanded={activeIndex === index}
            aria-controls={`accordion-content-${index}`}
          >
            <span className="text-lg font-semibold text-gray-800 text-left">
              {item.title}
            </span>
            <span
              className={`text-xl text-gray-600 transform transition-transform duration-200 ${
                activeIndex === index ? "rotate-180" : "rotate-0"
              }`}
            >
              {activeIndex === index ? "−" : "+"}
            </span>
          </button>
          <div
            id={`accordion-content-${index}`}
            className={`overflow-hidden transition-all duration-200 ease-in-out ${
              activeIndex === index ? "max-h-[500px]" : "max-h-0"
            }`}
            aria-hidden={activeIndex !== index}
          >
            <div className="p-5 bg-gray-50 border-t border-gray-100 rounded-b-lg">
              <p className="text-gray-700 leading-relaxed">{item?.content}</p>
              <p className="text-gray-700 leading-relaxed">{item?.content1}</p>
              <p className="text-gray-700 leading-relaxed">{item?.content2}</p>
            </div>
          </div>
        </div>
      ))}
      <div className="text-center flex gap-3 flex-col mt-20">
        <p className="text-2xl">
          If you do not find the answer to your question listed within our
          FAQ's, you can always contact us directly at
        </p>
        <h1 className="text-3xl text-green-500">innovateamnigeria.com</h1>
        <h1 className="text-3xl text-green-500">+234 803 377 2750</h1>
      </div>
    </div>
  );
};

export default Accordion;
