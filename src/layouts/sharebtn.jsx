import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { FiLink } from 'react-icons/fi';

// Share Icon
const ShareIcon = () => (
  <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
  </svg>
);

// Social Media Icons
const TwitterIcon = () => (
  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="w-5 h-5 fill-white" viewBox="0 0 16 16">
    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.920l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
  </svg>
);

const ShareButton = ({
  url = window.location.href,
  message = 'Check out this page!',
  tooltipPosition = 'bottom'
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const timeoutRef = useRef(null);

  // Handle click outside to close tooltip
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsTooltipVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Handle hover with a delay to prevent flickering
  const handleHoverStart = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsTooltipVisible(true);
  };

  const handleHoverEnd = () => {
    timeoutRef.current = setTimeout(() => {
      setIsTooltipVisible(false);
    }, 300); // 300ms delay before closing
  };

  // Handle click to toggle tooltip visibility
  const handleClick = () => {
    setIsTooltipVisible((prev) => !prev);
  };

  // Handle copy link functionality
  const handleCopyLink = async (e) => {
    if (e) e.preventDefault(); // Prevent default behavior for the email link
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  // Tooltip position styles
  const positionStyles = {
    bottom: 'top-14 left-1/2 transform -translate-x-1/2',
    top: 'bottom-14 left-1/2 transform -translate-x-1/2',
    left: 'top-1/2 right-14 transform -translate-y-1/2',
    right: 'top-1/2 left-14 transform -translate-y-1/2',
  };

  // Tooltip arrow styles
  const arrowStyles = {
    bottom: 'before:content-[""] before:absolute before:top-[-8px] before:left-1/2 before:transform before:-translate-x-1/2 before:border-8 before:border-transparent before:border-b-gray-800',
    top: 'before:content-[""] before:absolute before:bottom-[-8px] before:left-1/2 before:transform before:-translate-x-1/2 before:border-8 before:border-transparent before:border-t-gray-800',
    left: 'before:content-[""] before:absolute before:top-1/2 before:right-[-8px] before:transform before:-translate-y-1/2 before:border-8 before:border-transparent before:border-l-gray-800',
    right: 'before:content-[""] before:absolute before:top-1/2 before:left-[-8px] before:transform before:-translate-y-1/2 before:border-8 before:border-transparent before:border-r-gray-800',
  };

  // Share links for each platform
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(message)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(message + ' ' + url)}`,
    email: `mailto:?subject=${encodeURIComponent(message)}&body=${encodeURIComponent(url)}`,
  };

  // Stagger animation for social icons
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        duration: 0.2,
        ease: 'easeInOut',
      },
    },
    exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Share Button */}
      <motion.button
        ref={buttonRef}
        className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
        onMouseEnter={handleHoverStart}
        onMouseLeave={handleHoverEnd}
        onClick={handleClick}
        onFocus={handleHoverStart}
        onBlur={handleHoverEnd}
        whileTap={{ scale: 0.95 }}
        aria-label="Share this page on social media"
        aria-expanded={isTooltipVisible}
      >
        <ShareIcon />
      </motion.button>

      {/* Tooltip with Social Icons */}
      <AnimatePresence>
        {isTooltipVisible && (
          <motion.div
            className={`absolute ${positionStyles[tooltipPosition]} ${arrowStyles[tooltipPosition]} bg-gray-800 rounded-lg shadow-lg p-2 flex gap-2 z-50`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onMouseEnter={handleHoverStart} // Keep tooltip open when hovering over it
            onMouseLeave={handleHoverEnd} // Close tooltip when leaving
            role="tooltip"
            aria-hidden={!isTooltipVisible}
          >
            {[
              { platform: 'twitter', icon: <TwitterIcon />, link: shareLinks.twitter, color: '[#1DA1F2]', hoverColor: '[#179BF0]' },
              { platform: 'facebook', icon: <FacebookIcon />, link: shareLinks.facebook, color: '[#1877F2]', hoverColor: '[#1566D8]' },
              { platform: 'linkedin', icon: <LinkedInIcon />, link: shareLinks.linkedin, color: '[#0A66C2]', hoverColor: '[#085BB0]' },
              { platform: 'whatsapp', icon: <WhatsAppIcon />, link: shareLinks.whatsapp, color: '[#25D366]', hoverColor: '[#20B858]' },
              { platform: 'email', icon: <FiLink className="w-5 h-5 text-white" />, link: shareLinks.email, color: '[#6B7280]', hoverColor: '[#5B616B]' },
            ].map(({ platform, icon, link, color, hoverColor }) => (
              <motion.a
                key={platform}
                href={platform === 'email' ? undefined : link}
                target={platform === 'email' ? '_self' : '_blank'}
                rel={platform === 'email' ? undefined : 'noopener noreferrer'}
                onClick={platform === 'email' ? handleCopyLink : undefined}
                className={`flex items-center justify-center w-8 h-8 bg-${color} rounded-full hover:bg-${hoverColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color} transition-transform duration-200`}
                variants={itemVariants}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={
                  platform === 'email'
                    ? isCopied
                      ? 'Link copied to clipboard'
                      : 'Copy link to clipboard'
                    : `Share on ${platform.charAt(0).toUpperCase() + platform.slice(1)}`
                }
              >
                {icon}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback for Copy Link */}
      {isCopied && (
        <motion.div
          className="absolute top-[-40px] left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-sm px-3 py-1 rounded-lg shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          Link Copied!
        </motion.div>
      )}
    </div>
  );
};

ShareButton.propTypes = {
  url: PropTypes.string,
  message: PropTypes.string,
  tooltipPosition: PropTypes.oneOf(['top', 'bottom', 'left', 'right'])
};

export default ShareButton;