import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiChevronUp, FiSearch } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const Accordion = ({ items, allowMultiple = false }) => {
  // State for active accordion items (array for multiple, single index for single mode)
  const [activeIndices, setActiveIndices] = useState(() => {
    const saved = localStorage.getItem('accordionState');
    return saved ? JSON.parse(saved) : allowMultiple ? [] : null;
  });

  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  // Ref for search input to manage focus
  const searchInputRef = useRef(null);

  // Persist activeIndices to localStorage
  useEffect(() => {
    localStorage.setItem('accordionState', JSON.stringify(activeIndices));
  }, [activeIndices]);

  // Handle accordion item toggle
  const handleClick = (index) => {
    if (allowMultiple) {
      setActiveIndices((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );
    } else {
      setActiveIndices((prev) => (prev === index ? null : index));
    }
  };

  // Expand all items
  const expandAll = () => {
    if (allowMultiple) {
      setActiveIndices([...items, contactItem].map((_, index) => index));
    } else {
      setActiveIndices(0); // Expand the first item in single mode
    }
  };

  // Collapse all items
  const collapseAll = () => {
    setActiveIndices(allowMultiple ? [] : null);
  };

  // Highlight search terms in text
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 text-gray-800">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Filter items based on search query
  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.content && typeof item.content === 'string' && item.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.content1 && item.content1.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.content2 && item.content2.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Contact section as an accordion item
  const contactItem = {
    title: 'Need More Help?',
    content: (
      <div className="text-center">
        <p className="text-gray-700 mb-4">
          If you do not find the answer to your question listed within our FAQs,
          you can always contact us directly at:
        </p>
        <a
          href="mailto:support@innovateamnigeria.com"
          className="block text-xl text-green-600 font-bold hover:underline transition-colors duration-300"
          aria-label="Email support at innovateamnigeria.com"
        >
          support@innovateamnigeria.com
        </a>
        <a
          href="tel:+2348033772750"
          className="block text-xl text-green-600 font-bold hover:underline transition-colors duration-300"
          aria-label="Call support at +234 803 377 2750"
        >
          +234 803 377 2750
        </a>
      </div>
    ),
  };

  // Animation variants for the accordion content
  const contentVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: 'auto',
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeInOut' },
    },
    exit: { height: 0, opacity: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
  };

  return (
    <div className="w-5/6 mx-auto mt-10 font-nunito">
      {/* Search Bar and Expand/Collapse Buttons */}
      <div className="mb-8 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full sm:w-auto">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
            aria-label="Search FAQs"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            aria-label="Expand all FAQs"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Collapse all FAQs"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Accordion Items */}
      {filteredItems.length > 0 || searchQuery === '' ? (
        [...filteredItems, ...(searchQuery === '' ? [contactItem] : [])].map((item, index) => {
          const isOpen = allowMultiple
            ? activeIndices.includes(index)
            : activeIndices === index;

          return (
            <div
              key={index}
              className="border border-gray-300 rounded-lg mb-4 shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <button
                className="w-full flex justify-between items-center p-5 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-100 focus:ring-offset-2"
                onClick={() => handleClick(index)}
                aria-expanded={isOpen}
                aria-controls={`accordion-content-${index}`}
                id={`accordion-header-${index}`}
              >
                <span className="text-lg font-semibold text-gray-800 text-left">
                  {highlightText(item.title, searchQuery)}
                </span>
                <motion.span
                  className="text-xl text-gray-600"
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                </motion.span>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    id={`accordion-content-${index}`}
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="overflow-hidden"
                    role="region"
                    aria-labelledby={`accordion-header-${index}`}
                  >
                    <div className="p-5 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                      {item.content && typeof item.content === 'string' ? (
                        <p className="text-gray-700 leading-relaxed mb-2">
                          {highlightText(item.content, searchQuery)}
                        </p>
                      ) : (
                        item.content
                      )}
                      {item.content1 && (
                        <p className="text-gray-700 leading-relaxed mb-2">
                          {highlightText(item.content1, searchQuery)}
                        </p>
                      )}
                      {item.content2 && (
                        <p className="text-gray-700 leading-relaxed">
                          {highlightText(item.content2, searchQuery)}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })
      ) : (
        <div className="text-center text-gray-600 py-4">
          No FAQs found matching your search.
        </div>
      )}
    </div>
  );
};

// PropTypes for type safety
Accordion.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
      content1: PropTypes.string,
      content2: PropTypes.string,
    })
  ).isRequired,
  allowMultiple: PropTypes.bool,
};

Accordion.defaultProps = {
  allowMultiple: false,
};

export default Accordion;