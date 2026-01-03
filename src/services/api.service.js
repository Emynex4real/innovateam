/**
 * API Service with backend integration
 * Features: Auth injection, File Upload support, Better Error Handling
 */
class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    this.csrfToken = null;
  }

  async getCSRFToken() {
    if (!this.csrfToken) {
      try {
        const response = await fetch(`${this.baseURL}/api/csrf-token`);
        const data = await response.json();
        this.csrfToken = data.csrfToken;
      } catch (error) {
        console.warn('CSRF token fetch failed:', error);
      }
    }
    return this.csrfToken;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // 1. Get Authentication Token
    // Checks for standard auth_token first, then falls back to Supabase session
    let token = localStorage.getItem('auth_token');
    if (!token) {
      // Note: This key is specific to your Supabase project
      const supabaseSession = localStorage.getItem('sb-jdedscbvbkjvqmmdabig-auth-token');
      if (supabaseSession) {
        try {
          const sessionData = JSON.parse(supabaseSession);
          token = sessionData.access_token;
        } catch (e) {
          console.warn('Failed to parse Supabase session');
        }
      }
    }
    
    // 2. Prepare Headers
    const headers = { ...options.headers };

    // HANDLE FILE UPLOADS:
    // Only set 'Content-Type': 'application/json' if we are NOT sending FormData.
    // When sending FormData (files), the browser automatically sets the Content-Type to 'multipart/form-data' with the correct boundary.
    // CRITICAL: Never manually set Content-Type for FormData - browser handles it
    if (options.body instanceof FormData) {
      // Remove Content-Type if accidentally set - browser will add correct multipart boundary
      delete headers['Content-Type'];
    } else if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // 3. CSRF Protection
    // Skip CSRF for AI Examiner endpoints if necessary, or for non-mutating requests
    if (options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method) && !endpoint.includes('/ai-examiner')) {
      const csrfToken = await this.getCSRFToken();
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken;
      }
    }

    try {
      const response = await fetch(url, {
        method: options.method,
        headers,
        body: options.body
      });

      // 4. Unified Error Handling
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          // Try to extract the specific message from the backend
          errorMessage = errorData.message || errorData.error || errorData.details || errorMessage;
        } catch (e) { 
          // If response isn't JSON, use the default status text
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      // Log the error for debugging, but re-throw it so the UI handles it
      console.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    const isFormData = data instanceof FormData;
    return this.request(endpoint, {
      method: 'POST',
      // If it's FormData, pass it directly. If it's an object, stringify it.
      body: isFormData ? data : JSON.stringify(data),
      ...options
    });
  }

  async put(endpoint, data, options = {}) {
    const isFormData = data instanceof FormData;
    return this.request(endpoint, {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
      ...options
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  async healthCheck() {
    try {
      return await this.get('/health');
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }
}

const apiService = new ApiService();
export default apiService;