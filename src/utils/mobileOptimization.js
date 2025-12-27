// Mobile Optimization Utilities
// Use these throughout the app for consistent mobile experience

// 1. Touch-friendly sizes (minimum 44x44px for touch targets)
export const TOUCH_SIZES = {
  button: 'min-h-[44px] min-w-[44px]',
  icon: 'w-6 h-6 md:w-5 md:h-5',
  input: 'min-h-[44px] text-base', // Prevents zoom on iOS
  checkbox: 'w-5 h-5 md:w-4 md:h-4',
};

// 2. Mobile-first spacing
export const MOBILE_SPACING = {
  page: 'p-4 md:p-6 lg:p-8',
  section: 'space-y-4 md:space-y-6',
  card: 'p-4 md:p-6',
  gap: 'gap-3 md:gap-4',
};

// 3. Responsive text sizes
export const TEXT_SIZES = {
  h1: 'text-2xl md:text-3xl lg:text-4xl',
  h2: 'text-xl md:text-2xl lg:text-3xl',
  h3: 'text-lg md:text-xl',
  body: 'text-sm md:text-base',
  small: 'text-xs md:text-sm',
};

// 4. Mobile navigation
export const MOBILE_NAV = {
  height: 'h-16 md:h-20',
  bottom: 'fixed bottom-0 left-0 right-0 md:relative',
  padding: 'pb-safe', // Safe area for iOS notch
};

// 5. Detect mobile device
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768;
};

// 6. Detect touch device
export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// 7. Prevent zoom on iOS
export const preventZoom = () => {
  if (typeof document === 'undefined') return;
  
  const viewport = document.querySelector('meta[name=viewport]');
  if (viewport) {
    viewport.setAttribute(
      'content',
      'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
    );
  }
};

// 8. Enable smooth scrolling
export const enableSmoothScroll = () => {
  if (typeof document === 'undefined') return;
  document.documentElement.style.scrollBehavior = 'smooth';
};

// 9. Haptic feedback (for supported devices)
export const hapticFeedback = (type = 'light') => {
  if (typeof window === 'undefined' || !window.navigator.vibrate) return;
  
  const patterns = {
    light: [10],
    medium: [20],
    heavy: [30],
    success: [10, 50, 10],
    error: [50, 100, 50],
  };
  
  window.navigator.vibrate(patterns[type] || patterns.light);
};

// 10. Safe area insets (for iOS notch)
export const SAFE_AREA = {
  top: 'pt-safe-top',
  bottom: 'pb-safe-bottom',
  left: 'pl-safe-left',
  right: 'pr-safe-right',
};

// 11. Swipe gesture detection
export const useSwipeGesture = (onSwipeLeft, onSwipeRight) => {
  let touchStartX = 0;
  let touchEndX = 0;
  
  const handleTouchStart = (e) => {
    touchStartX = e.changedTouches[0].screenX;
  };
  
  const handleTouchEnd = (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  };
  
  const handleSwipe = () => {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (diff < 0 && onSwipeRight) {
        onSwipeRight();
      }
    }
  };
  
  return { handleTouchStart, handleTouchEnd };
};

// 12. Responsive grid
export const GRID_COLS = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

// 13. Mobile-friendly modal
export const MODAL_CLASSES = {
  overlay: 'fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4',
  content: 'w-full max-h-[90vh] md:max-w-2xl bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-2xl overflow-y-auto',
  handle: 'w-12 h-1 bg-gray-300 rounded-full mx-auto my-3 md:hidden', // Swipe handle
};

// 14. Touch-friendly button
export const BUTTON_CLASSES = {
  base: 'min-h-[44px] px-4 py-2 rounded-lg font-medium transition-all active:scale-95',
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
  icon: 'min-w-[44px] min-h-[44px] flex items-center justify-center',
};

// 15. Responsive container
export const CONTAINER = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';

export default {
  TOUCH_SIZES,
  MOBILE_SPACING,
  TEXT_SIZES,
  MOBILE_NAV,
  isMobile,
  isTouchDevice,
  preventZoom,
  enableSmoothScroll,
  hapticFeedback,
  SAFE_AREA,
  useSwipeGesture,
  GRID_COLS,
  MODAL_CLASSES,
  BUTTON_CLASSES,
  CONTAINER,
};
