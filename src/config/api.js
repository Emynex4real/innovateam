// Base URL without /api suffix - routes will add their own prefixes
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production'
    ? 'https://innovateam-api.onrender.com'
    : 'http://localhost:5000');

// Remove trailing /api if present (for backward compatibility)
const cleanBaseUrl = API_BASE_URL.replace(/\/api\/?$/, '');

export { cleanBaseUrl as API_BASE_URL };
export default cleanBaseUrl;