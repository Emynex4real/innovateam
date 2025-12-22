const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production'
    ? 'https://innovateam-api.onrender.com' // ❌ Removed /api
    : 'http://localhost:5000');              // ❌ Removed /api

export { API_BASE_URL };
export default API_BASE_URL;