const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://innovateam-api.onrender.com/api'  // Your Render.com URL
  : 'http://localhost:5000/api';

export default API_BASE_URL; 